// Storage Configuration
// Automatically uses Firebase Storage in production, local storage in development

const useFirebaseStorage = process.env.NODE_ENV === 'production' || process.env.USE_FIREBASE_STORAGE === 'true';

let storageService;

if (useFirebaseStorage) {
  console.log('📦 Using Firebase Storage (Cloud)');
  storageService = require('../services/firebaseStorageService');
} else {
  console.log('📦 Using Local Storage (Development)');
  storageService = require('../services/storageService');
}

module.exports = storageService;
