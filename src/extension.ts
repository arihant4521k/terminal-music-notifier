import * as vscode from 'vscode';
import { Config, SUPPORTED_AUDIO_EXTENSIONS } from './config.js';
import { AudioPlayer } from './audioPlayer.js';
import { TerminalMonitor } from './terminalMonitor.js';
import { validateAudioFile } from './audioValidator.js';

let terminalMonitor: TerminalMonitor | undefined;
let audioPlayer: AudioPlayer | undefined;

/**
 * Extension activation entry point.
 * Called when VS Code starts (onStartupFinished).
 */
export function activate(context: vscode.ExtensionContext): void {
    const config = new Config(context.extensionUri);
    audioPlayer = new AudioPlayer();
    terminalMonitor = new TerminalMonitor(audioPlayer, config);

    // Start monitoring terminal events
    terminalMonitor.start();

    // ── Register commands ──────────────────────────────────────────────

    // Enable
    context.subscriptions.push(
        vscode.commands.registerCommand('terminalMusicNotifier.enable', async () => {
            await config.update('enable', true);
            vscode.window.showInformationMessage('🔊 Terminal Music Notifier: Enabled');
        })
    );

    // Disable
    context.subscriptions.push(
        vscode.commands.registerCommand('terminalMusicNotifier.disable', async () => {
            await config.update('enable', false);
            vscode.window.showInformationMessage('🔇 Terminal Music Notifier: Disabled');
        })
    );

    // Select Custom Success Sound
    context.subscriptions.push(
        vscode.commands.registerCommand('terminalMusicNotifier.selectSuccessSound', async () => {
            await selectCustomSound(config, 'success');
        })
    );

    // Select Custom Error Sound
    context.subscriptions.push(
        vscode.commands.registerCommand('terminalMusicNotifier.selectErrorSound', async () => {
            await selectCustomSound(config, 'error');
        })
    );

    // Reset to Defaults
    context.subscriptions.push(
        vscode.commands.registerCommand('terminalMusicNotifier.resetDefaults', async () => {
            await config.update('successSound', 'default');
            await config.update('errorSound', 'default');
            await config.update('customSuccessSoundPath', '');
            await config.update('customErrorSoundPath', '');
            vscode.window.showInformationMessage('🔄 Terminal Music Notifier: Reset to default sounds');
        })
    );

    // Register disposables
    context.subscriptions.push({
        dispose: () => {
            terminalMonitor?.dispose();
            audioPlayer?.dispose();
        },
    });

    console.log('[Terminal Music Notifier] Extension activated');
}

/**
 * Extension deactivation.
 */
export function deactivate(): void {
    terminalMonitor?.dispose();
    audioPlayer?.dispose();
    console.log('[Terminal Music Notifier] Extension deactivated');
}

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Open a file dialog for the user to select a custom sound file,
 * validate it, and update the configuration.
 */
async function selectCustomSound(config: Config, type: 'success' | 'error'): Promise<void> {
    const label = type === 'success' ? 'Success' : 'Error';

    // Build file filter from supported extensions
    const filterExts = SUPPORTED_AUDIO_EXTENSIONS.map((ext) => ext.slice(1)); // remove leading dot

    const uri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: `Select ${label} Sound`,
        filters: {
            'Audio Files': filterExts,
        },
    });

    if (!uri || uri.length === 0) {
        return; // User cancelled
    }

    const filePath = uri[0].fsPath;

    // Validate the selected file
    const result = await validateAudioFile(filePath);
    if (!result.valid) {
        vscode.window.showErrorMessage(`❌ Invalid audio file: ${result.error}`);
        return;
    }

    // Update configuration
    const soundKey = type === 'success' ? 'successSound' : 'errorSound';
    const pathKey = type === 'success' ? 'customSuccessSoundPath' : 'customErrorSoundPath';

    await config.update(soundKey, 'custom');
    await config.update(pathKey, filePath);

    vscode.window.showInformationMessage(
        `✅ Custom ${label.toLowerCase()} sound set: ${filePath}`
    );
}
