# TrackGet

A Windows desktop app for downloading SoundCloud playlists as MP3 files. Built with Electron, React (TypeScript + Tailwind CSS), and [yt-dlp](https://github.com/yt-dlp/yt-dlp) via `youtube-dl-exec`.

## How it works

1. Paste a playlist URL.
2. Choose a destination folder.
3. Start the download. Progress output from yt-dlp streams into the UI.

Each track is extracted to MP3 (best quality) and saved as `<title>.<ext>` in the chosen folder.

## Project structure

| Path | Purpose |
|------|---------|
| `electron/main.js` | Electron main process: creates the window, handles IPC (`choose-folder`, `start-download`) |
| `electron/preload.js` | Preload script exposing a safe API to the renderer (context isolation on) |
| `backend/downloader.js` | Spawns yt-dlp and reports progress and completion (`DONE:<exit code>`) |
| `frontend/` | React UI (Create React App, TypeScript, Tailwind) |
| `assets/` | App icons for packaging |
| `dist/` | Installer output from electron-builder |

## Prerequisites

- Node.js and npm
- Windows (the installer target is NSIS; the packaged app uses `yt-dlp.exe`)
- For development: `yt-dlp` available on your `PATH`
- `ffmpeg` available on your `PATH` (required by yt-dlp for MP3 conversion)

## Setup

```bash
npm install
cd frontend && npm install
```

## Development

```bash
npm start
```

This runs the React dev server on `http://localhost:3000` and launches Electron once it is up.

## Building the installer

```bash
npm run dist
```

This builds the React app and packages it with electron-builder. The installer is written to `dist/`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | React dev server and Electron together |
| `npm run react` | React dev server only |
| `npm run electron` | Launch Electron (waits for the dev server) |
| `npm run react-build` | Production build of the frontend |
| `npm run electron-build` | Package with electron-builder |
| `npm run dist` | Full build and package |

## Disclaimer

Only download content you have the right to download, and respect the terms of service of SoundCloud and the content creators.
