# Terminal Music Notifier 🔊

**Play audio notifications when terminal commands succeed or fail.**

Terminal Music Notifier enhances your development workflow by playing short sound effects based on terminal command exit codes. Instantly know whether your build passed, your tests succeeded, or a command failed — without looking at the terminal.

---

## Features

- 🎵 **Built-in Sounds** — Ships with preloaded notification sounds:
  - **GTA San Andreas** (success) — mission complete chime on exit code `0`
  - **FAAAH** (error) — alert sound on non-zero exit codes
- 🎧 **Custom Sounds** — Replace either sound with your own `.mp3`, `.wav`, `.ogg`, `.flac`, or `.aac` file (max 5 seconds)
- 🔀 **Independent Toggles** — Enable/disable success and error sounds independently
- 🎚️ **Volume Control** — Adjust volume from `0.0` (silent) to `1.0` (full)
- ⚡ **Non-blocking** — Audio playback never freezes the VS Code UI
- 🖥️ **Cross-platform** — Works on Windows, macOS, and Linux

---

## Requirements

- **VS Code** ≥ 1.93.0 (required for terminal shell integration API)
- **Shell Integration** must be enabled (enabled by default in VS Code)
- **Linux only**: `paplay` (PulseAudio) or `aplay` (ALSA) must be available

---

## Installation

### From VSIX File

1. Download the `.vsix` from [Releases](https://github.com/arihant4521k/terminal-music-notifier/releases) or build it yourself
2. Open VS Code
3. Run **Extensions: Install from VSIX…** from the Command Palette (`Ctrl+Shift+P`)
4. Select the `.vsix` file

### From Terminal

```bash
code --install-extension terminal-music-notifier-1.0.0.vsix
```

### From Marketplace

Search for **"Terminal Music Notifier"** in the VS Code Extensions sidebar.

---

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

---

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

---

## How It Works

The extension uses the VS Code [Shell Integration API](https://code.visualstudio.com/docs/terminal/shell-integration) to detect when a terminal command finishes:

- **Exit code `0`** → Command succeeded → plays success sound 🎵
- **Non-zero exit code** → Command failed → plays error sound 🔊
- **Undefined exit code** → Terminal closed by user → no sound

A 500ms cooldown prevents rapid-fire triggering from background processes.

---

## Build from Source

### Prerequisites

- Node.js ≥ 18
- npm

### Steps

```bash
# Clone the repository
git clone https://github.com/arihant4521k/terminal-music-notifier.git
cd terminal-music-notifier

# Install dependencies
npm install

# Generate default audio files (optional — already included)
node generate-sounds.js

# Compile TypeScript
npm run compile

# Package as .vsix
npx @vscode/vsce package --allow-missing-repository
```

### Debug Locally

Press **F5** in VS Code to launch the Extension Development Host.

---

## Publishing

```bash
# Login to your publisher account
npx @vscode/vsce login <publisher-name>

# Publish
npx @vscode/vsce publish
```

---

## Project Structure

```
terminal-music-notifier/
├── src/
│   ├── extension.ts        # Entry point, command registration
│   ├── terminalMonitor.ts   # Shell execution event listener
│   ├── audioPlayer.ts       # Cross-platform audio playback
│   ├── audioValidator.ts    # File format & duration validation
│   ├── config.ts            # Settings management
│   └── types.d.ts           # Type declarations
├── media/
│   ├── success.mp3          # Built-in success sound
│   ├── error.mp3            # Built-in error sound
│   ├── gta_sa_mission.mp3   # GTA San Andreas mission sound
│   └── icon.png             # Extension icon
├── package.json
├── tsconfig.json
├── generate-sounds.js
├── LICENSE              # MIT License
├── README.md
└── CHANGELOG.md
```

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Contributing

1. Fork the [repository](https://github.com/arihant4521k/terminal-music-notifier)
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run `npm run compile` to verify
5. Commit and push (`git push origin feature/my-feature`)
6. Open a Pull Request

---

**Made with ❤️ by [arihant4521k](https://github.com/arihant4521k)**
