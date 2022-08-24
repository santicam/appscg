'use strict'
const { app, BrowserWindow, dialog } = require('electron').remote;
const fs = require('fs');
const { exec } = require('child_process');
const mant = require('../modules/mant.js');
const util = require('../modules/util.js');
const path = require("path");

let __path, __pathBis
if (app.isPackaged) {
  __path = process.resourcesPath;
  __pathBis = process.resourcesPath;
} else {
  __path = '../..';
  __pathBis = '.'
}

// Variables globales
const ventana = BrowserWindow.getFocusedWindow();
const options = { year: "numeric", month: "2-digit", day: "2-digit" };
const filtroMNT = document.getElementById("filtroMNT");
const itemMNT = document.getElementById("itemMNT");
const todas_las_fechas = "0";
const ultimos_90_dias = "1";
const proximas_fechas = "2";
const pendientes_realizar = "3";
const realizados = "4";
let datosItems;
let datosMant;
let editando = false;
let msg = {};

//////////////////////////////////////////////////////////////////////////////////
//crear la tabla para mantenimientos
let creartablaMNT = (datosItems, datosMant) => {
  let listaCodigos = new Array();
  let filas = "";

  // obtener los mantenimientos ordenados por fecha y nombre
  let keys = mant.ordenarClaves(datosMant, datosItems);
  // recorro los datos creando las filas
  for (let i = 0; i < keys.length; i++) {
    let clave = keys[i].key;
    let operacion = datosMant[clave];
    let codigo = mant.obtenerClave(clave);
    let nombre = datosItems[codigo].nombre;
    let fp = (new Date(operacion.fechaPrevista)).toLocaleDateString("es-ES", options);
    let fr = ''
    if (operacion.fechaReal !== '') {
      fr = (new Date(operacion.fechaReal)).toLocaleDateString("es-ES", options);
    }
    let okNombre;
    let okFecha;
    if (itemMNT.value == '') {
      okNombre = true;
    } else if (nombre.toUpperCase().indexOf(itemMNT.value.toUpperCase()) >= 0) {
      okNombre = true;
    } else {
      okNombre = false;
    }
    let diasMNT = diasHastaFechaMNT(new Date(operacion.fechaPrevista))
    switch (filtroMNT.value) {
      case todas_las_fechas:
        okFecha = true;
        break;
      case ultimos_90_dias:
        if (diasMNT >= -90) {
          okFecha = true;
        } else {
          okFecha = false;
        }
        break;
      case proximas_fechas:
        if (diasMNT >= 0) {
          okFecha = true;
        } else {
          okFecha = false;
        }
        break;
      case pendientes_realizar:
        if (operacion.estado == 'P') {
          okFecha = true;
        } else {
          okFecha = false;
        }
        break;
      case realizados:
        if (operacion.estado == 'R') {
          okFecha = true;
        } else {
          okFecha = false;
        }
        break;
    }
    if (okNombre == true && okFecha == true) {
      listaCodigos.push(clave);
      // boton de ver documento
      let boton_doc = '';
      if (operacion.documento !== '') {
        boton_doc = `<button title="Visualizar documento" id="btn_MNT_VerDoc${clave}" class="btn btn-positive">
                     <span class="icon icon-doc-text-inv"></span></button>`;
      };
      filas += `
      <tr id="ft${clave}">
          <td>${nombre}</td>
          <td align="center">${formateaFechaMNT(new Date(operacion.fechaPrevista))}</td>
          <td style="width: 15em;">${operacion.descripcion}</td>
          <td style="width: 13em;" align="center">${fr}</td>
          <td style="width: 15em;">${operacion.observaciones}</td>
          <td align="center">${boton_doc}</td>
          <td><button title="Editar mantenimiento" id="btn_MNT_Edit${clave}" class="btn btn-primary">
          <span class="icon icon-pencil"></span></button>
          <button title="Cargar documento (factura, ticket, etc.)" id="doc_edit${clave}" class="btn btn-primary">
          <span class="icon icon-download"></span></button></td>
      </tr> `;
    }
  }
  datosTablaCalendario.innerHTML = filas;
  listaCodigos.forEach(clave => {
    eventosMNTEditar(clave);
    eventosMNTdocEditar(clave);
    eventosMNTverDoc(clave);
  });
};

