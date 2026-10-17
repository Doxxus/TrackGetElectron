import React, { useState, useEffect } from "react";
import { parseProgress, parseTrackTitle } from "./utils";
import { Toast } from "./Toast";
import { Track, TrackProgressPanel } from "./TrackProgressPanel";

const MAX_CONCURRENCY = 8;

export default function App() {
  const toggleDark = () => setDark(prev => !prev);

  const [dark, setDark] = useState(false);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState(""); 
  const [tracks, setTracks] = useState<Track[]>([]);
  const [concurrency, setConcurrency] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [folder, setFolder] = useState<string | null>(null);

  async function chooseFolder() {
    const selected = await window.electronAPI.chooseFolder();
    setFolder(selected);
  }

  async function startDownload() {
    if (!folder) return alert("Choose a folder first");
    setTracks([]);
    setIsRunning(true);
    window.electronAPI.startDownload(url, folder, concurrency);
  }

  useEffect(() => {
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(systemPrefersDark);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

  useEffect(() => {
    function updateTrack(index: number, patch: (t: Track) => Partial<Track>) {
      setTracks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch(t) } : t)));
    }

    function handleTrackLine(index: number, line: string) {
      setConsoleLines((prev) => [...prev, `[${index + 1}] ${line}`]);

      const destination = parseTrackTitle(line);
      if (destination) {
        const name = destination.trim().replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, "");
        updateTrack(index, (t) => ({
          status: "downloading",
          title: /^Track \d+$/.test(t.title) ? name : t.title,
        }));
        return;
      }

      const pct = parseProgress(line);
      if (pct !== null) {
        updateTrack(index, () => ({ status: "downloading", progress: pct }));
      }
    }

    window.electronAPI.onProgress((msg) => {
      if (msg.startsWith("TRACKS:")) {
        const titles: string[] = JSON.parse(msg.slice("TRACKS:".length));
        setTracks(titles.map((title) => ({ title, progress: 0, status: "pending" })));
        return;
      }

      const trackLine = msg.match(/^LINE:(\d+):([\s\S]*)$/);
      if (trackLine) {
        const index = parseInt(trackLine[1], 10);
        trackLine[2].split(/\r?\n/).filter(Boolean).forEach((l) => handleTrackLine(index, l));
        return;
      }

      const trackDone = msg.match(/^TRACKDONE:(\d+):(-?\d+)(?::([\s\S]*))?$/);
      if (trackDone) {
        const ok = trackDone[2] === "0";
        updateTrack(parseInt(trackDone[1], 10), (t) => ({
          status: ok ? "done" : "error",
          progress: ok ? 100 : t.progress,
          error: ok ? undefined : trackDone[3] || "Download failed",
        }));
        return;
      }

      if (msg.startsWith("DONE:")) {
        const failed = parseInt(msg.slice("DONE:".length), 10);
        setIsRunning(false);
        setToast(failed === 0 ? "Download complete" : `Finished with ${failed} failed track(s)`);
        return;
      }

      setConsoleLines((prev) => [...prev, msg]);
    });
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-500 dark:from-deepPurple-950 dark:to-deepPurple-700 flex items-center justify-center gap-6 p-6 relative">
      <button
        onClick={toggleDark}
        className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-purple-200 dark:bg-deepPurple-500 text-deepPurple-600 dark:text-purple-200 shadow hover:scale-105 transition">
        {dark ? "Light Mode" : "Dark Mode"}
      </button>

      {toast && <Toast message={toast} />}

      <div className="backdrop-blur-xl bg-white/70 dark:bg-purple-900/60 shadow-2xl rounded-2xl p-10 w-full max-w-xl border border-white/40 dark:border-purple-700/40">
        <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100 text-center mb-6 tracking-tight">
          SoundCloud Playlist Downloader
        </h1>

        <p className="text-purple-600 dark:text-purple-300 text-center mb-8">
          Paste a playlist URL below and we’ll fetch every track for you.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="https://soundcloud.com/playlist/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full p-4 rounded-xl border border-purple-300 dark:border-deepPurple-600 bg-white/80 dark:bg-deepPurple-800/60 text-deepPurple-900 dark:text-deepPurple-100 shadow-sm focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition"
          />

          <label className="flex items-center justify-between text-purple-800 dark:text-purple-200 font-medium">
            Simultaneous downloads
            <input
              type="number"
              min={1}
              max={MAX_CONCURRENCY}
              value={concurrency}
              disabled={isRunning}
              onChange={e => setConcurrency(Math.min(MAX_CONCURRENCY, Math.max(1, parseInt(e.target.value, 10) || 1)))}
              className="w-20 p-2 rounded-lg border border-purple-300 dark:border-deepPurple-600 bg-white/80 dark:bg-deepPurple-800/60 text-deepPurple-900 dark:text-deepPurple-100 text-center"
            />
          </label>

          <button onClick={chooseFolder} className="w-full py-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all">Choose Folder</button>
          <button onClick={startDownload} disabled={isRunning} className="w-full py-4 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all">{isRunning ? "Downloading..." : "Download Playlist"}</button>

        </div>

        {status && (
          <p className="mt-6 text-center text-purple-800 dark:text-purple-200 font-medium">
            {status}
          </p>
        )}

        <div className="mt-6">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow transition"
          >
            {showConsole ? "Hide Console" : "Show Console"}
          </button>

          {showConsole && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl h-48 overflow-y-auto text-sm font-mono text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
              {consoleLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {tracks.length > 0 && <TrackProgressPanel tracks={tracks} />}
    </div>
  );
}