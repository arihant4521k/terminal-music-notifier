/**
 * WAV Audio Generator for Terminal Music Notifier
 * Generates two short notification WAV files programmatically.
 * Run: node generate-sounds.js
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const BITS_PER_SAMPLE = 16;
const NUM_CHANNELS = 1;

/**
 * Create a WAV file buffer from PCM samples.
 */
function createWavBuffer(samples) {
    const dataSize = samples.length * 2; // 16-bit = 2 bytes per sample
    const fileSize = 44 + dataSize;
    const buffer = Buffer.alloc(fileSize);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(fileSize - 8, 4);
    buffer.write('WAVE', 8);

    // fmt subchunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20);  // AudioFormat (PCM)
    buffer.writeUInt16LE(NUM_CHANNELS, 22);
    buffer.writeUInt32LE(SAMPLE_RATE, 24);
    buffer.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * BITS_PER_SAMPLE / 8, 28); // ByteRate
    buffer.writeUInt16LE(NUM_CHANNELS * BITS_PER_SAMPLE / 8, 32); // BlockAlign
    buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);

    // data subchunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    for (let i = 0; i < samples.length; i++) {
        const clamped = Math.max(-1, Math.min(1, samples[i]));
        const intVal = clamped < 0 ? clamped * 32768 : clamped * 32767;
        buffer.writeInt16LE(Math.round(intVal), 44 + i * 2);
    }

    return buffer;
}

/**
 * Generate a short ascending chime for "success" (GTA San Andreas style).
 * Three ascending notes with harmonics – cheerful and recognizable.
 */
function generateSuccessSound() {
    const duration = 1.5; // seconds
    const totalSamples = Math.floor(SAMPLE_RATE * duration);
    const samples = new Float64Array(totalSamples);

    // Three ascending notes: E5, G#5, B5 (E major chord arpeggio)
    const notes = [
        { freq: 659.25, start: 0.0, end: 0.5 },  // E5
        { freq: 830.61, start: 0.2, end: 0.7 },  // G#5
        { freq: 987.77, start: 0.4, end: 1.0 },  // B5
        { freq: 1318.5, start: 0.6, end: 1.4 },  // E6 (octave)
    ];

    for (const note of notes) {
        const startSample = Math.floor(note.start * SAMPLE_RATE);
        const endSample = Math.floor(note.end * SAMPLE_RATE);
        const noteDuration = endSample - startSample;

        for (let i = startSample; i < endSample && i < totalSamples; i++) {
            const t = (i - startSample) / SAMPLE_RATE;
            const progress = (i - startSample) / noteDuration;

            // ADSR envelope
            let envelope;
            if (progress < 0.05) {
                envelope = progress / 0.05; // Attack
            } else if (progress < 0.15) {
                envelope = 1.0 - (progress - 0.05) / 0.1 * 0.3; // Decay
            } else if (progress < 0.7) {
                envelope = 0.7; // Sustain
            } else {
                envelope = 0.7 * (1.0 - (progress - 0.7) / 0.3); // Release
            }

            // Fundamental + harmonics for richer tone
            const fundamental = Math.sin(2 * Math.PI * note.freq * t);
            const harmonic2 = 0.3 * Math.sin(2 * Math.PI * note.freq * 2 * t);
            const harmonic3 = 0.1 * Math.sin(2 * Math.PI * note.freq * 3 * t);

            samples[i] += 0.25 * envelope * (fundamental + harmonic2 + harmonic3);
        }
    }

    return samples;
}

/**
 * Generate a descending "fail" sound (FAAAH style).
 * A descending tone with distortion-like buzz – unmistakably an error.
 */
function generateErrorSound() {
    const duration = 1.2; // seconds
    const totalSamples = Math.floor(SAMPLE_RATE * duration);
    const samples = new Float64Array(totalSamples);

    // Descending tones: buzz + low frequency drop
    for (let i = 0; i < totalSamples; i++) {
        const t = i / SAMPLE_RATE;
        const progress = i / totalSamples;

        // Frequency descends from 400Hz to 150Hz
        const freq = 400 - 250 * progress;

        // Envelope: quick attack, sustained, fades at end
        let envelope;
        if (progress < 0.03) {
            envelope = progress / 0.03;
        } else if (progress < 0.7) {
            envelope = 1.0;
        } else {
            envelope = (1.0 - progress) / 0.3;
        }

        // Main tone (slightly square-wave-ish for "buzz" feel)
        const sine = Math.sin(2 * Math.PI * freq * t);
        const square = Math.sign(sine) * 0.3;
        const saw = ((freq * t) % 1 - 0.5) * 0.2;

        // Sub-bass reinforcement
        const subBass = 0.3 * Math.sin(2 * Math.PI * (freq * 0.5) * t);

        // Combine
        samples[i] = 0.35 * envelope * (sine * 0.5 + square + saw + subBass);
    }

    return samples;
}

// ── Main ───────────────────────────────────────────────────────────────

const mediaDir = path.join(__dirname, 'media');
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
}

const successSamples = generateSuccessSound();
const successBuffer = createWavBuffer(successSamples);
fs.writeFileSync(path.join(mediaDir, 'success.wav'), successBuffer);
console.log('✅ Generated media/success.wav');

const errorSamples = generateErrorSound();
const errorBuffer = createWavBuffer(errorSamples);
fs.writeFileSync(path.join(mediaDir, 'error.wav'), errorBuffer);
console.log('✅ Generated media/error.wav');

console.log('Done! Audio files ready in media/');
