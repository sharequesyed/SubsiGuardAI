/**
 * SubsiGuard Web Desktop Notification Service
 * Dispatches native OS-level alerts (Windows Action Center / macOS / Android / Linux)
 * Team MineNova6 - Smart India Hackathon 2026 (PS 26025)
 */

class NotificationService {
  constructor() {
    this.lastNotificationTime = 0;
    this.lastNotificationLevel = null;
    this.cooldownMs = 15000; // 15 seconds cooldown between identical alerts
    this.listeners = [];
  }

  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission; // 'default' | 'granted' | 'denied'
  }

  async requestPermission() {
    if (!this.isSupported()) {
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      this.notifyListeners(permission);
      return permission;
    } catch (err) {
      console.warn('Error requesting desktop notification permission:', err);
      return 'denied';
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners(permission) {
    this.listeners.forEach(fn => fn(permission));
  }

  /**
   * Dispatch native desktop notification banner with sound & vibration
   */
  send({ title, body, level = 'CRITICAL', icon, tag = 'subsiguard-alert', requireInteraction = false }) {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return null;
    }

    const now = Date.now();
    // Allow immediate dispatch if level escalated (e.g. from WARNING to CRITICAL)
    const isEscalation = this.lastNotificationLevel !== 'CRITICAL' && level === 'CRITICAL';
    if (!isEscalation && level === this.lastNotificationLevel && now - this.lastNotificationTime < this.cooldownMs) {
      return null; // Suppress spam
    }

    this.lastNotificationTime = now;
    this.lastNotificationLevel = level;

    // Use default SVG app icon or alert icon
    const defaultIcon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';

    try {
      const notification = new Notification(title, {
        body,
        icon: icon || defaultIcon,
        tag: tag || `subsiguard-${level.toLowerCase()}`,
        requireInteraction: requireInteraction || level === 'CRITICAL',
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (err) {
      console.error('Failed to dispatch native desktop notification:', err);
      return null;
    }
  }

  /**
   * High-priority Critical Subsidence Collapse Alert
   */
  notifyCriticalSubsidence({ mineName, tiltX, crackMm, strainMmM, sector = 'Tensile Zone' }) {
    return this.send({
      title: '🚨 SubsiGuard: CRITICAL SUBSIDENCE EVACUATION ALERT',
      body: `CRITICAL BREACH over ${mineName || 'Panel 14'}: Surface Tilt ${tiltX || 0.85}° | Crack ${crackMm || 7.4}mm | Strain ${strainMmM || 5.8}mm/m. Immediate 200m evacuation advised!`,
      level: 'CRITICAL',
      tag: 'subsiguard-critical',
      requireInteraction: true
    });
  }

  /**
   * Warning: Secondary Creep / Fissure Alert
   */
  notifyWarningSubsidence({ mineName, tiltX, crackMm, sector = 'Active Extraction' }) {
    return this.send({
      title: '⚠️ SubsiGuard: SECONDARY CREEP ADVISORY',
      body: `Deformation Warning at ${mineName || 'Panel 14'} (${sector}): Surface Tilt ${tiltX || 0.35}° | Crack opening ${crackMm || 2.8}mm. Operations team alerted.`,
      level: 'WARNING',
      tag: 'subsiguard-warning',
      requireInteraction: false
    });
  }

  /**
   * Test Alert for Juries and Demonstrations
   */
  notifyTestAlert() {
    return this.send({
      title: '🔔 SubsiGuard: Desktop Alert System Verified',
      body: 'Native Windows OS Notification Active. SubsiGuard is actively monitoring localized LoRa mesh telemetry.',
      level: 'INFO',
      tag: 'subsiguard-test',
      requireInteraction: false
    });
  }
}

export const notificationService = new NotificationService();
