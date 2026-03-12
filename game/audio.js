// audio.js - Web Audio API procedural sound effects
let ctx = null;
let masterGain = null;
let ambientNode = null;

export function initAudio() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(ctx.destination);
}

export function resumeAudio() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
}

export function playJump() {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.connect(gain).connect(masterGain);
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
}

export function playCollect() {
    if (!ctx) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.setValueAtTime(1108, ctx.currentTime);
    osc1.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
    osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.25);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.25);
}

export function playThrow() {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.connect(gain).connect(masterGain);
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
}

export function playImpact() {
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    source.connect(filter).connect(gain).connect(masterGain);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    source.start(ctx.currentTime);
}

export function playHit() {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.connect(gain).connect(masterGain);
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
}

export function playEngine() {
    if (!ctx) return;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);
    osc1.frequency.setValueAtTime(60, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.5);
    osc1.frequency.linearRampToValueAtTime(80, ctx.currentTime + 1.5);
    osc2.frequency.setValueAtTime(30, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 2.0);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 2.0);
}

export function playVictory() {
    if (!ctx) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.connect(gain).connect(masterGain);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.4);
    });
}

export function startAmbient() {
    if (!ctx || ambientNode) return;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = 55;
    osc2.type = 'sine';
    osc2.frequency.value = 110;
    filter.type = 'lowpass';
    filter.frequency.value = 200;
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain).connect(masterGain);
    gain.gain.value = 0.04;
    osc.start();
    osc2.start();
    ambientNode = { osc, osc2, gain };
}

export function stopAmbient() {
    if (ambientNode) {
        ambientNode.osc.stop();
        ambientNode.osc2.stop();
        ambientNode = null;
    }
}
