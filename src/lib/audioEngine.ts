class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  analyzer: AnalyserNode | null = null;
  dataArray: Uint8Array = new Uint8Array(0);
  freqArray: Uint8Array = new Uint8Array(0);
  initialized = false;

  // Synth state
  oscillators: OscillatorNode[] = [];
  
  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.analyzer = this.ctx.createAnalyser();
      
      this.analyzer.fftSize = 2048;
      this.dataArray = new Uint8Array(this.analyzer.frequencyBinCount);
      this.freqArray = new Uint8Array(this.analyzer.frequencyBinCount);

      this.masterGain.connect(this.analyzer);
      this.analyzer.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.5;

      this.initialized = true;
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  startSynth() {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    // Create a simple drone/sequence
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 5;

    lfo.type = 'sine';
    lfo.frequency.value = 0.5; // slow sweep
    lfoGain.gain.value = 800; // sweep range

    // Routing
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    osc.connect(filter);
    filter.connect(this.masterGain);

    osc.start();
    lfo.start();

    this.oscillators.push(osc, lfo);
  }

  stopSynth() {
    this.oscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch(e) {}
    });
    this.oscillators = [];
  }

  updateData() {
    if (!this.analyzer) return;
    this.analyzer.getByteTimeDomainData(this.dataArray as any);
    this.analyzer.getByteFrequencyData(this.freqArray as any);
  }

  // Getters for visualizers
  getTimeData() { return this.dataArray; }
  getFreqData() { return this.freqArray; }
}

export const engine = new AudioEngine();
