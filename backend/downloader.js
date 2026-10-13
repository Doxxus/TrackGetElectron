const { app } = require("electron");
const path = require("path");
const ytdl = require("youtube-dl-exec");

const MAX_CONCURRENCY = 8;

async function fetchTracks(yt, url) {
  try {
    const info = await yt(url, { flatPlaylist: true, dumpSingleJson: true });
    const entries = Array.isArray(info.entries) ? info.entries : [info];
    return entries
      .map((e, i) => ({
        title: e.title || `Track ${i + 1}`,
        url: e.url || e.webpage_url || (entries === info.entries ? null : url),
      }))
      .filter((t) => t.url);
  } catch {
    return [];
  }
}

function downloadOne(yt, trackUrl, folder, emit) {
  return new Promise((resolve) => {
    const child = yt.exec(
      trackUrl,
      {
        extractAudio: true,
        audioFormat: "mp3",
        audioQuality: 0,
        embedMetadata: true,
        embedThumbnail: true,
        convertThumbnails: "jpg",
        newline: true,
        noPlaylist: true,
        output: path.join(folder, "%(title)s.%(ext)s"),
      },
      { stdio: "pipe" }
    );

    let settled = false;
    const finish = (code) => {
      if (settled) return;
      settled = true;
      resolve(code);
    };

    child.stdout?.on("data", (data) => emit(data.toString()));
    child.stderr?.on("data", (data) => emit(data.toString()));
    child.catch((err) => {
      emit(`ERROR: ${err.message}`);
      finish(-1);
    });
    child.on("close", (code) => finish(code));
  });
}

// Message protocol: TRACKS:<json>, LINE:<index>:<text>, TRACKDONE:<index>:<code>, DONE:<failedCount>
async function startDownload(url, folder, concurrency, onProgress) {
  const ytDlpBinary = app.isPackaged ? path.join(process.resourcesPath, "yt-dlp", "yt-dlp.exe") : "yt-dlp";
  const yt = ytdl.create(ytDlpBinary);
  const limit = Math.min(Math.max(parseInt(concurrency, 10) || 1, 1), MAX_CONCURRENCY);

  let tracks = await fetchTracks(yt, url);
  if (tracks.length === 0) tracks = [{ title: "Track 1", url }];
  onProgress(`TRACKS:${JSON.stringify(tracks.map((t) => t.title))}`);

  let next = 0;
  let failed = 0;

  async function worker() {
    while (next < tracks.length) {
      const i = next++;
      const code = await downloadOne(yt, tracks[i].url, folder, (text) => onProgress(`LINE:${i}:${text}`));
      if (code !== 0) failed++;
      onProgress(`TRACKDONE:${i}:${code}`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tracks.length) }, worker));
  onProgress(`DONE:${failed}`);
}

module.exports = { startDownload, MAX_CONCURRENCY };

