/**
 * PostgreSQL API Bridge for Front-End Web Application
 * Handles API communication with server.js (http://localhost:5000/api)
 */

let PG_API_BASE = 'http://localhost:5000/api';

class PostgresClient {
  constructor() {
    this.isConnected = false;
    this.checkConnection();
  }

  // Ping backend server health across candidate ports
  async checkConnection() {
    const ports = [5000, 5001, 5002];
    for (const port of ports) {
      try {
        const candidateUrl = `http://localhost:${port}/api`;
        const res = await fetch(`${candidateUrl}/health`, { method: 'GET' });
        if (res.ok) {
          PG_API_BASE = candidateUrl;
          this.isConnected = true;
          console.log(`[PostgresClient] Connected to PostgreSQL API server (${candidateUrl})`);
          return true;
        }
      } catch (e) {
        // try next port
      }
    }
    this.isConnected = false;
    console.log('[PostgresClient] Server offline. Using IndexedDB / LocalStorage fallback.');
    return false;
  }

  // Fetch all students from PostgreSQL database
  async fetchStudents() {
    try {
      const res = await fetch(`${PG_API_BASE}/students`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[PostgresClient] Fetch students failed:', e.message);
    }
    return null;
  }

  // Save student to PostgreSQL database
  async saveStudent(studentData) {
    try {
      const res = await fetch(`${PG_API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[PostgresClient] Save student failed:', e.message);
    }
    return null;
  }

  // Delete student from PostgreSQL database
  async deleteStudent(studentId) {
    try {
      const res = await fetch(`${PG_API_BASE}/students/${studentId}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[PostgresClient] Delete student failed:', e.message);
    }
    return null;
  }

  // Fetch attendance logs from PostgreSQL database
  async fetchLogs() {
    try {
      const res = await fetch(`${PG_API_BASE}/logs`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[PostgresClient] Fetch logs failed:', e.message);
    }
    return null;
  }

  // Save attendance log to PostgreSQL database
  async saveLog(logEntry) {
    try {
      const res = await fetch(`${PG_API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[PostgresClient] Save log failed:', e.message);
    }
    return null;
  }

  // Fetch Admin Profile from API
  async fetchProfile() {
    try {
      const res = await fetch(`${PG_API_BASE}/profile`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[PostgresClient] Fetch profile failed:', e.message);
    }
    return null;
  }

  // Save / Update Admin Profile via API
  async saveProfile(profileData) {
    try {
      const res = await fetch(`${PG_API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[PostgresClient] Save profile failed:', e.message);
    }
    return null;
  }

  // Fetch Dashboard Stats from API
  async fetchStats() {
    try {
      const res = await fetch(`${PG_API_BASE}/stats`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[PostgresClient] Fetch stats failed:', e.message);
    }
    return null;
  }
}

window.pgClient = new PostgresClient();
