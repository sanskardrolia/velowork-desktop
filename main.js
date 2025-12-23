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
});

  // Load your Next.js web app
  win.loadURL("https://velowork.vercel.app/");

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
