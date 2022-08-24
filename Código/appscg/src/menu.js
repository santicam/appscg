'use strict'
const { BrowserWindow, ipcMain } = require("electron");

function createFormModal(browserWindow, width, height, url) {
  let winForm = new BrowserWindow({
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    },
    frame: true,
    parent: browserWindow,
    modal: true
  })
  winForm.loadFile(url);
  // Herramientas de desarrollo
  // winForm.webContents.openDevTools();
}

// browserWindow es la pantalla sobre la que se quiere crear el menú
let mainMenu = browserWindow => {
  let templateMenu = [
    {
      label: "Archivo",
      submenu: [
        { label: "Salir de la aplicación", role: "quit" }
      ]
    },
    {
      label: "Editar",
      submenu: [
        { label: "Deshacer", role: "undo" },
        { label: "Rehacer", role: "redo" },
        { type: 'separator' },
        { label: "Cortar", role: "cut" },
        { label: "Copiar", role: "copy" },
        { label: "Pegar", role: "paste" },
        { label: "Borrar", role: "delete" },
        { type: 'separator' },
        { label: "Seleccionar todo", role: "selectAll" }
      ]
    },
    {
      label: "Ver",
      submenu: [
        { label: "Resetear zoom", accelerator: "CommandOrControl+nummult", role: "resetzoom" },
        { label: "Aumentar zoom", accelerator: "CommandOrControl+numadd", role: "zoomin" },
        { label: "Disminuir zoom", accelerator: "CommandOrControl+numsub", role: "zoomout" },
        { type: "separator" },
        { label: "Pantalla completa", role: "togglefullscreen" },
        { type: "separator" },
        { label: "Reiniciar aplicación", role: "reload" }
      ]
    }
  ];
  // Solicitud de ventana para añadir elementos
  ipcMain.on('boton-alta', (e, register) => {
    let url = __dirname + '/renderers/form_add_itemregister.html';
    createFormModal(browserWindow, 800, 750, url);
  });

  // Solicitud de ventana para visualizar calendario mantenimientos
  ipcMain.on('boton-MNT', (e, register) => {
    let url = __dirname + '/renderers/form_gest_mantenimientos.html';
    createFormModal(browserWindow, 1100, 700, url);
  });

  return templateMenu;
};

module.exports.mainMenu = mainMenu;
