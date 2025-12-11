export class AudioController {
  private ctx: AudioContext | null = null;
  private _muted: boolean = false;
  private _initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
        this._muted = localStorage.getItem('christmas_pictionary_muted') === 'true';
    }
  }

  get muted() { return this._muted; }

  set muted(value: boolean) {
    this._muted = value;
    localStorage.setItem('christmas_pictionary_muted', String(value));
    if (!value) this.init();
  }

  init() {
    if (this._initialized) {
        if (this.ctx?.state === 'suspended') this.ctx.resume();
        return;
    }
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
      this._initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, volume: number = 0.1) {
    if (this._muted || !this.ctx) return;
    
    // Resume context if needed (browsers block auto-play)
    if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
    }

    try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
        
        gain.gain.setValueAtTime(volume, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    } catch (e) {
        console.error("Audio play error", e);
    }
  }

  playClick() {
    this.playTone(800, 'sine', 0.05, 0, 0.03);
  }

  playStart() {
    this.playTone(440, 'triangle', 0.1, 0, 0.1);
    this.playTone(554, 'triangle', 0.1, 0.1, 0.1);
    this.playTone(659, 'triangle', 0.4, 0.2, 0.1);
  }

  playSuccess() {
    // Joyful major triad (C major)
    this.playTone(523.25, 'sine', 0.1, 0, 0.1); // C5
    this.playTone(659.25, 'sine', 0.1, 0.1, 0.1); // E5
    this.playTone(783.99, 'sine', 0.4, 0.2, 0.1); // G5
    this.playTone(1046.50, 'sine', 0.4, 0.3, 0.05); // C6
  }

  playFailure() {
    // Sad slide
    this.playTone(300, 'sawtooth', 0.3, 0, 0.05);
    this.playTone(200, 'sawtooth', 0.5, 0.2, 0.05);
  }

  playTick() {
    this.playTone(1000, 'square', 0.02, 0, 0.01);
  }
  
  playWin() {
    // Fanfare
    const now = 0;
    this.playTone(523.25, 'square', 0.2, now, 0.1);
    this.playTone(523.25, 'square', 0.2, now + 0.2, 0.1);
    this.playTone(523.25, 'square', 0.2, now + 0.4, 0.1);
    this.playTone(659.25, 'square', 0.6, now + 0.6, 0.1);
    this.playTone(523.25, 'square', 0.2, now + 1.2, 0.1);
    this.playTone(783.99, 'square', 0.8, now + 1.4, 0.1);
  }
}

export const gameAudio = new AudioController();