// Firebase Storage Service for FlacronAI
// Cloud-based storage for production deployment
const { getStorage } = require('firebase-admin/storage');
const { v4: uuidv4 } = require('uuid');

/**
 * Upload image to Firebase Storage
 */
async function uploadImage(file, userId, reportId) {
  try {
    const bucket = getStorage().bucket();
    const uniqueFileName = `${uuidv4()}_${file.originalname}`;
    const filePath = `users/${userId}/reports/${reportId}/images/${uniqueFileName}`;

    const fileUpload = bucket.file(filePath);

    // Upload file buffer to Firebase Storage
    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          userId: userId,
          reportId: reportId,
          originalName: file.originalname
        }
      }
    });

    // Make file publicly accessible
    await fileUpload.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    console.log(`✅ Image uploaded to Firebase Storage: ${filePath}`);

    return {
      success: true,
      fileName: uniqueFileName,
      filePath: filePath,
      url: publicUrl
    };
  } catch (error) {
    console.error('Firebase Storage image upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Upload generated report document to Firebase Storage
 */
async function uploadReportDocument(fileBuffer, fileName, userId, reportId) {
  try {
    const bucket = getStorage().bucket();
    const filePath = `users/${userId}/reports/${reportId}/exports/${fileName}`;

    const fileUpload = bucket.file(filePath);

    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (fileName.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (fileName.endsWith('.docx')) {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // Upload file buffer to Firebase Storage
    await fileUpload.save(fileBuffer, {
      metadata: {
        contentType: contentType,
        metadata: {
          userId: userId,
          reportId: reportId,
          type: 'export'
        }
      }
    });

    // Make file publicly accessible
    await fileUpload.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    console.log(`✅ Document uploaded to Firebase Storage: ${filePath}`);

    return {
      success: true,
      fileName: fileName,
      filePath: filePath,
      url: publicUrl
    };
  } catch (error) {
    console.error('Firebase Storage document upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get file from Firebase Storage
 */
async function getFile(filePath) {
  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();

    if (!exists) {
      return {
        success: false,
        error: 'File not found'
      };
    }

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Firebase Storage get file error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete file from Firebase Storage
 */
async function deleteFile(filePath) {
  try {
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);

    await file.delete();

    console.log(`✅ File deleted from Firebase Storage: ${filePath}`);

    return {
      success: true,
      message: 'File deleted successfully'
    };
  } catch (error) {
    console.error('Firebase Storage delete file error:', error);
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
    const bucket = getStorage().bucket();
    const prefix = `users/${userId}/reports/${reportId}/`;

    const [files] = await bucket.getFiles({ prefix });

    const fileList = files.map(file => ({
      name: file.name.split('/').pop(),
      size: parseInt(file.metadata.size),
      created: new Date(file.metadata.timeCreated),
      modified: new Date(file.metadata.updated),
      url: `https://storage.googleapis.com/${bucket.name}/${file.name}`
    }));

    return {
      success: true,
      files: fileList
    };
  } catch (error) {
    console.error('Firebase Storage list files error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete all files for a report
 */
async function deleteReportFiles(userId, reportId) {
  try {
    const bucket = getStorage().bucket();
    const prefix = `users/${userId}/reports/${reportId}/`;

    const [files] = await bucket.getFiles({ prefix });

    // Delete all files
    await Promise.all(files.map(file => file.delete()));

    console.log(`✅ All files deleted for report ${reportId}`);

    return {
      success: true,
      message: `Deleted ${files.length} files`
    };
  } catch (error) {
    console.error('Firebase Storage delete report files error:', error);
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
  listReportFiles,
  deleteReportFiles
};
