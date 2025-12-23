const { session } = require("electron");
const { app, BrowserWindow, shell } = require("electron");

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
    nodeIntegration: false,      // 🚫 NO Node.js in UI
    contextIsolation: true,      // ✅ Required
    sandbox: true,               // ✅ Extra isolation
    devTools: false              // 🚫 Disable DevTools in prod
  }
});

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy": [
        "default-src 'self' https://velowork.vercel.app; " +
        "script-src 'self' https://velowork.vercel.app; " +
        "style-src 'self' 'unsafe-inline' https://velowork.vercel.app; " +
        "img-src 'self' data: https://velowork.vercel.app; " +
        "connect-src https://velowork.vercel.app;"
      ]
    }
  });
});


  // Load your Next.js web app
  win.loadURL("https://velowork.vercel.app/");
  const ALLOWED_ORIGIN = "https://velowork.vercel.app";

win.webContents.on("will-navigate", (event, url) => {
  if (!url.startsWith(ALLOWED_ORIGIN)) {
    event.preventDefault();
  }
});


  // Open external links in default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Prevent refresh / zoom shortcuts
  win.webContents.on("before-input-event", (event, input) => {
    if (input.control && ["r", "+", "-", "0"].includes(input.key)) {
      event.preventDefault();
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
