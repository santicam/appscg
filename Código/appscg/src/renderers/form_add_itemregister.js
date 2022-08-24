'use strict'
const { ipcRenderer } = require("electron");
const { app, BrowserWindow, dialog } = require('electron').remote;
const fs = require('fs');
const { exec } = require('child_process');
const mant = require('../modules/mant.js');
const util = require('../modules/util.js');
const path = require("path");

let __path, __pathimg
if (app.isPackaged) {
  __path = process.resourcesPath;
  __pathimg = '../../..';  
} else {
  __path = '../..';
  __pathimg = '../..';
}

// Variables y constantes globales
let nuevaImagen = '';
let nuevaFactura = '';
let nuevoManual = '';
let tieneMant = false;
let msg = {};
let fvtogarantia = "";
let options = { year: "numeric", month: "2-digit", day: "2-digit" };

const sinImagen = 'sin_imagen.jpg';
const ventana = BrowserWindow.getFocusedWindow();
const unidades_por_defecto = 2;

// Variables DOM
const listacategorias = document.getElementById("listacategorias");
const listatiendas = document.getElementById("listatiendas");
const imagen_item = document.getElementById("imagen_item");
const btn_cambio_imagen = document.getElementById("btn_cambio_imagen");
const nombre = document.getElementById("nombre");
const marcamodelo = document.getElementById("marcamodelo");
const notas = document.getElementById("notas");
const fcompra = document.getElementById("fcompra");
const importe = document.getElementById("importe");
const btn_guardar_factura = document.getElementById("btn_guardar_factura");
const btn_guardar_manual = document.getElementById("btn_guardar_manual");
const textoFac = document.getElementById("textoFac");
const textoMan = document.getElementById("textoMan");
const chk_garantia = document.getElementById("chk_garantia");
const periodo = document.getElementById("periodo");
const unidades = document.getElementById("unidades");
const btn_calcular = document.getElementById("btn_calcular");
const textogarantia = document.getElementById("textogarantia");
const chk_mantenimientos = document.getElementById("chk_mantenimientos");
const motivoMant = document.getElementById("motivoMant");
const numeroMNT = document.getElementById("numeroMNT");
const unidadesMNT = document.getElementById("unidadesMNT");
const periodoMNT = document.getElementById("periodoMNT");
const textoMNT = document.getElementById("textoMNT");
const btn_cancel = document.getElementById("btn_cancel");
const btn_ok = document.getElementById("btn_ok");

// Cargar datos de categorías y tiendas
const categorias = require(__path + '/data/categorias.json');
const tiendas = require(__path + '/data/tiendas.json');

let cadena = '';
// Definir la caja de selección de categorías
cadena = '<select class="form-control" id="listacat" style="width: 40%">';
for (let codigo in categorias) {
  cadena += `<option value="${codigo}">${categorias[codigo].nombre}</option>`;
}
cadena += "</select>"
listacategorias.innerHTML = cadena;
// Definir la caja de selección de categorías
cadena = '<select class="form-control" id="listatien" style="width: 40%">';
for (let codigo in tiendas) {
  cadena += `<option value="${codigo}">${tiendas[codigo].nombre}</option>`;
}
cadena += "</select>"
listatiendas.innerHTML = cadena;
// Fecha compra por defecto es hoy
fcompra.value = new Date().toISOString().substr(0, 10);
unidades.value = unidades_por_defecto;
///////////////////////////////////////////////////////////////////////////////
// Definir evento Click en lista categorías
document.getElementById("listacat").addEventListener('click', () => {
  formateaInformacion(listacat.value);
});

///////////////////////////////////////////////////////////////////////////////
// Click en checkbox garantías
chk_garantia.addEventListener('click', () => {
  if (chk_garantia.checked == true) {
    muestragarantia();
  } else {
    fvtogarantia = "";
    textogarantia.innerHTML = "";
    ocultagarantia();
  }
});
///////////////////////////////////////////////////////////////////////////////
// Click en botón calcular garantía
btn_calcular.addEventListener('click', () => {
  unidades.value = Math.trunc(unidades.value);
  // Validar fecha compra
  if (fcompra.length == 0) {
    msg = {
      type: 'error',
      title: 'Atención',
      message: 'La fecha de compra debe informarse',
      detail: 'Por favor, introduzca la fecha de compra'
    };
    dialog.showMessageBoxSync(ventana, msg);
    fcompra.focus();
  } else if (unidades.value < 1) {
    msg = {
      type: 'error',
      title: 'Atención',
      message: 'La cantidad de tiempo debe ser positiva',
      detail: 'Por favor, introduzca la cantidad de tiempo'
    };
    dialog.showMessageBoxSync(ventana, msg);
    unidades.focus();
  } else {
    fvtogarantia = fcompra.value;
    let fvtog_date = new Date(fvtogarantia);
    switch (periodo.value) {
      case 'AA':
        fvtog_date.setFullYear(fvtog_date.getFullYear() + Number(unidades.value));
        break;
      case 'MM':
        fvtog_date.setMonth(fvtog_date.getMonth() + Number(unidades.value))
        break;
      case 'DD':
        fvtog_date.setDate(fvtog_date.getDate() + Number(unidades.value))
        break;
    }
    fvtogarantia = fvtog_date.toISOString().substr(0, 10)
    textogarantia.innerHTML = "Fecha vencimiento garantía: " + fvtog_date.toLocaleDateString("es-ES", options);
  };
});

