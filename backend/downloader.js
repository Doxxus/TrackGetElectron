const ytdl = require("youtube-dl-exec");
const path = require("path");

function startDownload(url, folder, onProgress) {
  const child = ytdl.exec(
    url,
    {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: "0",
      output: path.join(folder, "%(playlist_index)s - %(title)s.%(ext)s"),
    },
    { stdio: "pipe" }
  );

  child.stdout?.on("data", (data) => onProgress(data.toString()));
  child.stderr?.on("data", (data) => onProgress(data.toString()));
  child.on("close", (code) => onProgress(`DONE:${code}`));
}

module.exports = { startDownload };
