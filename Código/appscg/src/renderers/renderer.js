'use strict'
const { app } = require('electron').remote;
const { ipcRenderer } = require('electron')
const fs = require('fs');
const { ItemStorage } = require('../modules/ItemStorage')
const { GUI } = require('../modules/GUI')
const path = require('path')
const mant = require('../modules/mant.js');
const util = require('../modules/util.js');
let __path
if (app.isPackaged) {
  __path = process.resourcesPath;  
} else {
  __path = '.';
}
const sinImagen = 'sin_imagen.jpg';
let itemStorage
let gui = new GUI(document)
gui.init()

// Carga del fichero de elementos
let file = __path + '/data/elementos.json'

itemStorage = new ItemStorage(file)
itemStorage.openDataFile()

gui.setItemStorage(itemStorage)
gui.updateRegisterList(itemStorage.getAll())

// Guardar nuevo item en bd
ipcRenderer.on('add-itemregister', (e, register) => {
    // calcular nuevo código
    let id = gui.obtenerid()
    // guardar imagen si la hay
    if (register.fotografia !== '' && register.fotografia !== sinImagen) {
        let nuevoArchivo = util.extraeArchivo(register.fotografia);
        nuevoArchivo = 'foto_item_' + id + '.' + util.getFileExtension(nuevoArchivo)
        fs.copyFileSync(register.fotografia, __path + '/images/' + nuevoArchivo);
        register.fotografia = nuevoArchivo;
    }
    // guardar factura si la hay 
    if (register.factura !== '') {
        let nuevoArchivo = util.extraeArchivo(register.factura);
        nuevoArchivo = 'factura_item_' + id + '.' + util.getFileExtension(nuevoArchivo)
        fs.copyFileSync(register.factura, __path + '/documentos/' + nuevoArchivo);
        register.factura = nuevoArchivo;
    }
    // guardar manual si lo hay 
    if (register.manual !== '') {
        let nuevoArchivo = util.extraeArchivo(register.manual);
        nuevoArchivo = 'manual_item_' + id + '.' + util.getFileExtension(nuevoArchivo)
        fs.copyFileSync(register.manual, __path + '/documentos/' + nuevoArchivo);
        register.manual = nuevoArchivo;
    }
    // generar mantenimientos si los hay
    if (register.tieneMant == true) {
        mant.generarMantenimientos(id, register.fcompra, register.motivoMant, register.numeroMNT,
            register.unidadesMNT, register.periodoMNT)
    }
    let registro = {}
    registro[id] = register;
    itemStorage.add(registro)
    itemStorage.save()
    gui.updateRegisterList(itemStorage.getAll())
})

// Editar un registro
ipcRenderer.on('edit-itemregister', (e) => {
    gui.editRegister()
})

// Eliminar un registro
ipcRenderer.on('delete-itemregister', (e) => {
    gui.deleteRegister()
})

// Visualizar inventario
ipcRenderer.on('inventariar', (e) => {
    gui.inventariar()
});

// Añadir nuevo registro
document.getElementById("btn_add").addEventListener('click', (e) => {
    ipcRenderer.send("boton-alta", 'alta')
});

// Visualizar calendario mantenimiento
document.getElementById("btn_mantenimientos").addEventListener('click', (e) => {
    ipcRenderer.send("boton-MNT", 'calendario')
});