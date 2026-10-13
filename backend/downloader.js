const { app } = require("electron");
const path = require("path");
const ytdl = require("youtube-dl-exec");

function startDownload(url, folder, onProgress) {
  const ytDlpBinary = app.isPackaged ? path.join(process.resourcesPath, "yt-dlp", "yt-dlp.exe") : "yt-dlp";

  const child = ytdl.create(ytDlpBinary).exec(
    url,
    {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      output: path.join(folder, "%(title)s.%(ext)s"),
    },
    { stdio: "pipe" }
  );

  child.stdout?.on("data", (data) => onProgress(data.toString()));
  child.stderr?.on("data", (data) => onProgress(data.toString()));
  child.catch((err) => onProgress(`ERROR: ${err.message}`));
  child.on("close", (code) => onProgress(`DONE:${code}`));
}

module.exports = { startDownload };
