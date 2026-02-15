const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const downloader = require(path.join(__dirname, "..", "backend", "downloader.js"));

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    title: "Track Get",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMenu(null);
  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    win.loadFile(path.join(__dirname, "../frontend/build/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("choose-folder", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (result.canceled) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("start-download", async (event, { playlistUrl, folder }) => {
    downloader.startDownload(playlistUrl, folder, (msg) => {
      event.sender.send("download-progress", msg);
    });
  });
});
