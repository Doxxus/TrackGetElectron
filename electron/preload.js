const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  chooseFolder: () => ipcRenderer.invoke("choose-folder"),
  getVersion: () => ipcRenderer.invoke("get-version"),
  startDownload: (playlistUrl, folder, concurrency) =>
    ipcRenderer.invoke("start-download", { playlistUrl, folder, concurrency }),
  onProgress: (callback) =>
    ipcRenderer.on("download-progress", (_, msg) => callback(msg)),
});
