import * as vscode from 'vscode';
import * as path from 'path';

/** Supported audio file extensions */
export const SUPPORTED_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.aac'];

/** Maximum allowed duration for custom audio files (in seconds) */
export const MAX_AUDIO_DURATION_SECONDS = 5;

/** Configuration keys */
const CONFIG_SECTION = 'terminalMusicNotifier';

/**
 * Typed configuration reader for the Terminal Music Notifier extension.
 */
export class Config {
    private extensionUri: vscode.Uri;

    constructor(extensionUri: vscode.Uri) {
        this.extensionUri = extensionUri;
    }

    /** Whether the extension is globally enabled */
    isEnabled(): boolean {
        return this.get<boolean>('enable', true);
    }

    /** Get the volume level (0.0 – 1.0) */
    getVolume(): number {
        const vol = this.get<number>('volume', 0.8);
        return Math.max(0, Math.min(1, vol));
    }

    /** Get the success sound mode: "default" | "custom" | "none" */
    getSuccessSoundMode(): string {
        return this.get<string>('successSound', 'default');
    }

    /** Get the error sound mode: "default" | "custom" | "none" */
    getErrorSoundMode(): string {
        return this.get<string>('errorSound', 'default');
    }

    /** Get the custom success sound file path (user-provided) */
    getCustomSuccessSoundPath(): string {
        return this.get<string>('customSuccessSoundPath', '');
    }

    /** Get the custom error sound file path (user-provided) */
    getCustomErrorSoundPath(): string {
        return this.get<string>('customErrorSoundPath', '');
    }

    /**
     * Resolve the actual file path for the success sound.
     * Returns undefined if mode is "none" or custom path is missing.
     */
    resolveSuccessSoundPath(): string | undefined {
        const mode = this.getSuccessSoundMode();
        if (mode === 'none') {
            return undefined;
        }
        if (mode === 'custom') {
            const customPath = this.getCustomSuccessSoundPath();
            return customPath || undefined;
        }
        // default
        return vscode.Uri.joinPath(this.extensionUri, 'media', 'success.wav').fsPath;
    }

    /**
     * Resolve the actual file path for the error sound.
     * Returns undefined if mode is "none" or custom path is missing.
     */
    resolveErrorSoundPath(): string | undefined {
        const mode = this.getErrorSoundMode();
        if (mode === 'none') {
            return undefined;
        }
        if (mode === 'custom') {
            const customPath = this.getCustomErrorSoundPath();
            return customPath || undefined;
        }
        // default
        return vscode.Uri.joinPath(this.extensionUri, 'media', 'error.wav').fsPath;
    }

    /** Update a setting value */
    async update(key: string, value: any, global = true): Promise<void> {
        const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
        await config.update(key, value, global ? vscode.ConfigurationTarget.Global : undefined);
    }

    private get<T>(key: string, defaultValue: T): T {
        const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
        return config.get<T>(key, defaultValue);
    }
}