///////////////////////////////////////////////////////////////////////////////
const eventosMNTEditar = (clave) => {
  document.getElementById(`btn_MNT_Edit${clave}`).addEventListener('click', () => {
    if (editando == false) {
      // cambiar la fila a editable
      let boton_doc = '';
      if (datosMant[clave].documento !== '') {
        boton_doc = `<button title="Visualizar documento" id="btn_MNT_VerDoc${clave}" class="btn btn-positive">
                     <span class="icon icon-doc-text-inv"></span></button>`;
      };
      document.getElementById(`ft${clave}`).innerHTML = `
      <td style="width: 10em;">${datosItems[mant.obtenerClave(clave)].nombre}</td>
      <td align="center">${formateaFechaMNT(new Date(datosMant[clave].fechaPrevista))}</td>
      <td><input style="width: 12em;" type="text" id="descripcionMNT" value="${datosMant[clave].descripcion}"</td>
      <td align="center"><input style="width: 10em; " type="date" id="frMNT" value="${datosMant[clave].fechaReal}"</td>
      <td><input style="width: 12em; "type="text" id="observacionesMNT" value="${datosMant[clave].observaciones}"</td>
      <td align="center">${boton_doc}</td>
      <td><button title="Guardar cambios en mantenimiento" id="btn_MNT_Edit${clave}" class="btn btn-primary">
            <span class="icon icon-check"></span></button></td>
        `;
      document.getElementById('descripcionMNT').focus();
      //como he reconstruido el Guardar, debo ponerle su evento otra vez:
      eventosMNTGuardar(clave);
      editando = true;
      // desactivar filtros de mantenimiento
      filtroMNT.disabled = true;
      itemMNT.disabled = true;
    } else {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'No se puede editar',
        detail: 'Por favor, termine la acción anterior'
      };
      dialog.showMessageBoxSync(ventana, msg);
    }
  });
};
///////////////////////////////////////////////////////////////////////////////
const eventosMNTdocEditar = (clave) => {
  document.getElementById(`doc_edit${clave}`).addEventListener('click', () => {
    if (editando == false) {
      // editar el documento
      let fileNames = dialog.showOpenDialogSync(ventana, {
        title: "Seleccionar documento para esta operación de mantenimiento",
        defaultPath: app.getPath('pictures'),
        buttonLabel: "Seleccionar",
        filters: [
          { name: 'Documentos/Imágenes', extensions: ['pdf', 'jpg', 'jpeg', 'png'] }
        ]
      });
      if (fileNames != undefined) {
        let nuevoDoc = util.extraeArchivo(fileNames[0]);
        // Si existía un documento previo, borrarlo
        if (datosMant[clave].documento !== '') {
          fs.unlinkSync(__pathBis + '/documentos/' + datosMant[clave].documento);
        }
        // Copiar el nuevo documento en carpeta documentos
        let doc = 'DocMNT_' + clave + '.' + util.getFileExtension(nuevoDoc);
        fs.copyFileSync(fileNames[0], __pathBis + '/documentos/' + doc);
        // actualizar mantenimientos
        datosMant[clave].documento = doc;
        // grabar datos actualizados en archivo
        mant.guardarMantenimientos(datosMant);
        // actualizar listado en pantalla
        let fr = '';
        if (datosMant[clave].fechaReal !== '') {
          fr = (new Date(datosMant[clave].fechaReal)).toLocaleDateString("es-ES", options);
        }
        let boton_doc = `<button title="Visualizar documento" id="btn_MNT_VerDoc${clave}" class="btn btn-positive">
                         <span class="icon icon-doc-text-inv"></span></button>`;
        document.getElementById(`ft${clave}`).innerHTML = `
            <td>${datosItems[mant.obtenerClave(clave)].nombre}</td>
            <td align="center">${formateaFechaMNT(new Date(datosMant[clave].fechaPrevista))}</td>
            <td>${datosMant[clave].descripcion}</td>
            <td align="center">${fr}</td>
            <td>${datosMant[clave].observaciones}</td>
            <td align="center">${boton_doc}</td>
            <td><button title="Editar mantenimiento" id="btn_MNT_Edit${clave}" class="btn btn-primary">
            <span class="icon icon-pencil"></span></button>
            <button title="Cargar documento (factura, ticket, etc.)" id="doc_edit${clave}" class="btn btn-primary">
            <span class="icon icon-download"></span></button></td>`

        //como he reconstruido el Editar, debo ponerle su evento otra vez:
        eventosMNTEditar(clave);
        eventosMNTdocEditar(clave);
        eventosMNTverDoc(clave);
      } else {
        // Cancelado, se queda el documento anterior
      }
    } else {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'No se puede editar',
        detail: 'Por favor, termine la acción anterior'
      };
      dialog.showMessageBoxSync(ventana, msg);
    }
  });
};
///////////////////////////////////////////////////////////////////////////////
const eventosMNTGuardar = (clave) => {
  document.getElementById(`btn_MNT_Edit${clave}`).addEventListener('click', () => {
    // validaciones al editar mantenimiento

    // guardo los datos en el objeto
    let descripcion = document.getElementById("descripcionMNT").value.trim();
    let fr = document.getElementById("frMNT").value;
    let observaciones = document.getElementById("observacionesMNT").value.trim();
    datosMant[clave].descripcion = descripcion;
    datosMant[clave].fechaReal = fr;
    datosMant[clave].observaciones = observaciones;
    let estado_anterior = datosMant[clave].estado;
    if (fr == '') {
      datosMant[clave].estado = 'P';
    } else {
      datosMant[clave].estado = 'R';
    }
    // grabar datos actualizados en archivo
    mant.guardarMantenimientos(datosMant);
    editando = false;
      // activar filtros de mantenimiento
      filtroMNT.disabled = false;
      itemMNT.disabled = false;
    // Si hay cambio de estado, reiniciar la tabla de mantenimientos
    if (datosMant[clave].estado !== estado_anterior) {
      creartablaMNT(datosItems, datosMant);
    } else {
      //cambiar las filas a no editables
      if (fr !== '') {
        fr = (new Date(fr)).toLocaleDateString("es-ES", options);
      }
      let boton_doc = '';
      if (datosMant[clave].documento !== '') {
        boton_doc = `<button title="Visualizar documento" id="btn_MNT_VerDoc${clave}" class="btn btn-positive">
                     <span class="icon icon-doc-text-inv"></span></button>`;
      };
      document.getElementById(`ft${clave}`).innerHTML = `
          <td>${datosItems[mant.obtenerClave(clave)].nombre}</td>
          <td align="center">${formateaFechaMNT(new Date(datosMant[clave].fechaPrevista))}</td>
          <td>${datosMant[clave].descripcion}</td>
          <td align="center">${fr}</td>
          <td>${datosMant[clave].observaciones}</td>
          <td align="center">${boton_doc}</td>
          <td><button title="Editar mantenimiento" id="btn_MNT_Edit${clave}" class="btn btn-primary">
          <span class="icon icon-pencil"></span></button>
          <button title="Cargar documento (factura, ticket, etc.)" id="doc_edit${clave}" class="btn btn-primary">
          <span class="icon icon-download"></span></button></td>`

      //como he reconstruido el Editar, debo ponerle su evento otra vez:
      eventosMNTEditar(clave);
      eventosMNTdocEditar(clave);
      eventosMNTverDoc(clave);
    }
  });
};

