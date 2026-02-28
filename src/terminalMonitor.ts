import * as vscode from 'vscode';
import { AudioPlayer } from './audioPlayer.js';
import { Config } from './config.js';

/**
 * Monitors terminal shell executions and plays sounds based on exit codes.
 * Uses the VS Code Shell Integration API (requires VS Code ≥1.93).
 */
export class TerminalMonitor {
    private disposables: vscode.Disposable[] = [];
    private audioPlayer: AudioPlayer;
    private config: Config;
    private lastTriggerTime = 0;

    /** Minimum interval between sound triggers (ms) to avoid rapid repeats */
    private static readonly COOLDOWN_MS = 500;

    constructor(audioPlayer: AudioPlayer, config: Config) {
        this.audioPlayer = audioPlayer;
        this.config = config;
    }

    /**
     * Start listening for terminal shell execution end events.
     */
    start(): void {
        // Listen for terminal command completions
        if (vscode.window.onDidEndTerminalShellExecution) {
            const disposable = vscode.window.onDidEndTerminalShellExecution((event) => {
                this.handleShellExecution(event);
            });
            this.disposables.push(disposable);
        } else {
            vscode.window.showWarningMessage(
                'Terminal Music Notifier: Shell Integration API is not available. ' +
                'Please update VS Code to version 1.93 or later and ensure shell integration is enabled.'
            );
        }
    }

    /**
     * Handle a terminal shell execution end event.
     */
    private handleShellExecution(event: vscode.TerminalShellExecutionEndEvent): void {
        // Check if extension is enabled
        if (!this.config.isEnabled()) {
            return;
        }

        const exitCode = event.exitCode;

        // Ignore undefined exit codes (user-closed terminals, etc.)
        if (exitCode === undefined) {
            return;
        }

        // Enforce cooldown to prevent rapid-fire triggers
        const now = Date.now();
        if (now - this.lastTriggerTime < TerminalMonitor.COOLDOWN_MS) {
            return;
        }
        this.lastTriggerTime = now;

        // Determine success or failure
        if (exitCode === 0) {
            this.playSuccessSound();
        } else {
            this.playErrorSound();
        }
    }

    /**
     * Play the configured success sound.
     */
    private playSuccessSound(): void {
        const soundPath = this.config.resolveSuccessSoundPath();
        if (soundPath) {
            this.audioPlayer.playSound(soundPath, this.config.getVolume());
        }
    }

    /**
     * Play the configured error sound.
     */
    private playErrorSound(): void {
        const soundPath = this.config.resolveErrorSoundPath();
        if (soundPath) {
            this.audioPlayer.playSound(soundPath, this.config.getVolume());
        }
    }

    /**
     * Stop monitoring and clean up.
     */
    dispose(): void {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables = [];
    }
}
