'use strict'
const { BrowserWindow, app, Menu, ipcMain } = require("electron");

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow(
    {
      width: 1200,
      height: 800,
      minWidth: 1150,
      minHeight: 500,
      icon: `${__dirname}/../images/scg/logo_scg.ico`,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false
      }
    });

  // and load the index.html of the app.
  mainWindow.loadFile(__dirname + '/renderers/index.html');
  // para ocultar menú de la aplicación
  //mainWindow.setMenu(null)
  // Herramientas de desarrollo
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    mainWindow = null;
  });

  // Menú
  let mainMenu = require('./menu.js').mainMenu
  let templateMenu = mainMenu(mainWindow)
  Menu.setApplicationMenu(Menu.buildFromTemplate(templateMenu))
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// Recibimos un registro a añadir y notificamos a la pantalla principal
ipcMain.on('add-itemregister', (e, register) => {
  mainWindow.webContents.send('add-itemregister', register)
});