///////////////////////////////////////////////////////////////////////////////
const eventosMNTverDoc = (clave) => {
  // Botón de ver documento solo si no está en uso
  if (datosMant[clave].documento !== '') {
    document.getElementById(`btn_MNT_VerDoc${clave}`).addEventListener('click', () => {
      if (editando == false) {
        let archivo = '';
        switch (process.platform) {
          case 'linux':
            if (app.isPackaged) {
              archivo = __path + '/documentos/' + datosMant[clave].documento;
            } else {
              archivo = __dirname + '/../../documentos/' + datosMant[clave].documento;
            }
            exec('xdg-open ' + archivo);
            break;
          case 'win32':
            if (app.isPackaged) {
              archivo = __path + '\\documentos\\' + datosMant[clave].documento;
            } else {
              archivo = __dirname + '\\..\\..\\documentos\\' + datosMant[clave].documento;
            }
            exec('explorer.exe ' + archivo);
            break;
          case 'darwin':
          default:
            throw new Error('Platforma no soportada.');
        }
      } else {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'Ahora no puede visualizar el documento',
          detail: 'Por favor, termine la acción anterior'
        };
        dialog.showMessageBoxSync(ventana, msg);
      }
    });
  };
};

///////////////////////////////////////////////////////////////////////////////
// Definir evento Click en lista de filtro por fechas
filtroMNT.addEventListener('click', () => {
  creartablaMNT(datosItems, datosMant);
});
///////////////////////////////////////////////////////////////////////////////
// Definir evento pulsar teclas en campo de busqueda
itemMNT.addEventListener('keyup', (event) => {
  creartablaMNT(datosItems, datosMant);
});
///////////////////////////////////////////////////////////////////////////////
// Comportamiento del botón SALIR 1 o 2
document.getElementById("btn_salir1").onclick = () => {
  window.close()
};
document.getElementById("btn_salir2").onclick = () => {
  window.close()
};

///////////////////////////////////////////////////////////////////////////////
// dar formato a la fecha prevista de mantenimiento
const formateaFechaMNT = (fechaPrevista) => {
  let diasMNT = diasHastaFechaMNT(fechaPrevista);
  let color = diasMNT <= 0 ? "red" : (diasMNT <= 90 ? "orange" : "green");
  let stylefecha = 'style="color: ' + color + '; font-weight: bold"';
  let txt = `<span ${stylefecha}>${fechaPrevista.toLocaleDateString("es-ES", options)}</span>`;
  return txt;
};

///////////////////////////////////////////////////////////////////////////////
// Comprobar dias restantes hasta fecha prevista de mantenimiento
const diasHastaFechaMNT = (fechaPrevista) => {
  let hoy = new Date(new Date().toISOString().substr(0, 10));
  let diasMNT = (fechaPrevista - hoy) / 86400000 // de milisegundos a días
  return diasMNT;
};


///////////////////////////////////////////////////////////////////////////////
// Cargar datos de elementos
datosItems = require(__path + '/data/elementos.json');
// Cargar datos de mantenimientos
datosMant = mant.cargarMantenimientos();
creartablaMNT(datosItems, datosMant);
