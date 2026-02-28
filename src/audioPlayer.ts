import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel('Terminal Music Notifier');

/**
 * Cross-platform audio player using the `sound-play` npm package.
 * Playback is non-blocking and does not freeze the VS Code UI.
 */
export class AudioPlayer {
    private isPlaying = false;

    /**
     * Play an audio file at the specified volume.
     * If a sound is already playing, it will be allowed to finish
     * (we don't interrupt the previous one since notifications are short).
     *
     * @param filePath Absolute path to the audio file
     * @param volume Volume level from 0.0 to 1.0
     */
    async playSound(filePath: string, volume: number): Promise<void> {
        if (this.isPlaying) {
            // Skip if something is already playing to avoid overlapping sounds
            return;
        }

        this.isPlaying = true;

        try {
            const soundPlay = await import('sound-play');
            const play = soundPlay.default?.play || soundPlay.play;

            if (typeof play !== 'function') {
                throw new Error('sound-play module did not export a play function');
            }

            await play(filePath, volume);
        } catch (err: any) {
            outputChannel.appendLine(`[ERROR] Failed to play sound "${filePath}": ${err?.message || err}`);
            // Don't throw – audio failure should never crash the extension
        } finally {
            this.isPlaying = false;
        }
    }

    /** Dispose resources */
    dispose(): void {
        this.isPlaying = false;
    }
}
