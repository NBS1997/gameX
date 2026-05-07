import type { LunarPhase } from '../level/types.ts';

const MASTER_GAIN = 0.7;
const BED_GAIN = 0.05;
const BED_FILTER_Q = 0.7;
const PHASE_FILTER_RAMP_S = 1.5;

const PHASE_CUTOFF: Record<LunarPhase, number> = {
  'waxing-crescent': 800,
  full: 2000,
  'waning-gibbous': 1400,
};

const PHASE_BED_GAIN: Record<LunarPhase, number> = {
  'waxing-crescent': BED_GAIN * 0.85,
  full: BED_GAIN * 1.1,
  'waning-gibbous': BED_GAIN * 0.95,
};

export interface AudioManager {
  readonly started: boolean;
  start(initialPhase: LunarPhase): Promise<void>;
  setPhase(phase: LunarPhase): void;
  pressAttack(): void;
  releaseWhoosh(holdMs: number): void;
  goalMet(): void;
  softDriftSigh(): void;
  duckBed(amount: number, attackS: number): void;
  unduckBed(releaseS: number): void;
  finalBell(): void;
  fadeToSilence(durationS: number): void;
  restoreMaster(rampS: number): void;
}

export function createAudioManager(): AudioManager {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let bedFilter: BiquadFilterNode | null = null;
  let bedGain: GainNode | null = null;
  let bedDuckTarget = 1;
  let activePhase: LunarPhase = 'waxing-crescent';
  let started = false;
  let startPromise: Promise<void> | null = null;

  const start = (initialPhase: LunarPhase): Promise<void> => {
    if (started) return Promise.resolve();
    if (startPromise) return startPromise;
    startPromise = bootstrap(initialPhase);
    return startPromise;
  };

  const bootstrap = async (initialPhase: LunarPhase): Promise<void> => {
    activePhase = initialPhase;
    const audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    ctx = audioCtx;

    const master = audioCtx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(audioCtx.destination);
    masterGain = master;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = PHASE_CUTOFF[initialPhase];
    filter.Q.value = BED_FILTER_Q;
    bedFilter = filter;

    const gain = audioCtx.createGain();
    gain.gain.value = PHASE_BED_GAIN[initialPhase];
    gain.connect(master);
    bedGain = gain;

    filter.connect(gain);

    // Three layered tones for an "ocean-ish" drone.
    const tones: { freq: number; type: OscillatorType; gain: number }[] = [
      { freq: 55, type: 'sine', gain: 0.6 },
      { freq: 110.3, type: 'sine', gain: 0.4 },
      { freq: 165.5, type: 'sine', gain: 0.25 },
    ];

    for (const tone of tones) {
      const osc = audioCtx.createOscillator();
      osc.type = tone.type;
      osc.frequency.value = tone.freq;
      const oscGain = audioCtx.createGain();
      oscGain.gain.value = tone.gain;
      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
    }

    started = true;
  };

  const setPhase = (phase: LunarPhase): void => {
    if (!ctx || !bedFilter || !bedGain) return;
    activePhase = phase;
    const now = ctx.currentTime;
    bedFilter.frequency.cancelScheduledValues(now);
    bedFilter.frequency.setValueAtTime(bedFilter.frequency.value, now);
    bedFilter.frequency.linearRampToValueAtTime(
      PHASE_CUTOFF[phase],
      now + PHASE_FILTER_RAMP_S,
    );
    bedGain.gain.cancelScheduledValues(now);
    bedGain.gain.setValueAtTime(bedGain.gain.value, now);
    bedGain.gain.linearRampToValueAtTime(
      PHASE_BED_GAIN[phase] * bedDuckTarget,
      now + PHASE_FILTER_RAMP_S,
    );
  };

  const duckBed = (amount: number, attackS: number): void => {
    if (!ctx || !bedGain) return;
    bedDuckTarget = Math.max(0, Math.min(1, 1 - amount));
    const now = ctx.currentTime;
    const target = computeBedGain() * bedDuckTarget;
    bedGain.gain.cancelScheduledValues(now);
    bedGain.gain.setValueAtTime(bedGain.gain.value, now);
    bedGain.gain.linearRampToValueAtTime(target, now + attackS);
  };

  const unduckBed = (releaseS: number): void => {
    if (!ctx || !bedGain) return;
    bedDuckTarget = 1;
    const now = ctx.currentTime;
    const target = computeBedGain();
    bedGain.gain.cancelScheduledValues(now);
    bedGain.gain.setValueAtTime(bedGain.gain.value, now);
    bedGain.gain.linearRampToValueAtTime(target, now + releaseS);
  };

  const computeBedGain = (): number => {
    return PHASE_BED_GAIN[activePhase];
  };

  const pressAttack = (): void => {
    if (!ctx || !masterGain) return;
    const noise = makeNoiseSource(ctx, 0.5);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 0.5);
  };

  const releaseWhoosh = (holdMs: number): void => {
    if (!ctx || !masterGain) return;
    const intensity = Math.min(1, holdMs / 600);
    const noise = makeNoiseSource(ctx, 0.9);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2200;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const peak = 0.1 + 0.18 * intensity;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 0.4);
  };

  const goalMet = (): void => {
    if (!ctx || !masterGain) return;
    const now = ctx.currentTime;

    // Soft sine bell at A5 with envelope.
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.5);

    // Release swell variant: shaped noise, longer tail, paired with the bell.
    const noise = makeNoiseSource(ctx, 1.4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 1.3);
  };

  const softDriftSigh = (): void => {
    if (!ctx || !masterGain) return;
    const noise = makeNoiseSource(ctx, 1.0);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const now = ctx.currentTime;
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.8);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(now);
    noise.stop(now + 1.0);
  };

  const finalBell = (): void => {
    if (!ctx || !masterGain) return;
    const now = ctx.currentTime;
    // 880 Hz matches N1's goal-met bell — structural callback.
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.5);
  };

  const fadeToSilence = (durationS: number): void => {
    if (!ctx || !masterGain) return;
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + durationS);
  };

  const restoreMaster = (rampS: number): void => {
    if (!ctx || !masterGain) return;
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(MASTER_GAIN, now + rampS);
  };

  return {
    get started() {
      return started;
    },
    start,
    setPhase,
    pressAttack,
    releaseWhoosh,
    goalMet,
    softDriftSigh,
    duckBed,
    unduckBed,
    finalBell,
    fadeToSilence,
    restoreMaster,
  };
}

function makeNoiseSource(ctx: AudioContext, durationS: number): AudioBufferSourceNode {
  const sampleRate = ctx.sampleRate;
  const frames = Math.ceil(sampleRate * durationS);
  const buffer = ctx.createBuffer(1, frames, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}
