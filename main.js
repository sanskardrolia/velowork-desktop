const { app, BrowserWindow, session, shell } = require("electron");

// Enable Chromium geolocation (must be BEFORE app ready)
app.commandLine.appendSwitch("enable-features", "Geolocation");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    title: "Velowork",
    autoHideMenuBar: true,
    icon: "assets/icon.ico",

    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: !app.isPackaged
    }
  });

  const ALLOWED_ORIGIN = "https://velowork.vercel.app";
  const winSession = win.webContents.session;

  // 🧹 Clear cached permissions (important on Windows)
  winSession.clearStorageData({ storages: ["permissions"] });

  // ✅ Allow geolocation request
  winSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const url = webContents.getURL();

    if (permission === "geolocation" && url.startsWith(ALLOWED_ORIGIN)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  // ✅ Allow geolocation check
  winSession.setPermissionCheckHandler((webContents, permission) => {
    const url = webContents.getURL();

    if (permission === "geolocation" && url.startsWith(ALLOWED_ORIGIN)) {
      return true;
    }
    return false;
  });

  // ✅ CSP (allows Open-Meteo)
  winSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy": [
        `
        default-src * blob: data:;
        script-src * 'unsafe-inline' 'unsafe-eval' blob: data:;
        style-src * 'unsafe-inline';
        img-src * blob: data:;
        font-src * blob: data:;
        connect-src *
          https://api.open-meteo.com;
        frame-src *;
        worker-src * blob:;
        media-src * blob:;
        `
      ]
    }
  });
});


  // Load Velowork
  win.loadURL("https://velowork.vercel.app");

  // External links → system browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Disable refresh / zoom shortcuts
  win.webContents.on("before-input-event", (event, input) => {
    if (
      input.control &&
      ["r", "+", "-", "0"].includes(input.key)
    ) {
      event.preventDefault();
    }
  });
  // When user clicks close
  mainWindow.on("close", () => {
    if (!isQuitting) {
      isQuitting = true;
      app.quit();
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  isQuitting = true;
});