const admin = require('firebase-admin');

// Parse the FIREBASE_ADMIN_CREDENTIAL environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIAL);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
