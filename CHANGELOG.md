# Changelog

All notable changes to the **Terminal Music Notifier** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2026-02-28

### Added

- 🎵 Built-in notification sounds: **GTA San Andreas** (success) and **FAAAH** (error)
- 🎶 Bundled **GTA San Andreas Mission Complete** MP3 (`gta_sa_mission.mp3`)
- 🔊 Terminal command exit code detection via VS Code Shell Integration API
- 🎧 Custom sound support (`.mp3`, `.wav`, `.ogg`, `.flac`, `.aac` — max 5 seconds)
- 🎚️ Configurable volume control (0.0 – 1.0)
- ⚙️ Independent success/error sound toggles (`"default"`, `"custom"`, `"none"`)
- 📋 Five Command Palette actions:
  - Terminal Music Notifier: Enable
  - Terminal Music Notifier: Disable
  - Terminal Music Notifier: Select Custom Success Sound
  - Terminal Music Notifier: Select Custom Error Sound
  - Terminal Music Notifier: Reset to Default Sounds
- 🖥️ Cross-platform support: Windows, macOS, Linux
- 📄 MIT License
- 📖 Full documentation (README, CHANGELOG, LICENSE)

### Technical Details

- Minimum VS Code version: `1.93.0`
- Audio playback via `sound-play` (native, non-blocking)
- Audio validation via `mp3-duration` + WAV header parsing
- 500ms cooldown to prevent rapid-fire triggers
- Repository: [github.com/arihant4521k/terminal-music-notifier](https://github.com/arihant4521k/terminal-music-notifier)
