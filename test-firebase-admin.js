/**
 * Test Firebase Admin SDK Connection Script
 * Connects to Firestore & Realtime Database and verifies read/write access.
 */

const { db, rtdb, FieldValue, isInitialized, testFirebaseAdminConnection } = require('./firebase-admin');

async function run() {
  console.log('------------------------------------------------------------');
  console.log('🔥 Testing Firebase Admin SDK Connection...');
  console.log('------------------------------------------------------------');

  if (!isInitialized) {
    console.error('❌ Failed: Firebase Admin SDK was not initialized.');
    process.exit(1);
  }

  // 1. Run health check
  console.log('📡 Running connectivity health check...');
  const health = await testFirebaseAdminConnection();
  console.log('Firestore Status:  ', health.firestore.connected ? '✅ Connected' : `❌ Error: ${health.firestore.error}`);
  console.log('Realtime DB Status:', health.realtimeDb.connected ? '✅ Connected' : `❌ Error: ${health.realtimeDb.error}`);

  // 2. Add sample student to Firestore (matches user tutorial request)
  if (health.firestore.connected && db) {
    try {
      console.log('\n📝 Adding sample student to Firestore "students" collection...');
      const studentRef = db.collection('students').doc('student_123');
      await studentRef.set({
        name: 'Alex',
        class: 'Robotics 101',
        branch: 'Funmall',
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });

      const snap = await studentRef.get();
      console.log('✅ Student successfully created & read via Firestore Admin SDK!');
      console.log('📄 Document data:', snap.data());
    } catch (err) {
      console.error('❌ Error writing to Firestore:', err.message);
    }
  }

  // 3. Realtime Database check
  if (health.realtimeDb.connected && rtdb) {
    try {
      console.log('\n📝 Verifying Realtime Database "branches" node...');
      const branchSnap = await rtdb.ref('branches').once('value');
      const branches = branchSnap.val();
      console.log('✅ Realtime Database branches read successfully:', branches || '(none yet)');
    } catch (err) {
      console.error('❌ Error reading Realtime Database:', err.message);
    }
  }

  console.log('\n============================================================');
  console.log('🎉 Firebase Admin SDK is fully connected and ready for use!');
  console.log('============================================================\n');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
