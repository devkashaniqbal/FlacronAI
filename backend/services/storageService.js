// Local File Storage Service for FlacronAI
// Uses local filesystem instead of Firebase Storage (no billing required)
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Base directory for uploads
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Ensure directory exists
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Upload image to local storage
 */
async function uploadImage(file, userId, reportId) {
  try {
    const userDir = path.join(UPLOAD_DIR, userId, reportId);
    await ensureDirectory(userDir);

    const uniqueFileName = `${uuidv4()}_${file.originalname}`;
    const filePath = path.join(userDir, uniqueFileName);
    const relativePath = path.join(userId, reportId, uniqueFileName);

    // Write file to disk
    await fs.writeFile(filePath, file.buffer);

    // Generate URL for accessing the file
    const publicUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;

    return {
      success: true,
      fileName: uniqueFileName,
      filePath: relativePath,
      url: publicUrl
    };
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upload generated report document
 */
async function uploadReportDocument(fileBuffer, fileName, userId, reportId) {
  try {
    const reportsDir = path.join(UPLOAD_DIR, userId, 'reports', reportId);
    await ensureDirectory(reportsDir);

    const filePath = path.join(reportsDir, fileName);
    const relativePath = path.join(userId, 'reports', reportId, fileName);

    // Write file to disk
    await fs.writeFile(filePath, fileBuffer);

    // Generate URL for downloading the file
    const downloadUrl = `/uploads/${relativePath.replace(/\\/g, '/')}`;

    console.log(`✅ Document saved: ${relativePath}`);

    return {
      success: true,
      fileName: fileName,
      filePath: relativePath,
      url: downloadUrl
    };
  } catch (error) {
    console.error('Document upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get file from storage
 */
async function getFile(filePath) {
  try {
    const fullPath = path.join(UPLOAD_DIR, filePath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return {
        success: false,
        error: 'File not found'
      };
    }

    const downloadUrl = `/uploads/${filePath.replace(/\\/g, '/')}`;

    return {
      success: true,
      url: downloadUrl
    };
  } catch (error) {
    console.error('Get file error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete file from storage
 */
async function deleteFile(filePath) {
  try {
    const fullPath = path.join(UPLOAD_DIR, filePath);

    await fs.unlink(fullPath);

    return {
      success: true,
      message: 'File deleted successfully'
    };
  } catch (error) {
    console.error('Delete file error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List files for a report
 */
async function listReportFiles(userId, reportId) {
  try {
    const reportDir = path.join(UPLOAD_DIR, userId, reportId);

    let files = [];
    try {
      const fileNames = await fs.readdir(reportDir);

      for (const fileName of fileNames) {
        const filePath = path.join(reportDir, fileName);
        const stats = await fs.stat(filePath);

        files.push({
          name: fileName,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        });
      }
    } catch (error) {
      // Directory doesn't exist yet - return empty list
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    return {
      success: true,
      files: files
    };
  } catch (error) {
    console.error('List files error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  uploadImage,
  uploadReportDocument,
  getFile,
  deleteFile,
  listReportFiles
};
