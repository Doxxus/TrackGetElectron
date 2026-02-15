const { app } = require("electron");
const path = require("path");
const ytdl = require("youtube-dl-exec");

function startDownload(url, folder, onProgress) {
  const ytDlpBinary = app.isPackaged ? path.join(process.resourcesPath, "yt-dlp", "yt-dlp.exe") : "yt-dlp";

  const child = ytdl.exec(
    url,
    {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      output: path.join(folder, "%(title)s.%(ext)s"),
    },
    { 
      stdio: "pipe",
      bin: ytDlpBinary
    }
  );

  child.stdout?.on("data", (data) => onProgress(data.toString()));
  child.stderr?.on("data", (data) => onProgress(data.toString()));
  child.on("close", (code) => onProgress(`DONE:${code}`));
}

module.exports = { startDownload };
