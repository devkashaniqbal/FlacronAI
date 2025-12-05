// Storage Configuration
// Uses Firebase Storage only if explicitly enabled, otherwise uses local storage

const useFirebaseStorage = process.env.USE_FIREBASE_STORAGE === 'true';

let storageService;

if (useFirebaseStorage) {
  console.log('📦 Using Firebase Storage (Cloud)');
  storageService = require('../services/firebaseStorageService');
} else {
  console.log('📦 Using Local Storage (Development)');
  storageService = require('../services/storageService');
}

module.exports = storageService;
