let audioCtx = null;
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientGain = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export const playClick = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.16);
  } catch (e) {
    // Fail silently (e.g. before user interaction)
  }
};

export const playHover = () => {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  } catch (e) {
    // Fail silently
  }
};

export const playNodeSelect = () => {
  try {
    initAudio();
    const time = audioCtx.currentTime;
    
    // Quick dual-tone chord sound
    [523.25, 783.99].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + idx * 0.03);
      
      gainNode.gain.setValueAtTime(0.08, time + idx * 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.03 + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(time + idx * 0.03);
      osc.stop(time + idx * 0.03 + 0.26);
    });
  } catch (e) {
    // Fail silently
  }
};

export const startAmbientHum = () => {
  try {
    initAudio();
    if (ambientOsc1) return; // Already running
    
    ambientGain = audioCtx.createGain();
    ambientGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 2.0); // Smooth fade in
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, audioCtx.currentTime);
    
    ambientOsc1 = audioCtx.createOscillator();
    ambientOsc1.type = 'sawtooth';
    ambientOsc1.frequency.setValueAtTime(55, audioCtx.currentTime); // A1 note
    
    ambientOsc2 = audioCtx.createOscillator();
    ambientOsc2.type = 'square';
    ambientOsc2.frequency.setValueAtTime(55.3, audioCtx.currentTime); // Detuned
    
    ambientOsc1.connect(filter);
    ambientOsc2.connect(filter);
    filter.connect(ambientGain);
    ambientGain.connect(audioCtx.destination);
    
    ambientOsc1.start();
    ambientOsc2.start();
  } catch (e) {
    console.warn("Ambient hum failed to start:", e);
  }
};

export const stopAmbientHum = () => {
  try {
    if (!ambientOsc1 || !audioCtx) return;
    const currentGain = ambientGain;
    const osc1 = ambientOsc1;
    const osc2 = ambientOsc2;
    
    currentGain.gain.setValueAtTime(currentGain.gain.value, audioCtx.currentTime);
    currentGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4); // Smooth fade out
    
    setTimeout(() => {
      try {
        osc1.stop();
        osc2.stop();
      } catch (err) {}
    }, 500);
    
    ambientOsc1 = null;
    ambientOsc2 = null;
    ambientGain = null;
  } catch (e) {
    console.warn("Ambient hum failed to stop:", e);
  }
};