///////////////////////////////////////////////////////////////////////////////
// Click en checkbox mantenimientos
chk_mantenimientos.addEventListener('click', () => {
  if (chk_mantenimientos.checked == true) {
    muestraMNT();
  } else {
    tieneMant = false;
    textoMNT.innerHTML = '';
    motivoMant.value = '';
    numeroMNT.value = '';
    unidadesMNT.value = '';
    periodoMNT.value = 'AA';
    ocultaMNT();
  }
});
///////////////////////////////////////////////////////////////////////////////
// Click en botón generar mantenimientos
btn_calcularMNT.addEventListener('click', () => {
  numeroMNT.value = Math.trunc(numeroMNT.value);
  unidadesMNT.value = Math.trunc(unidadesMNT.value);
  if (motivoMant.value.trim().length == 0) {
    msg = {
      type: 'error',
      title: 'Atención',
      message: 'El motivo del mantenimiento es obligatorio',
      detail: 'Por favor, introduzca una descripción significativa'
    };
    dialog.showMessageBoxSync(ventana, msg);
    motivoMant.focus();
  } else if (fcompra.length == 0) {
    msg = {
      type: 'error',
      title: 'Atención',
      message: 'La fecha de compra debe informarse',
      detail: 'Por favor, introduzca la fecha de compra'
    };
    dialog.showMessageBoxSync(ventana, msg);
    fcompra.focus();
  } else if (numeroMNT.value < 1 || numeroMNT.value > 50) {
    msg = {
      type: 'error',
      title: 'Atención',
      message: 'El número de mantenimientos debe estar entre 1 y 50',
      detail: 'Por favor, introduzca el número de mantenimientos'
    };
    dialog.showMessageBoxSync(ventana, msg);
    numeroMNT.focus();
  } else if (unidadesMNT.value < 1) {
    msg = {
      type: 'error',
      title: 'Atención',
      message: 'La cantidad de tiempo en mantenimientos debe ser positiva',
      detail: 'Por favor, introduzca la cantidad de tiempo en mantenimientos'
    };
    dialog.showMessageBoxSync(ventana, msg);
    unidadesMNT.focus();
  } else {
    tieneMant = true;
    textoMNT.innerHTML = '<span class="icon icon-tools"></span>';
  };
});

///////////////////////////////////////////////////////////////////////////////
btn_cambio_imagen.addEventListener('click', () => {
  // seleccionar imagen
  let fileNames = dialog.showOpenDialogSync(ventana, {
    title: "Seleccionar imagen para el elemento",
    defaultPath: app.getPath('pictures'),
    buttonLabel: "Seleccionar",
    filters: [
      { name: 'Imágenes', extensions: ['jpg', 'png', 'jpeg'] }
    ]
  });
  if (fileNames != undefined) {
    nuevaImagen = fileNames[0];
    // actualizarlo en pantalla
    imagen_item.src = nuevaImagen;
  }
});
///////////////////////////////////////////////////////////////////////////////
btn_guardar_factura.addEventListener('click', () => {
  // seleccionar factura
  let fileNames = dialog.showOpenDialogSync(ventana, {
    title: "Seleccionar factura o ticket para el elemento",
    defaultPath: app.getPath('pictures'),
    buttonLabel: "Seleccionar",
    filters: [
      { name: 'Documentos/Imágenes', extensions: ['pdf', 'jpg', 'jpeg', 'png'] }
    ]
  });
  if (fileNames != undefined) {
    nuevaFactura = fileNames[0];
    textoFac.innerHTML = '<span class="icon icon-check"></span>';
  }
});
///////////////////////////////////////////////////////////////////////////////
btn_guardar_manual.addEventListener('click', () => {
  // seleccionar manual
  let fileNames = dialog.showOpenDialogSync(ventana, {
    title: "Seleccionar manual de instrucciones para el elemento",
    defaultPath: app.getPath('pictures'),
    buttonLabel: "Seleccionar",
    filters: [
      { name: 'Documentos/Imágenes', extensions: ['pdf', 'jpg', 'jpeg', 'png'] }
    ]
  });
  if (fileNames != undefined) {
    nuevoManual = fileNames[0];
    textoMan.innerHTML = '<span class="icon icon-check"></span>';
  }
});

