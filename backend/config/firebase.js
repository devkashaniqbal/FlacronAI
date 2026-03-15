const admin = require('firebase-admin');
require('dotenv').config();

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
  };

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  console.log('✅ Firebase Admin SDK initialized');
  return firebaseApp;
};

const getFirestore = () => {
  if (!admin.apps.length) initFirebase();
  return admin.firestore();
};

const getAuth = () => {
  if (!admin.apps.length) initFirebase();
  return admin.auth();
};

const FieldValue = admin.firestore.FieldValue;
const Timestamp = admin.firestore.Timestamp;

module.exports = { initFirebase, getFirestore, getAuth, FieldValue, Timestamp, admin };
