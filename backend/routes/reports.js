// Report Routes for FlacronAI API
const express = require('express');
const router = express.Router();
const { generateInsuranceReport, analyzeDamageImages } = require('../services/geminiService');
const { createReport, getReportById, getUserReports, updateReport, deleteReport, checkUserLimits, trackReportUsage } = require('../services/reportService');
const { uploadImage, uploadReportDocument } = require('../config/storage');
const { generateDOCX, generatePDF, generateHTML } = require('../utils/documentGenerator');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * POST /api/reports/generate
 * Generate new insurance report (PROTECTED - requires authentication)
 */
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const reportData = req.body;

    // Validate required fields
    if (!reportData.claimNumber || !reportData.insuredName || !reportData.lossType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: claimNumber, insuredName, lossType'
      });
    }

    // Check user tier limits
    const limitsCheck = await checkUserLimits(userId);
    if (!limitsCheck.canGenerate) {
      return res.status(403).json({
        success: false,
        error: `Report limit reached for ${limitsCheck.tier} tier. Used: ${limitsCheck.reportsUsed}/${limitsCheck.reportsLimit}`
      });
    }

    // Generate report with Gemini AI
    console.log('Generating report for claim:', reportData.claimNumber);
    const aiResult = await generateInsuranceReport(reportData);

    if (!aiResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate report with AI'
      });
    }

    // Save report to database
    const saveResult = await createReport(userId, reportData, aiResult.content);

    if (!saveResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save report'
      });
    }

    // Track usage
    await trackReportUsage(userId);

    res.json({
      success: true,
      reportId: saveResult.reportId,
      report: saveResult.report,
      message: 'Report generated successfully'
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports/:id
 * Get specific report by ID (PROTECTED - requires authentication)
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reportId = req.params.id;

    const result = await getReportById(reportId, userId);

    if (!result.success) {
      return res.status(result.error === 'Report not found' ? 404 : 403).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/reports
 * Get all reports for current user (PROTECTED - requires authentication)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await getUserReports(userId, limit, offset);

    res.json(result);

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/reports/:id
 * Update report (PROTECTED - requires authentication)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reportId = req.params.id;
    const updates = req.body;

    const result = await updateReport(reportId, userId, updates);

    if (!result.success) {
      return res.status(result.error === 'Report not found' ? 404 : 403).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/reports/:id
 * Delete report (PROTECTED - requires authentication)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reportId = req.params.id;

    const result = await deleteReport(reportId, userId);

    if (!result.success) {
      return res.status(result.error === 'Report not found' ? 404 : 403).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/reports/:id/export
 * Export report to DOCX, PDF, or HTML (PROTECTED - requires authentication)
 */
router.post('/:id/export', authenticateToken, async (req, res) => {
  try {
    console.log('📤 Export endpoint hit - reportId:', req.params.id, 'format:', req.body.format);
    const userId = req.user.userId;
    const reportId = req.params.id;
    const format = req.body.format || 'docx'; // docx, pdf, or html

    console.log('User ID:', userId, 'Report ID:', reportId, 'Format:', format);

    // Get report
    const reportResult = await getReportById(reportId, userId);
    if (!reportResult.success) {
      return res.status(404).json(reportResult);
    }

    const report = reportResult.report;
    const reportData = {
      claimNumber: report.claimNumber,
      insuredName: report.insuredName,
      propertyAddress: report.propertyAddress,
      lossDate: report.lossDate,
      lossType: report.lossType,
      reportType: report.reportType
    };

    let exportResult;

    switch (format.toLowerCase()) {
      case 'pdf':
        exportResult = await generatePDF(reportData, report.content);
        break;
      case 'html':
        exportResult = generateHTML(reportData, report.content);
        break;
      case 'docx':
      default:
        exportResult = await generateDOCX(reportData, report.content);
        break;
    }

    if (!exportResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to export report'
      });
    }

    // Upload to Firebase Storage
    if (format.toLowerCase() !== 'html') {
      const uploadResult = await uploadReportDocument(
        exportResult.buffer,
        exportResult.fileName,
        userId,
        reportId
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to upload exported report'
        });
      }

      res.json({
        success: true,
        fileName: uploadResult.fileName,
        url: uploadResult.url,
        format: format
      });
    } else {
      // For HTML, return the content directly
      res.json({
        success: true,
        html: exportResult.html,
        fileName: exportResult.fileName,
        format: 'html'
      });
    }

  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/reports/:id/images
 * Upload images for a report (PROTECTED - requires authentication)
 */
router.post('/:id/images', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const userId = req.user.userId;
    const reportId = req.params.id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images provided'
      });
    }

    // Upload images to Firebase Storage
    const uploadPromises = files.map(file =>
      uploadImage({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype
      }, userId, reportId)
    );

    const uploadResults = await Promise.all(uploadPromises);

    const successfulUploads = uploadResults.filter(r => r.success);

    res.json({
      success: true,
      uploaded: successfulUploads.length,
      total: files.length,
      images: successfulUploads
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/reports/analyze-images
 * Analyze damage images with AI (PROTECTED - requires authentication)
 */
router.post('/analyze-images', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images provided'
      });
    }

    const images = files.map((file, index) => ({
      id: `image_${index}`,
      name: file.originalname,
      data: file.buffer.toString('base64')
    }));

    const result = await analyzeDamageImages(images);

    res.json(result);

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
