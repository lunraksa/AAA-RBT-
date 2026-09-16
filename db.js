/**
 * IndexedDB Database Manager for Robotics School Attendance System
 * Database Name: RoboticsAttendanceDB (v1)
 * Provides persistent asynchronous storage for Students, Attendance Logs, Settings, Trash, and Matrix records.
 */

const DB_NAME = 'RoboticsAttendanceDB';
const DB_VERSION = 1;

class DatabaseManager {
  constructor() {
    this.db = null;
    this.isReady = false;
    this.initPromise = this.initDB();
  }

  // Initialize IndexedDB with Object Stores and Indexes
  async initDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('[DatabaseManager] IndexedDB not supported. Falling back to LocalStorage.');
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        console.log('[DatabaseManager] Upgrading database schema...');

        // Students Store
        if (!db.objectStoreNames.contains('students')) {
          const studentStore = db.createObjectStore('students', { keyPath: 'id' });
          studentStore.createIndex('name', 'name', { unique: false });
          studentStore.createIndex('class', 'class', { unique: false });
          studentStore.createIndex('department', 'department', { unique: false });
        }

        // Attendance Logs Store
        if (!db.objectStoreNames.contains('logs')) {
          const logStore = db.createObjectStore('logs', { keyPath: 'id' });
          logStore.createIndex('studentId', 'studentId', { unique: false });
          logStore.createIndex('date', 'date', { unique: false });
          logStore.createIndex('status', 'status', { unique: false });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // System Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Deleted Students (Trash) Store
        if (!db.objectStoreNames.contains('deleted_students')) {
          db.createObjectStore('deleted_students', { keyPath: 'id' });
        }

        // 11-Week Matrix Store
        if (!db.objectStoreNames.contains('matrix')) {
          db.createObjectStore('matrix', { keyPath: 'studentId' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.isReady = true;
        console.log('[DatabaseManager] IndexedDB initialized successfully.');
        resolve(true);
      };

      request.onerror = (e) => {
        console.error('[DatabaseManager] IndexedDB error:', e.target.error);
        resolve(false);
      };
    });
  }

  // Generic Transaction Wrapper
  async getStore(storeName, mode = 'readonly') {
    await this.initPromise;
    if (!this.db) return null;
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // STUDENTS CRUD
  async getAllStudents() {
    try {
      const store = await this.getStore('students');
      if (!store) return null;
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async saveStudent(student) {
    try {
      const store = await this.getStore('students', 'readwrite');
      if (!store) return false;
      return new Promise((resolve) => {
        const req = store.put(student);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  async saveStudentsBulk(studentsList) {
    try {
      const store = await this.getStore('students', 'readwrite');
      if (!store) return false;
      studentsList.forEach(s => store.put(s));
      return true;
    } catch (e) {
      return false;
    }
  }

  async deleteStudent(studentId) {
    try {
      const store = await this.getStore('students', 'readwrite');
      if (!store) return false;
      return new Promise((resolve) => {
        const req = store.delete(studentId);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  // ATTENDANCE LOGS CRUD
  async getAllLogs() {
    try {
      const store = await this.getStore('logs');
      if (!store) return null;
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async saveLog(logEntry) {
    try {
      const store = await this.getStore('logs', 'readwrite');
      if (!store) return false;
      return new Promise((resolve) => {
        const req = store.put(logEntry);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  async saveLogsBulk(logsList) {
    try {
      const store = await this.getStore('logs', 'readwrite');
      if (!store) return false;
      logsList.forEach(l => store.put(l));
      return true;
    } catch (e) {
      return false;
    }
  }

  // SETTINGS CRUD
  async getSetting(key) {
    try {
      const store = await this.getStore('settings');
      if (!store) return null;
      return new Promise((resolve) => {
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async saveSetting(key, value) {
    try {
      const store = await this.getStore('settings', 'readwrite');
      if (!store) return false;
      return new Promise((resolve) => {
        const req = store.put({ key, value });
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  // FULL DATABASE BACKUP & EXPORT
  async exportFullDatabase() {
    const students = await this.getAllStudents() || [];
    const logs = await this.getAllLogs() || [];
    const telegramSettings = await this.getSetting('telegram') || {};

    return {
      version: '2.0',
      engine: 'IndexedDB',
      timestamp: new Date().toISOString(),
      students,
      logs,
      settings: { telegram: telegramSettings }
    };
  }
}

window.dbManager = new DatabaseManager();
