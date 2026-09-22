/**
 * Sync CHOU KIMHUOY to Cloud Firestore and Firebase Realtime Database
 */

const https = require('https');

const adminData = {
  username: 'kimhuoy',
  name: 'CHOU KIMHUOY',
  role: 'Administrator & Robotics Lead',
  photo: 'assets/chou_kimhuoy.jpg',
  email: 'kimhuoy.chou@robotics.edu',
  phone: '+855 12 777 888',
  bio: 'Robotics & STEM Department Administrator',
  password: 'admin123',
  pin: '1234',
  isAdmin: true,
  createdAt: new Date().toISOString(),
  updatedAt: Date.now()
};

function httpsRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function syncToRealtimeDb() {
  console.log('📡 1. Writing to Firebase Realtime Database (/admins/kimhuoy)...');
  const payload = JSON.stringify(adminData);
  const options = {
    hostname: 'system-300c6-default-rtdb.firebaseio.com',
    port: 443,
    path: '/admins/kimhuoy.json',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  const res = await httpsRequest(options, payload);
  console.log('✅ RTDB Success:', res.status, res.body);
}

async function syncToFirestore() {
  console.log('\n📂 2. Writing to Cloud Firestore (collection: admins, doc: kimhuoy)...');
  const firestoreDoc = {
    fields: {
      username: { stringValue: adminData.username },
      name: { stringValue: adminData.name },
      role: { stringValue: adminData.role },
      photo: { stringValue: adminData.photo },
      email: { stringValue: adminData.email },
      phone: { stringValue: adminData.phone },
      bio: { stringValue: adminData.bio },
      password: { stringValue: adminData.password },
      pin: { stringValue: adminData.pin },
      isAdmin: { booleanValue: adminData.isAdmin },
      createdAt: { stringValue: adminData.createdAt },
      updatedAt: { integerValue: String(adminData.updatedAt) }
    }
  };
  const payload = JSON.stringify(firestoreDoc);
  const options = {
    hostname: 'firestore.googleapis.com',
    port: 443,
    path: '/v1/projects/system-300c6/databases/(default)/documents/admins/kimhuoy',
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  const res = await httpsRequest(options, payload);
  console.log('✅ Firestore Success:', res.status, res.body);
}

async function run() {
  try {
    await syncToRealtimeDb();
    await syncToFirestore();
    console.log('\n🎉 Successfully added CHOU KIMHUOY to Firebase Realtime Database and Cloud Firestore!');
  } catch (err) {
    console.error('❌ Error syncing admin to Firebase:', err.message);
  }
}

run();
