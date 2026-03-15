const path = require('path');
const fs = require('fs');

const BASE_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

const getReportUploadPath = (userId, reportId) => {
  return ensureDir(path.join(BASE_UPLOAD_DIR, userId, 'reports', reportId));
};

const getExportPath = (userId) => {
  return ensureDir(path.join(BASE_UPLOAD_DIR, userId, 'exports'));
};

const getLogoPath = (userId) => {
  return ensureDir(path.join(BASE_UPLOAD_DIR, userId, 'logos'));
};

const getWhiteLabelPath = (userId) => {
  return ensureDir(path.join(BASE_UPLOAD_DIR, userId, 'whitelabel'));
};

const BASE_URL = process.env.NODE_ENV === 'production'
  ? process.env.BACKEND_URL || ''
  : `http://localhost:${process.env.PORT || 3000}`;

const getFileUrl = (filePath) => {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  return `${BASE_URL}/${relativePath.replace(/\\/g, '/')}`;
};

module.exports = {
  BASE_UPLOAD_DIR,
  ensureDir,
  getReportUploadPath,
  getExportPath,
  getLogoPath,
  getWhiteLabelPath,
  getFileUrl,
};
