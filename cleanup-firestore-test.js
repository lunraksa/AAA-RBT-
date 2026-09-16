/**
 * Clean up test records from Firestore
 * Removes test documents like student_123 and _health_check
 */

const { db, isInitialized } = require('./firebase-admin');

async function cleanup() {
  if (!isInitialized || !db) {
    console.error('❌ Firebase Admin SDK is not initialized.');
    process.exit(1);
  }

  console.log('🧹 Cleaning up test documents from Firestore...');

  try {
    // 1. Delete student_123
    await db.collection('students').doc('student_123').delete();
    console.log('✅ Deleted "students/student_123" test document.');

    // 2. Delete _health_check/ping
    await db.collection('_health_check').doc('ping').delete();
    console.log('✅ Deleted "_health_check/ping" test document.');

    console.log('\n🎉 Test data cleaned up successfully!');
  } catch (err) {
    console.error('❌ Cleanup error:', err.message);
  }
  process.exit(0);
}

cleanup();
