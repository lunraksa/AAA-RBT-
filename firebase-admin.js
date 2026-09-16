/**
 * Firebase Admin SDK Initialization Module
 * Secure Backend Admin SDK for system-300c6
 * Bypasses Firestore and Realtime Database security rules with full administrative privileges.
 */

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getDatabase } = require('firebase-admin/database');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let isInitialized = false;
let firestoreDb = null;
let realtimeDb = null;
let authInstance = null;
let appInstance = null;

try {
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

    const existingApps = getApps();
    if (existingApps.length > 0) {
      appInstance = existingApps[0];
    } else {
      appInstance = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://system-300c6-default-rtdb.firebaseio.com',
        projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'system-300c6'
      });
    }

    firestoreDb = getFirestore(appInstance);
    try {
      realtimeDb = getDatabase(appInstance);
    } catch (e) {
      console.warn('⚠️ Realtime Database init warning:', e.message);
    }
    try {
      authInstance = getAuth(appInstance);
    } catch (e) { }

    isInitialized = true;
    console.log('✅ [Firebase Admin SDK] Successfully connected with service account credentials!');
  } else {
    console.warn('⚠️ [Firebase Admin SDK] serviceAccountKey.json not found.');
  }
} catch (err) {
  console.error('❌ [Firebase Admin SDK] Initialization failed:', err.message);
}

/**
 * Test connectivity for both Firestore and Realtime Database
 */
async function testFirebaseAdminConnection() {
  const result = {
    initialized: isInitialized,
    firestore: { connected: false, error: null },
    realtimeDb: { connected: false, error: null }
  };

  if (!isInitialized || !firestoreDb) {
    result.error = 'Firebase Admin SDK is not initialized (missing serviceAccountKey.json)';
    return result;
  }

  // 1. Test Firestore
  try {
    const testDocRef = firestoreDb.collection('_health_check').doc('ping');
    await testDocRef.set({
      ping: 'pong',
      timestamp: FieldValue.serverTimestamp(),
      system: 'AAA Robotics Attendance System'
    });
    const snapshot = await testDocRef.get();
    if (snapshot.exists) {
      result.firestore.connected = true;
      result.firestore.data = snapshot.data();
    }
  } catch (err) {
    result.firestore.error = err.message;
  }

  // 2. Test Realtime Database
  if (realtimeDb) {
    try {
      const testRef = realtimeDb.ref('_health_check');
      await testRef.set({
        ping: 'pong',
        timestamp: Date.now(),
        system: 'AAA Robotics Attendance System'
      });
      const snapshot = await testRef.once('value');
      if (snapshot.exists()) {
        result.realtimeDb.connected = true;
        result.realtimeDb.data = snapshot.val();
      }
    } catch (err) {
      result.realtimeDb.error = err.message;
    }
  }

  return result;
}

module.exports = {
  app: appInstance,
  db: firestoreDb,
  firestore: firestoreDb,
  rtdb: realtimeDb,
  auth: authInstance,
  FieldValue,
  isInitialized,
  testFirebaseAdminConnection
};
