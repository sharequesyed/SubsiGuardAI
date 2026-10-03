
class SoundSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.sirenOsc = null;
    this.sirenGain = null;
    this.lfoOsc = null;
    this.isPlayingSiren = false;
  }

  initCtx() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startSiren() {
    if (this.isPlayingSiren) return;
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      this.isPlayingSiren = true;

      this.sirenOsc = this.audioCtx.createOscillator();
      this.sirenOsc.type = 'sawtooth';
      this.sirenOsc.frequency.setValueAtTime(650, this.audioCtx.currentTime);

      this.lfoOsc = this.audioCtx.createOscillator();
      this.lfoOsc.type = 'sine';
      this.lfoOsc.frequency.setValueAtTime(0.5, this.audioCtx.currentTime);

      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(300, this.audioCtx.currentTime);

      this.lfoOsc.connect(lfoGain);
      lfoGain.connect(this.sirenOsc.frequency);

      this.sirenGain = this.audioCtx.createGain();
      this.sirenGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      this.sirenGain.gain.exponentialRampToValueAtTime(0.15, this.audioCtx.currentTime + 0.5);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.audioCtx.destination);

      this.sirenOsc.start();
      this.lfoOsc.start();
    } catch (e) {
      console.warn('Web Audio Siren unavailable:', e);
      this.isPlayingSiren = false;
    }
  }

  stopSiren() {
    if (!this.isPlayingSiren) return;
    try {
      if (this.sirenGain && this.audioCtx) {
        this.sirenGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
        setTimeout(() => {
          if (this.sirenOsc) {
            try { this.sirenOsc.stop(); } catch (_) {}
            this.sirenOsc.disconnect();
          }
          if (this.lfoOsc) {
            try { this.lfoOsc.stop(); } catch (_) {}
            this.lfoOsc.disconnect();
          }
          this.isPlayingSiren = false;
        }, 350);
      } else {
        this.isPlayingSiren = false;
      }
    } catch (e) {
      console.warn('Error stopping siren:', e);
      this.isPlayingSiren = false;
    }
  }

  playWarningChirp(freq = 880, duration = 0.12) {
    try {
      this.initCtx();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (_) {}
  }
}

export const soundFx = new SoundSynthesizer();
