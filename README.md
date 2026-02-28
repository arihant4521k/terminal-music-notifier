# Terminal Music Notifier 🔊

**Play audio notifications when terminal commands succeed or fail.**

Terminal Music Notifier enhances your development workflow by playing short sound effects based on terminal command exit codes. Instantly know whether your build passed, your tests succeeded, or a command failed — without looking at the terminal.

## Features

- 🎵 **Built-in Sounds** — Ships with two preloaded notification sounds:
  - **GTA San Andreas** (success) — an ascending chime played on exit code `0`
  - **FAAAH** (error) — a descending buzz played on non-zero exit codes
- 🎧 **Custom Sounds** — Replace either sound with your own `.mp3`, `.wav`, `.ogg`, `.flac`, or `.aac` file (max 5 seconds)
- 🔀 **Independent Toggles** — Enable/disable success and error sounds independently
- 🎚️ **Volume Control** — Adjust volume from `0.0` (silent) to `1.0` (full)
- ⚡ **Non-blocking** — Audio playback never freezes the VS Code UI
- 🖥️ **Cross-platform** — Works on Windows, macOS, and Linux

## Requirements

- **VS Code** ≥ 1.93.0 (required for terminal shell integration API)
- **Shell Integration** must be enabled (it is enabled by default in VS Code)
- **Linux only**: `paplay` (PulseAudio) or `aplay` (ALSA) must be available for audio playback

## Installation

### From VSIX file

1. Download or build the `.vsix` file (see [Build Instructions](#build-instructions))
2. Open VS Code
3. Run **Extensions: Install from VSIX…** from the Command Palette (`Ctrl+Shift+P`)
4. Select the `.vsix` file

### From Marketplace

Search for **"Terminal Music Notifier"** in the VS Code Extensions sidebar.

## Configuration

Add these to your `settings.json`, or use the Settings UI:

```json
{
  "terminalMusicNotifier.enable": true,
  "terminalMusicNotifier.successSound": "default",
  "terminalMusicNotifier.errorSound": "default",
  "terminalMusicNotifier.customSuccessSoundPath": "",
  "terminalMusicNotifier.customErrorSoundPath": "",
  "terminalMusicNotifier.volume": 0.8
}
```

| Setting                  | Type      | Default     | Description                          |
| ------------------------ | --------- | ----------- | ------------------------------------ |
| `enable`                 | `boolean` | `true`      | Master on/off switch                 |
| `successSound`           | `string`  | `"default"` | `"default"`, `"custom"`, or `"none"` |
| `errorSound`             | `string`  | `"default"` | `"default"`, `"custom"`, or `"none"` |
| `customSuccessSoundPath` | `string`  | `""`        | Path to custom success audio file    |
| `customErrorSoundPath`   | `string`  | `""`        | Path to custom error audio file      |
| `volume`                 | `number`  | `0.8`       | Volume level (0.0 – 1.0)             |

## Commands

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type:

| Command                                                | Description                          |
| ------------------------------------------------------ | ------------------------------------ |
| `Terminal Music Notifier: Enable`                      | Turn on sound notifications          |
| `Terminal Music Notifier: Disable`                     | Turn off sound notifications         |
| `Terminal Music Notifier: Select Custom Success Sound` | Pick a custom audio file for success |
| `Terminal Music Notifier: Select Custom Error Sound`   | Pick a custom audio file for errors  |
| `Terminal Music Notifier: Reset to Default Sounds`     | Revert to built-in sounds            |

### Custom Sound Guidelines

- **Supported formats**: `.mp3`, `.wav`, `.ogg`, `.flac`, `.aac`
- **Maximum duration**: 5 seconds
- The extension validates your file before accepting it

## How It Works

The extension uses the VS Code [Shell Integration API](https://code.visualstudio.com/docs/terminal/shell-integration) to detect when a terminal command finishes and what its exit code is:

- **Exit code `0`**: Command succeeded → plays success sound
- **Non-zero exit code**: Command failed → plays error sound
- **Undefined exit code**: Terminal closed by user → no sound (intentional)

A 500ms cooldown prevents rapid-fire triggering from background processes.

## Build Instructions

### Prerequisites

- Node.js ≥ 18
- npm

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Generate audio files
node generate-sounds.js

# 3. Compile TypeScript
npm run compile

# 4. Package as .vsix
npx @vscode/vsce package --allow-missing-repository

# 5. Test locally
# Press F5 in VS Code to launch Extension Development Host
```

### Publish to Marketplace

```bash
# Login to your publisher account
npx @vscode/vsce login <publisher-name>

# Publish
npx @vscode/vsce publish
```

## Architecture

```
terminal-music-notifier/
├── src/
│   ├── extension.ts        # Entry point, command registration
│   ├── terminalMonitor.ts   # Shell execution event listener
│   ├── audioPlayer.ts       # Cross-platform audio playback
│   ├── audioValidator.ts    # File format & duration validation
│   └── config.ts            # Settings management
├── media/
│   ├── success.wav          # Built-in success sound
│   └── error.wav            # Built-in error sound
├── package.json
└── tsconfig.json
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run compile` to verify
5. Submit a pull request
