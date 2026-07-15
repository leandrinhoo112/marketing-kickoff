// src/game/sounds.ts
// Handles all game audio:
//  - Synthetic sounds (whistle, slide) generated via Web Audio API
//  - Team-specific MP3 goal anthems loaded from /public/sounds/

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  // Resume suspended context (required after a user gesture)
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// ── Team anthem cache ─────────────────────────────────────────────────────────
// Maps teamId → decoded AudioBuffer (loaded once, played many times)

const anthemCache = new Map<string, AudioBuffer>();
let currentAnthem: AudioBufferSourceNode | null = null;

const TEAM_SOUND_MAP: Record<string, string> = {
  athletico: '/sounds/athletico.mp3',
  coritiba:  '/sounds/coritiba.mp3',
  flamengo:  '/sounds/flamengo.mp3',
  gremio:    '/sounds/gremio.mp3',
  saopaulo:  '/sounds/saopaulo.mp3',
  sport:     '/sounds/sport.wav',
  vasco:     '/sounds/vasco.mp3',
  inspirar1: '/sounds/inspirar1.mp3',
  inspirar2: '/sounds/inspirar2.mp3',
};

/** Pre-load a team's anthem into the cache (call on team hover/selection for snappy playback) */
export async function preloadAnthem(teamId: string): Promise<void> {
  const url = TEAM_SOUND_MAP[teamId];
  if (!url || anthemCache.has(teamId)) return;
  try {
    const ctx = getCtx();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    anthemCache.set(teamId, audioBuffer);
  } catch (e) {
    console.warn(`Failed to preload anthem for ${teamId}:`, e);
  }
}

/** Stop any currently playing anthem */
export function stopAnthem(): void {
  try {
    currentAnthem?.stop();
    currentAnthem = null;
  } catch (_) {}
}

/**
 * Play a team's goal anthem.
 * Falls back to the synthetic goal sound if the MP3 isn't available.
 * @param teamId - the team whose anthem to play
 * @param volume - 0 to 1, default 1
 */
export function playTeamAnthem(teamId: string, volume = 1): void {
  stopAnthem();
  const buffer = anthemCache.get(teamId);
  if (buffer) {
    try {
      const ctx = getCtx();
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      source.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      // Fade out after 8 seconds
      gain.gain.setValueAtTime(volume, ctx.currentTime + 7);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 9);
      source.start(ctx.currentTime);
      source.stop(ctx.currentTime + 9);
      currentAnthem = source;
    } catch (e) {
      console.warn('Anthem playback failed:', e);
      playGoal(); // fallback
    }
  } else {
    // Anthem not cached yet — try to load and play
    const url = TEAM_SOUND_MAP[teamId];
    if (url) {
      fetch(url)
        .then(r => r.arrayBuffer())
        .then(ab => getCtx().decodeAudioData(ab))
        .then(buf => {
          anthemCache.set(teamId, buf);
          playTeamAnthem(teamId, volume);
        })
        .catch(() => playGoal());
    } else {
      playGoal();
    }
  }
}

// ── Synthetic sounds ──────────────────────────────────────────────────────────

export function playWhistle() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (_) {}
}

export function playSlide() {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.3;
    }
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    source.start(ctx.currentTime);
  } catch (_) {}
}

/** Synthetic goal celebration (used as fallback if MP3 not available) */
export function playGoal() {
  try {
    const ctx = getCtx();

    // Net impact thud
    const bufSize = ctx.sampleRate * 0.1;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * 0.4 * (1 - i / bufSize);
    const net = ctx.createBufferSource();
    net.buffer = buf;
    const gNet = ctx.createGain();
    net.connect(gNet);
    gNet.connect(ctx.destination);
    net.start(ctx.currentTime);

    // Triple whistle blast
    [0.15, 0.35, 0.55].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100 + i * 100, ctx.currentTime + offset);
      g.gain.setValueAtTime(0.3, ctx.currentTime + offset);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.15);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.15);
    });

    // Crowd cheer swell
    const crowdSize = ctx.sampleRate * 1.5;
    const crowdBuf = ctx.createBuffer(1, crowdSize, ctx.sampleRate);
    const crowdData = crowdBuf.getChannelData(0);
    for (let i = 0; i < crowdSize; i++) {
      crowdData[i] = (Math.random() * 2 - 1) * 0.15 * Math.min(i / (crowdSize * 0.1), 1);
    }
    const crowd = ctx.createBufferSource();
    crowd.buffer = crowdBuf;
    const crowdFilter = ctx.createBiquadFilter();
    crowdFilter.type = 'lowpass';
    crowdFilter.frequency.value = 1500;
    const crowdGain = ctx.createGain();
    crowd.connect(crowdFilter);
    crowdFilter.connect(crowdGain);
    crowdGain.connect(ctx.destination);
    crowdGain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    crowdGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.6);
    crowdGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
    crowd.start(ctx.currentTime + 0.1);
  } catch (_) {}
}
