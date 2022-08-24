'use strict'
// Paquete de utilidades de mantenimientos periódicos
const { app } = require('electron').remote;
const fs = require('fs');
const path = require("path");

let __path
if (app.isPackaged) {
  __path = process.resourcesPath;  
} else {
  __path = '.';
}

////////////////////////////////////////////////////////////////////
// Cargar mantenimientos
let cargarMantenimientos = () => {
    return JSON.parse(fs.readFileSync(__path + '/data/mantenimientos.json', "utf8"));
};

////////////////////////////////////////////////////////////////////
// Guardar mantenimientos
let guardarMantenimientos = (datosMant) => {
    fs.writeFileSync(__path + '/data/mantenimientos.json', JSON.stringify(datosMant));
};

////////////////////////////////////////////////////////////////////
// Ordenar por fecha y nombre
let ordenarClaves = (datosMant, datosItems) => {
    let ordenacion = new Array();
    let reg = {};
    for (let keyMNT in datosMant) {
        reg = {
            key: keyMNT,
            criterio: datosMant[keyMNT].fechaPrevista + datosItems[obtenerClave(keyMNT)].nombre
        }
        ordenacion.push(reg);
    };
    ordenacion = ordenacion.sort(function (a, b) {
        if (a.criterio.toLocaleLowerCase('es-ES') > b.criterio.toLocaleLowerCase('es-ES')) {
            return 1;
        }
        if (a.criterio.toLocaleLowerCase('es-ES') < b.criterio.toLocaleLowerCase('es-ES')) {
            return -1;
        }
        return 0;
    });
    return ordenacion;
};

////////////////////////////////////////////////////////////////////
// Generar mantenimientos
let generarMantenimientos = (codigo, fechaBase, motivo, cantidad, unidades, periodo) => {
    let datosMant = cargarMantenimientos();
    let fechaAux = new Date(fechaBase);
    let fechaMNT;
    for (let i = 1; i <= cantidad; i++) {
        switch (periodo) {
            case 'AA':
                fechaAux.setFullYear(fechaAux.getFullYear() + Number(unidades));
                break;
            case 'MM':
                fechaAux.setMonth(fechaAux.getMonth() + Number(unidades))
                break;
            case 'DD':
                fechaAux.setDate(fechaAux.getDate() + Number(unidades))
                break;
        }
        fechaMNT = fechaAux.toISOString().substr(0, 10);
        let registro = {};
        registro[codigo + '#' + fechaMNT] = {
            fechaPrevista: fechaMNT,
            fechaReal: '',
            descripcion: motivo,
            estado: 'P',
            observaciones: '',
            documento: ''
        }
        Object.assign(datosMant, registro);
    }
    fs.writeFileSync(__path + '/data/mantenimientos.json', JSON.stringify(datosMant));
};

////////////////////////////////////////////////////////////////////
// Eliminar mantenimientos
let eliminarMantenimientos = (codigo) => {
    let datosMant = cargarMantenimientos();
    for (let keyMNT in datosMant) {
        let keyMNT_item = obtenerClave(keyMNT);
        if (keyMNT_item == codigo) {
            // borrar documento asociado
            if (datosMant[keyMNT].documento !== '') {
                fs.unlinkSync('./documentos/' + datosMant[keyMNT].documento);
            }
            // borrar mantenimiento
            delete datosMant[keyMNT];
        }
    }
    fs.writeFileSync(__path + '/data/mantenimientos.json', JSON.stringify(datosMant));
};

////////////////////////////////////////////////////////////////////
// Obtener codigo item de la clave completa
let obtenerClave = (codigo) => {
    let array = codigo.split('#', 1);
    return (array[0]);
};

module.exports = {
    cargarMantenimientos: cargarMantenimientos,
    guardarMantenimientos: guardarMantenimientos,
    ordenarClaves, ordenarClaves,
    generarMantenimientos: generarMantenimientos,
    eliminarMantenimientos: eliminarMantenimientos,
    obtenerClave, obtenerClave

};