/**
 * View all administrators stored in Firebase (Realtime Database & Cloud Firestore)
 * Run with: node view-firebase-admins.js
 */

const { db, rtdb, isInitialized } = require('./firebase-admin');

async function listFirebaseAdmins() {
  console.log('============================================================');
  console.log('🔥 FIREBASE ADMINISTRATORS DIRECTORY');
  console.log('Project ID: system-300c6');
  console.log('============================================================\n');

  if (!isInitialized) {
    console.error('❌ Firebase Admin SDK is not initialized.');
    process.exit(1);
  }

  // 1. Fetch from Realtime Database
  console.log('📡 1. Realtime Database (node: /admins):');
  console.log('------------------------------------------------------------');
  try {
    const rtdbSnap = await rtdb.ref('admins').once('value');
    const rtdbData = rtdbSnap.val() || {};
    const keys = Object.keys(rtdbData);

    if (keys.length === 0) {
      console.log('  (No admins found in Realtime Database)');
    } else {
      keys.forEach((key, idx) => {
        const a = rtdbData[key];
        console.log(`  [${idx + 1}] ${a.name || key} (@${a.username || key})`);
        console.log(`      Role:     ${a.role || 'Administrator'}`);
        console.log(`      Email:    ${a.email || '(none)'}`);
        console.log(`      Phone:    ${a.phone || '(none)'}`);
        console.log(`      Photo:    ${a.photo || '(none)'}`);
        console.log(`      PIN:      ${a.pin || '1234'}`);
        console.log('');
      });
    }
  } catch (err) {
    console.error('  ❌ Error reading Realtime Database:', err.message);
  }

  // 2. Fetch from Cloud Firestore
  console.log('📂 2. Cloud Firestore (collection: "admins"):');
  console.log('------------------------------------------------------------');
  try {
    const fsSnap = await db.collection('admins').get();
    if (fsSnap.empty) {
      console.log('  (No admins found in Firestore collection)');
    } else {
      let idx = 1;
      fsSnap.forEach(doc => {
        const a = doc.data();
        console.log(`  [${idx++}] ID: "${doc.id}" -> ${a.name || doc.id} (${a.role || 'Administrator'})`);
      });
    }
  } catch (err) {
    console.error('  ❌ Error reading Firestore:', err.message);
  }

  console.log('\n============================================================');
  console.log('🌐 Web Console Links:');
  console.log('  - Realtime Database: https://console.firebase.google.com/project/system-300c6/database/system-300c6-default-rtdb/data/~2Fadmins');
  console.log('  - Cloud Firestore:   https://console.firebase.google.com/project/system-300c6/firestore/databases/-default-/data/panel/admins');
  console.log('============================================================\n');
  process.exit(0);
}

listFirebaseAdmins().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
