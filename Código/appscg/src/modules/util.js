'use strict'
// Paquete de utilidades varias
const { app } = require('electron').remote;
var fse = require('fs-extra');
const path = require("path");

let __path
if (app.isPackaged) {
  __path = process.resourcesPath;  
} else {
  __path = '.';
}
//////////////////////////////////////////////////////////////////////////////
const hacerBackup = (codigo) => {
    // Crear directorio de destino del backup
    fse.mkdirSync(__path + '/backup/' + codigo);
    // Copiar carpetas de datos
    fse.copySync(__path + '/data/', __path + '/backup/' + codigo + '/data/');
    fse.copySync(__path + '/documentos/', __path + '/backup/' + codigo + '/documentos/');
    fse.copySync(__path + '/images/', __path + '/backup/' + codigo + '/images/');
};
//////////////////////////////////////////////////////////////////////////////
const recuperarBackup = (codigo) => {
    // Borrar carpetas de destino de la recuperacion
    fse.rmSync(__path + '/data/', { recursive: true, force: true });
    fse.rmSync(__path + '/documentos/', { recursive: true, force: true });
    fse.rmSync(__path + '/images/', { recursive: true, force: true });
    // Copiar carpetas de datos
    fse.copySync(__path + '/backup/' + codigo + '/data/', __path + '/data/');
    fse.copySync(__path + '/backup/' + codigo + '/documentos/', __path + '/documentos/');
    fse.copySync(__path + '/backup/' + codigo + '/images/', __path + '/images/');
};
//////////////////////////////////////////////////////////////////////////////
const eliminarBackup = (codigo) => {
    // Borrar carpetas de backup
    fse.rmSync(__path + '/backup/' + codigo, { recursive: true, force: true });
};
//////////////////////////////////////////////////////////////////////////////
const obtieneTimeStampBackup = () => {
    let tsf, tsh, ts
    const optHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    ts = new Date();
    tsf = ts.toISOString().substr(0, 10)
    tsh = ts.toLocaleTimeString('es-ES', optHora);
    ts = tsf + '_' + tsh.substr(0, 2) + '.' + tsh.substr(3, 2) + '.' + tsh.substr(6, 2)
    return ts;
};
//////////////////////////////////////////////////////////////////////////////
const obtieneFechaBack = (codigo) => {
    return codigo.substr(8, 2) + '/' + codigo.substr(5, 2) + '/' + codigo.substr(0, 4);
};
//////////////////////////////////////////////////////////////////////////////
const obtieneHoraBack = (codigo) => {
    return codigo.substr(11, 2) + ':' + codigo.substr(14, 2) + ':' + codigo.substr(17, 2);
};
//////////////////////////////////////////////////////////////////////////////
const extraeArchivo = (pathConArchivo) => {
    return pathConArchivo.split('\\').pop().split('/').pop();
};
//////////////////////////////////////////////////////////////////////////////
const existeArchivo = (path, archivo) => {
    if (fs.existsSync(path + archivo)) {
        return true;
    } else {

        return false;
    }
};
//////////////////////////////////////////////////////////////////////////////
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
};

module.exports = {
    hacerBackup: hacerBackup,
    recuperarBackup: recuperarBackup,
    eliminarBackup: eliminarBackup,
    obtieneTimeStampBackup: obtieneTimeStampBackup,
    obtieneFechaBack: obtieneFechaBack,
    obtieneHoraBack: obtieneHoraBack,
    extraeArchivo: extraeArchivo,
    existeArchivo: existeArchivo,
    getFileExtension: getFileExtension

};