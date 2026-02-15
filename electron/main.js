const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const downloader = require(path.join(__dirname, "../backend/downloader.js"));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // For Dev
  //win.loadURL("http://localhost:3000");

  // For Prod
  win.loadFile(path.join(__dirname, "../frontend/build/index.html"));
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
