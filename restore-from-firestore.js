/**
 * Restore & Sync Students from Cloud Firestore to Realtime Database & Local System
 * Recovers all students (STU-001 through STU-XXX) from Cloud Firestore
 * and synchronizes them into Firebase Realtime Database and local_db.json.
 */

const { firestore, rtdb, isInitialized } = require('./firebase-admin');
const fs = require('fs');
const path = require('path');

async function restoreAllFromFirestore() {
  console.log('============================================================');
  console.log('🔄 Restoring Students from Cloud Firestore to System...');
  console.log('============================================================\n');

  if (!isInitialized || !firestore) {
    console.error('❌ Firebase Admin SDK is not initialized.');
    process.exit(1);
  }

  // 1. Fetch active students from Cloud Firestore
  const studentsSnap = await firestore.collection('students').get();
  const studentsMap = new Map();

  studentsSnap.forEach(doc => {
    const data = doc.data();
    const id = (data.id || doc.id).trim().toUpperCase();
    studentsMap.set(id, {
      id,
      name: data.name || 'Unknown',
      class: data.class || 'AI',
      department: data.department || 'Saturday',
      branch: data.branch || 'Funmall',
      email: data.email || `${id.toLowerCase()}@school.edu`,
      photo: data.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      descriptor: Array.isArray(data.descriptor) ? data.descriptor : [],
      updatedAt: Date.now()
    });
  });

  // 2. Also check Firestore deleted_students (e.g. STU-001) and restore them
  const deletedSnap = await firestore.collection('deleted_students').get();
  const restoredFromTrash = [];

  for (const doc of deletedSnap.docs) {
    const data = doc.data();
    const id = (data.id || doc.id).trim().toUpperCase();
    if (!studentsMap.has(id)) {
      const studentObj = {
        id,
        name: data.name || 'Unknown',
        class: data.class || 'AI',
        department: data.department || 'Saturday',
        branch: data.branch || 'Funmall',
        email: data.email || `${id.toLowerCase()}@school.edu`,
        photo: data.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        descriptor: Array.isArray(data.descriptor) ? data.descriptor : [],
        updatedAt: Date.now()
      };
      studentsMap.set(id, studentObj);
      restoredFromTrash.push(studentObj);

      // Save back to Firestore active students & remove from trash
      await firestore.collection('students').doc(id).set(studentObj, { merge: true });
      await firestore.collection('deleted_students').doc(id).delete();
    }
  }

  const allStudents = Array.from(studentsMap.values());
  // Sort from STU-001 to STU-XXX
  allStudents.sort((a, b) => {
    const numA = parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  console.log(`📋 Found ${allStudents.length} total students to restore:`);
  allStudents.forEach(s => console.log(`   - ${s.id}: ${s.name} (${s.branch} • ${s.class} • ${s.department})`));

  if (restoredFromTrash.length > 0) {
    console.log(`\n♻️ Recovered from Trash Bin: ${restoredFromTrash.map(s => `${s.id} (${s.name})`).join(', ')}`);
  }

  // 3. Sync to Firebase Realtime Database
  if (rtdb) {
    console.log('\n📡 Writing to Firebase Realtime Database (/students)...');
    const rtdbUpdates = {};
    allStudents.forEach(s => {
      rtdbUpdates[`students/${s.id}`] = s;
    });
    await rtdb.ref().update(rtdbUpdates);

    // Clean deleted_students in RTDB
    for (const r of restoredFromTrash) {
      await rtdb.ref(`deleted_students/${r.id}`).remove();
    }
    console.log('✅ Successfully synced to Firebase Realtime Database!');
  }

  // 4. Update local_db.json
  const localDbPath = path.join(__dirname, 'local_db.json');
  let localDb = { students: [], logs: [] };
  if (fs.existsSync(localDbPath)) {
    try {
      localDb = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
    } catch (e) {}
  }
  localDb.students = allStudents;
  fs.writeFileSync(localDbPath, JSON.stringify(localDb, null, 2), 'utf-8');
  console.log(`💾 Saved ${allStudents.length} students to local_db.json`);

  console.log('\n============================================================');
  console.log(`🎉 Recovery complete! ${allStudents.length} students are active.`);
  console.log('============================================================\n');
  process.exit(0);
}

restoreAllFromFirestore().catch(err => {
  console.error('❌ Restore error:', err);
  process.exit(1);
});
