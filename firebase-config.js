/**
 * Firebase Realtime Database Configuration
 * Project: system-300c6 (System)
 * Database URL: https://system-300c6-default-rtdb.firebaseio.com
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBE9ZogMchNy_HD1fc0dEIo5WMj5KY2enQ",
  authDomain: "system-300c6.firebaseapp.com",
  databaseURL: "https://system-300c6-default-rtdb.firebaseio.com",
  projectId: "system-300c6",
  storageBucket: "system-300c6.firebasestorage.app",
  messagingSenderId: "1068770269317",
  appId: "1:1068770269317:web:7e9917c88355863214b1ec",
  measurementId: "G-09CP6PQEPL"
};

if (typeof window !== 'undefined') {
  window.FIREBASE_CONFIG = FIREBASE_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FIREBASE_CONFIG;
}
