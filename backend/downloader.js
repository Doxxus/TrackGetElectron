const { app } = require("electron");
const path = require("path");
const ytdl = require("youtube-dl-exec");

const MAX_CONCURRENCY = 8;

function formatTitle(e) {
  const artist = (Array.isArray(e.artists) && e.artists[0]) || e.artist || e.uploader || e.channel;
  if (!e.title) return null;
  return artist ? `${artist} - ${e.title}` : e.title;
}

// Flat playlist entries often lack titles, so look those tracks up individually.
async function resolveTitle(yt, track) {
  try {
    const info = await yt(track.url, { dumpSingleJson: true, noPlaylist: true, ignoreNoFormatsError: true });
    return formatTitle(info);
  } catch {
    return null;
  }
}

async function fetchTracks(yt, url, onError) {
  try {
    const info = await yt(url, {
      flatPlaylist: true,
      dumpSingleJson: true,
      ignoreErrors: true,
      // lets metadata (title/artist) be read even when no downloadable format exists, e.g. DRM tracks
      ignoreNoFormatsError: true,
    });
    const entries = Array.isArray(info.entries) ? info.entries : [info];
    const tracks = entries
      .map((e, i) => ({
        title: formatTitle(e),
        fallback: `Track ${i + 1}`,
        url: e.url || e.webpage_url || (entries === info.entries ? null : url),
      }))
      .filter((t) => t.url);

    let next = 0;
    const lookupWorker = async () => {
      while (next < tracks.length) {
        const t = tracks[next++];
        if (!t.title) t.title = await resolveTitle(yt, t);
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, tracks.length) }, lookupWorker));

    return tracks.map((t) => ({ title: t.title || t.fallback, url: t.url }));
  } catch (err) {
    onError(`Playlist lookup failed: ${err.stderr || err.message}`);
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
    let reason = "";
    const finish = (code) => {
      if (settled) return;
      settled = true;
      resolve({ code, reason: code === 0 ? "" : reason });
    };

    const handleOutput = (data) => {
      const text = data.toString();
      if (/DRM protected/i.test(text)) reason = "DRM-protected, can't download";
      emit(text);
    };

    child.stdout?.on("data", handleOutput);
    child.stderr?.on("data", handleOutput);
    child.catch((err) => {
      emit(`ERROR: ${err.message}`);
      finish(-1);
    });
    child.on("close", (code) => finish(code));
  });
}

// Message protocol: TRACKS:<json>, LINE:<index>:<text>, TRACKDONE:<index>:<code>[:<reason>], DONE:<failedCount>
async function startDownload(url, folder, concurrency, onProgress) {
  const yt = app.isPackaged ? ytdl.create(path.join(process.resourcesPath, "yt-dlp", "yt-dlp.exe")) : ytdl;
  const limit = Math.min(Math.max(parseInt(concurrency, 10) || 1, 1), MAX_CONCURRENCY);

  let tracks = await fetchTracks(yt, url, (text) => onProgress(`ERROR:${text}`));
  if (tracks.length === 0) tracks = [{ title: "Track 1", url }];
  onProgress(`TRACKS:${JSON.stringify(tracks.map((t) => t.title))}`);

  let next = 0;
  let failed = 0;

  async function worker() {
    while (next < tracks.length) {
      const i = next++;
      const { code, reason } = await downloadOne(yt, tracks[i].url, folder, (text) => onProgress(`LINE:${i}:${text}`));
      if (code !== 0) failed++;
      onProgress(`TRACKDONE:${i}:${code}${reason ? `:${reason}` : ""}`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tracks.length) }, worker));
  onProgress(`DONE:${failed}`);
}

module.exports = { startDownload, MAX_CONCURRENCY };