///////////////////////////////////////////////////////////////////////////////
// Comportamiento del botón CANCELAR
btn_cancel.onclick = () => {
  window.close()
};

///////////////////////////////////////////////////////////////////////////////
// Confirmar alta de elemento
btn_ok.addEventListener('click', (e) => {
  // validar nombre
  if (nombre.value.trim().length == 0) {
    msg = {
      type: 'error',
      title: 'Atención',
      message: 'El nombre del elemento es obligatorio',
      detail: 'Por favor, introduzca un nombre significativo'
    };
    dialog.showMessageBoxSync(ventana, msg);
    nombre.focus();
  } else if (nombreduplicado(nombre.value.trim())) {
    msg = {
      type: 'error',
      title: 'Atención',
      message: 'El nombre ya existe en la base de datos',
      detail: 'Por favor, introduzca un nombre diferente'
    };
    dialog.showMessageBoxSync(ventana, msg);
    nombre.focus();
  } else if (fcompra.value.length == 0) {
    // Validar fecha compra
    msg = {
      type: 'error',
      title: 'Atención',
      message: 'La fecha de compra es obligatoria',
      detail: 'Por favor, introduzca la fecha de compra'
    };
    dialog.showMessageBoxSync(ventana, msg);
    fcompra.focus();
  } else {
    if (fvtogarantia.length == 0) {
      fvtogarantia = fcompra.value;
    }
    if (fvtogarantia == fcompra.value) {
      periodo.value = "AA";
      unidades.value = "";
    }
    if (nuevaImagen == '') {
      nuevaImagen = sinImagen;
    }
    let register = {}
    register = {
      codcategoria: document.getElementById("listacat").value,
      codtienda: document.getElementById("listatien").value,
      nombre: nombre.value.trim(),
      marcamodelo: marcamodelo.value.trim(),
      notas: notas.value.trim(),
      fcompra: fcompra.value,
      importe: importe.value,
      fvtogarantia: fvtogarantia,
      periodo: periodo.value,
      unidades: unidades.value,
      fotografia: nuevaImagen,
      factura: nuevaFactura,
      manual: nuevoManual,
      tieneMant: tieneMant,
      motivoMant: motivoMant.value,
      numeroMNT: numeroMNT.value,
      unidadesMNT: unidadesMNT.value,
      periodoMNT: periodoMNT.value
    }
    // Enviamos el registro a añadir al proceso principal
    ipcRenderer.send("add-itemregister", register)
    window.close()

  }
});

///////////////////////////////////////////////////////////////////////////////
let formateaInformacion = (codigo) => {
  let cadena = `<img class="img-rounded media-object"
                src="${__pathimg}/images/${categorias[codigo].icono + '?nocache=' + Math.random()}"
                width="32" height="32" style="margin: 0px">`;
  document.getElementById("iconocat").innerHTML = cadena;
};
///////////////////////////////////////////////////////////////////////////////
let ocultagarantia = () => {
  document.getElementById("calculogarantia").style.display = "none";
};
///////////////////////////////////////////////////////////////////////////////
let muestragarantia = () => {
  document.getElementById("calculogarantia").style.display = "block";
};
///////////////////////////////////////////////////////////////////////////////
let ocultaMNT = () => {
  motivoMant.style.display = "none";
  calculoMNT.style.display = "none";
};
///////////////////////////////////////////////////////////////////////////////
let muestraMNT = () => {
  motivoMant.style.display = "inline";
  calculoMNT.style.display = "block"
};
///////////////////////////////////////////////////////////////////////////////
let nombreduplicado = (nombre) => {
  let ok = false;
  let items = require(__path + '/data/elementos.json');
  for (let codigo in items) {
    if (items[codigo].nombre.toLowerCase() == nombre.toLowerCase()) {
      ok = true;
      break;
    };
  };
  return ok;
};
///////////////////////////////////////////////////////////////////////////////
// Iniciar app con info de la categoría por defecto
formateaInformacion(0);
// ver foto
let foto = __pathimg + '/images/' + sinImagen + '?nocache=' + Math.random();
imagen_item.src = foto;
// Ocultar info de garantía
ocultagarantia();
ocultaMNT();
document.getElementById("nombre").focus();