/**
 * SubsiGuard Local Gateway Offline Store-and-Forward Sync Engine
 * Built by Team MineNova6 for SIH 2026 PS 26025
 */

const STORAGE_KEY = 'subsiguard_offline_telemetry_buffer';
const SYNC_META_KEY = 'subsiguard_sync_metadata';

class OfflineStorageEngine {
  constructor() {
    this.isOnline = navigator.onLine;
    this.subscribers = new Set();
    this.initListeners();
  }

  initListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notify();
      this.flushOfflineBuffer();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notify();
    });
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    const stats = this.getStats();
    this.subscribers.forEach((cb) => cb(stats));
  }

  /**
   * Save incoming telemetry packet to local offline buffer
   */
  bufferPacket(packet) {
    try {
      const currentBuffer = this.getBufferedPackets();
      currentBuffer.push({
        ...packet,
        bufferedAt: new Date().toISOString(),
        id: `buf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      });

      // Keep last 1,000 packets max in browser storage
      if (currentBuffer.length > 1000) {
        currentBuffer.shift();
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentBuffer));
      this.notify();
    } catch (e) {
      console.warn('Offline buffer write error:', e);
    }
  }

  getBufferedPackets() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  clearBuffer() {
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  /**
   * Simulate flushing the offline packet queue to Coal India cloud
   */
  async flushOfflineBuffer() {
    const packets = this.getBufferedPackets();
    if (packets.length === 0) return { flushed: 0 };

    // Update metadata
    const meta = {
      lastSyncTime: new Date().toISOString(),
      lastSyncCount: packets.length,
      status: 'Synchronized with CIL Central Gateway'
    };
    localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));

    this.clearBuffer();
    return { flushed: packets.length };
  }

  getStats() {
    const packets = this.getBufferedPackets();
    let meta = { lastSyncTime: null, lastSyncCount: 0 };
    try {
      const metaRaw = localStorage.getItem(SYNC_META_KEY);
      if (metaRaw) meta = JSON.parse(metaRaw);
    } catch (_) {}

    return {
      isOnline: this.isOnline,
      bufferedCount: packets.length,
      lastSyncTime: meta.lastSyncTime,
      lastSyncCount: meta.lastSyncCount
    };
  }
}

export const offlineStorage = new OfflineStorageEngine();
