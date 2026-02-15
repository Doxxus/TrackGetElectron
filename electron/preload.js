const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  chooseFolder: () => ipcRenderer.invoke("choose-folder"),
  startDownload: (playlistUrl, folder) =>
    ipcRenderer.invoke("start-download", { playlistUrl, folder }),
  onProgress: (callback) =>
    ipcRenderer.on("download-progress", (_, msg) => callback(msg)),
});
