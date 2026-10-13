# TrackGet

A Windows desktop app for downloading SoundCloud playlists as MP3 files. Built with Electron, React (TypeScript + Tailwind CSS), and [yt-dlp](https://github.com/yt-dlp/yt-dlp) via `youtube-dl-exec`.

## How it works

1. Paste a playlist URL.
2. Choose a destination folder.
3. Choose how many tracks to download at once (1–8, default 3).
4. Start the download. A progress panel appears beside the main card with one row per track; a fill sweeps across each track's title as it downloads, and failed tracks turn red. The console (toggle in the UI) shows the raw yt-dlp output, prefixed with the track number.

Each track is extracted to MP3 (best quality) and saved as `<title>.<ext>` in the chosen folder, with ID3 metadata (title, artist, etc.) and the cover art embedded.

Downloads run as a pool of parallel yt-dlp processes, one per track. SoundCloud may rate-limit (HTTP 429) if you use too many; 3–4 is a safe range.

## Changelog

### 1.1.0

- Per-track progress panel replaces the single progress bar.
- Download multiple tracks simultaneously, with a configurable limit (max 8).
- Embed metadata and cover art in each MP3.
- Fix: packaged EXE failed immediately with `DONE:-4058` because the bundled yt-dlp path was ignored; it is now passed correctly.
- Spawn failures are reported in the UI instead of causing an unhandled error.

## Project structure

| Path | Purpose |
|------|---------|
| `electron/main.js` | Electron main process: creates the window, handles IPC (`choose-folder`, `start-download`) |
| `electron/preload.js` | Preload script exposing a safe API to the renderer (context isolation on) |
| `backend/downloader.js` | Looks up the playlist's tracks, runs yt-dlp in parallel, and reports per-track progress (`TRACKS:`, `LINE:`, `TRACKDONE:`, `DONE:` messages) |
| `frontend/` | React UI (Create React App, TypeScript, Tailwind), including the track progress panel |
| `assets/` | App icons for packaging |
| `dist/` | Installer output from electron-builder |

## Prerequisites

- Node.js and npm
- Windows (the installer target is NSIS; the packaged app uses `yt-dlp.exe`)
- For development: `yt-dlp` available on your `PATH`
- `ffmpeg` available on your `PATH` (required by yt-dlp for MP3 conversion and for embedding metadata and cover art). It is not bundled, so the packaged app also needs it installed.

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
