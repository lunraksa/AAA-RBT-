/**
 * Sync Local Roster & Logs to Cloud Firestore
 * Reads current students from local database and pushes them to Firestore.
 */

const { db, FieldValue, isInitialized } = require('./firebase-admin');
const fs = require('fs');
const path = require('path');

async function syncAll() {
  console.log('------------------------------------------------------------');
  console.log('🚀 Syncing Local Database to Cloud Firestore...');
  console.log('------------------------------------------------------------');

  if (!isInitialized || !db) {
    console.error('❌ Firebase Admin SDK is not initialized.');
    process.exit(1);
  }

  // 1. Read local database
  const localDbPath = path.join(__dirname, 'local_db.json');
  let localData = { students: [], logs: [] };

  if (fs.existsSync(localDbPath)) {
    try {
      localData = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
    } catch (e) {
      console.warn('⚠️ Could not parse local_db.json, using empty dataset.');
    }
  }

  const students = localData.students || [];
  const logs = localData.logs || [];

  console.log(`📋 Found ${students.length} students and ${logs.length} attendance logs to sync.\n`);

  // 2. Batch write students to Firestore
  if (students.length > 0) {
    const studentBatch = db.batch();
    students.forEach(student => {
      const docId = student.id || `STU-${Date.now()}`;
      const docRef = db.collection('students').doc(docId);
      studentBatch.set(docRef, {
        id: docId,
        name: student.name || 'Unknown',
        class: student.class || 'AI',
        branch: student.branch || 'Funmall',
        department: student.department || 'Saturday',
        email: student.email || '',
        photo: student.photo || '',
        descriptor: Array.isArray(student.descriptor) ? student.descriptor : [],
        syncedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    });

    await studentBatch.commit();
    console.log(`✅ Successfully synced ${students.length} students to "students" collection!`);
  }

  // 3. Batch write recent logs to Firestore
  if (logs.length > 0) {
    const logBatch = db.batch();
    const recentLogs = logs.slice(0, 50); // Keep initial sync fast and clean
    recentLogs.forEach(log => {
      const docId = log.id || `LOG-${Date.now()}`;
      const docRef = db.collection('attendance_logs').doc(docId);
      logBatch.set(docRef, {
        id: docId,
        studentId: log.studentId,
        studentName: log.studentName,
        class: log.class || 'AI',
        date: log.date || new Date().toISOString().split('T')[0],
        timestamp: log.timestamp || new Date().toISOString(),
        status: log.status || 'present',
        mode: log.mode || 'Face Scan Check-in',
        syncedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    });

    await logBatch.commit();
    console.log(`✅ Successfully synced ${recentLogs.length} attendance logs to "attendance_logs" collection!`);
  }

  console.log('\n============================================================');
  console.log('🎉 Sync complete! Check your Firestore Console to see your records.');
  console.log('============================================================\n');
  process.exit(0);
}

syncAll().catch(err => {
  console.error('❌ Sync error:', err);
  process.exit(1);
});
