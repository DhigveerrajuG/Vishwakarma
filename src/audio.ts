/**
 * Web Audio API Electronic Sound Synthesizer
 */

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

export function initAudio(): void {
    if (!audioCtx && typeof window !== 'undefined') {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
}

export function playBotChirp(freq = 440, type: OscillatorType = 'sine', duration = 0.08): void {
    if (isMuted) return;
    try {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
            void audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration);

        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch {
        // Fallback gracefully if browser policy blocks autoplay audio
    }
}

export function setMuted(muted: boolean): void {
    isMuted = muted;
}

export function toggleMuted(): boolean {
    isMuted = !isMuted;
    return isMuted;
}
