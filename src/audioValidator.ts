import * as fs from 'fs';
import * as path from 'path';
import { SUPPORTED_AUDIO_EXTENSIONS, MAX_AUDIO_DURATION_SECONDS } from './config.js';

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validates a user-selected audio file for format and duration constraints.
 */
export async function validateAudioFile(filePath: string): Promise<ValidationResult> {
    // 1. Check file exists
    if (!fs.existsSync(filePath)) {
        return { valid: false, error: `File not found: ${filePath}` };
    }

    // 2. Check extension
    const ext = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_AUDIO_EXTENSIONS.includes(ext)) {
        return {
            valid: false,
            error: `Unsupported audio format "${ext}". Supported: ${SUPPORTED_AUDIO_EXTENSIONS.join(', ')}`,
        };
    }

    // 3. Check file is readable
    try {
        fs.accessSync(filePath, fs.constants.R_OK);
    } catch {
        return { valid: false, error: `File is not readable: ${filePath}` };
    }

    // 4. Check duration
    try {
        const duration = await getAudioDuration(filePath, ext);
        if (duration !== undefined && duration > MAX_AUDIO_DURATION_SECONDS) {
            return {
                valid: false,
                error: `Audio file is ${duration.toFixed(1)}s long. Maximum allowed duration is ${MAX_AUDIO_DURATION_SECONDS} seconds.`,
            };
        }
    } catch (err) {
        // Duration check failed – allow file but warn
        console.warn(`[Terminal Music Notifier] Could not determine audio duration: ${err}`);
    }

    return { valid: true };
}

/**
 * Get the duration of an audio file in seconds.
 * Supports WAV (header parsing) and MP3 (via mp3-duration package).
 * For other formats, returns undefined (cannot validate duration without ffprobe).
 */
async function getAudioDuration(filePath: string, ext: string): Promise<number | undefined> {
    if (ext === '.wav') {
        return getWavDuration(filePath);
    }

    if (ext === '.mp3') {
        return getMp3Duration(filePath);
    }

    // For .ogg, .flac, .aac – duration validation is skipped
    // as parsing these formats requires heavy dependencies.
    return undefined;
}

/**
 * Parse WAV header to calculate duration.
 * WAV format: RIFF header → fmt chunk → data chunk.
 */
function getWavDuration(filePath: string): number | undefined {
    try {
        const buffer = Buffer.alloc(44);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 44, 0);
        fs.closeSync(fd);

        // Verify RIFF header
        const riff = buffer.toString('ascii', 0, 4);
        const wave = buffer.toString('ascii', 8, 12);
        if (riff !== 'RIFF' || wave !== 'WAVE') {
            return undefined;
        }

        // Read fmt chunk
        const numChannels = buffer.readUInt16LE(22);
        const sampleRate = buffer.readUInt32LE(24);
        const bitsPerSample = buffer.readUInt16LE(34);

        if (sampleRate === 0 || numChannels === 0 || bitsPerSample === 0) {
            return undefined;
        }

        // Read data chunk size
        const dataSize = buffer.readUInt32LE(40);
        const bytesPerSample = bitsPerSample / 8;
        const totalSamples = dataSize / (numChannels * bytesPerSample);
        return totalSamples / sampleRate;
    } catch {
        return undefined;
    }
}

/**
 * Get MP3 duration using the mp3-duration package.
 */
async function getMp3Duration(filePath: string): Promise<number | undefined> {
    try {
        const mp3Duration = await import('mp3-duration');
        const durationFn = mp3Duration.default || mp3Duration;
        return new Promise<number>((resolve, reject) => {
            durationFn(filePath, (err: Error | null, duration: number) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(duration);
                }
            });
        });
    } catch {
        return undefined;
    }
}
