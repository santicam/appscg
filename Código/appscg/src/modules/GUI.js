'use strict'
const { app, BrowserWindow, dialog } = require('electron').remote;
const { shell } = require('electron');
const fs = require('fs');
const { exec } = require('child_process');
const mant = require(__dirname + '/mant.js');
const util = require(__dirname + '/util.js');
const path = require("path");

let __path, __pathimg
if (app.isPackaged) {
  __path = process.resourcesPath;
  __pathimg = '../../..';
} else {
  __path = '.';
  __pathimg = '../..';
}

// Variables globales
const window = BrowserWindow.getFocusedWindow();
const sinIcono = 'sin_icono.png';
const sinImagen = 'sin_imagen.jpg';
const iconoTodasCategorias = 'todas_categorias.png';
let msg = {};
let fvtogarantia = '';
const options = { year: "numeric", month: "2-digit", day: "2-digit" };
let editando = false;
let nuevoIcono = '';
let nuevaImagen = '';
let nuevaImagenCompleta = '';
let nuevaFactura = '';
let nuevaFacturaCompleta = '';
let nuevoManual = '';
let nuevoManualCompleto = '';
const orden_alfabetico = "0";
const orden_garantia = "1";
const orden_natural = "2";

// Objetos DOM
const logoSCG = document.getElementById("logoSCG");
logoSCG.src = __pathimg + '/images/scg/banner_scg.png';

const main01 = document.getElementById("main01");
const main02 = document.getElementById("main02");
const main_Add_T = document.getElementById("main_Add_T");
const main_Add_tiendas = document.getElementById("main_Add_tiendas");
const main_Add_C = document.getElementById("main_Add_C");
const main_Add_categorias = document.getElementById("main_Add_categorias");
const main_Add_B = document.getElementById("main_Add_B");
const main_Add_backup = document.getElementById("main_Add_backup");
const mainInventario = document.getElementById("mainInventario");
const mainElementos = document.getElementById("mainElementos");
const mainTiendas = document.getElementById("mainTiendas");
const mainCategorias = document.getElementById("mainCategorias");
const mainBackup = document.getElementById("mainBackup");
const datostablaInventario = document.getElementById("datostablaInventario");
const datostablaTiendas = document.getElementById("datostablaTiendas");
const datostablaCategorias = document.getElementById("datostablaCategorias");
const iconocatINV = document.getElementById("iconocatINV");
const calculogarantia = document.getElementById("calculogarantia");
const calculoMNT = document.getElementById("calculoMNT");
const motivoMant = document.getElementById("motivoMant");
const btn_inicio = document.getElementById("btn_inicio");
const btn_inventario = document.getElementById("btn_inventario");
const btn_categorias = document.getElementById("btn_categorias");
const btn_tiendas = document.getElementById("btn_tiendas");
const btn_mantenimientos = document.getElementById("btn_mantenimientos");
const btn_backup = document.getElementById("btn_backup");
const btn_acercade = document.getElementById("btn_acercade");
const btn_Add_tienda = document.getElementById("btn_Add_tienda");
const btn_Add_cancel_T = document.getElementById("btn_Add_cancel_T");
const btn_Add_ok_T = document.getElementById("btn_Add_ok_T");
const nombre_tienda_Add = document.getElementById("nombre_tienda_Add");
const btn_Add_categoria = document.getElementById("btn_Add_categoria");
const btn_Add_cancel_C = document.getElementById("btn_Add_cancel_C");
const btn_Add_ok_C = document.getElementById("btn_Add_ok_C");
const nombre_categoria_Add = document.getElementById("nombre_categoria_Add");
const nombre_categoria_icono_Add = document.getElementById("nombre_categoria_icono_Add");
const btn_Add_Icono_C = document.getElementById("btn_Add_Icono_C");
const imagen_icono_cat = document.getElementById("imagen_icono_cat");
const clasificacion = document.getElementById("clasificacion");
const btn_Add_backup = document.getElementById("btn_Add_backup");
const btn_Add_cancel_B = document.getElementById("btn_Add_cancel_B");
const btn_Add_ok_B = document.getElementById("btn_Add_ok_B");
const desc_backup_Add = document.getElementById("desc_backup_Add");

class GUI {
  constructor(document) {
    // atributos del DOM
    this.document = document;
    this.total_elem = this.document.getElementById("total_elem");
    this.listacategorias = this.document.getElementById("listacategorias");
    this.listacategoriasINV = this.document.getElementById("listacategoriasINV");
    this.iconocat = this.document.getElementById("iconocat");
    this.iconocatINV = this.document.getElementById("iconocatINV");
    this.listatiendas = this.document.getElementById("listatiendas");
    this.nombre = this.document.getElementById("nombre");
    this.marcamodelo = this.document.getElementById("marcamodelo");
    this.notas = this.document.getElementById("notas");
    this.fcompra = this.document.getElementById("fcompra");
    this.importe = this.document.getElementById("importe");
    this.chk_garantia = this.document.getElementById("chk_garantia");
    this.chk_mantenimientos = this.document.getElementById("chk_mantenimientos");
    this.periodo = this.document.getElementById("periodo");
    this.unidades = this.document.getElementById("unidades");
    this.textogarantia = this.document.getElementById("textogarantia");
    this.tieneMant = false;
    this.motivoMant = this.document.getElementById("motivoMant");
    this.numeroMNT = this.document.getElementById("numeroMNT");
    this.unidadesMNT = this.document.getElementById("unidadesMNT");
    this.periodoMNT = this.document.getElementById("periodoMNT");
    this.textoMNT = this.document.getElementById("textoMNT");
    this.btn_ok = this.document.getElementById("btn_ok");
    this.btn_cancel = this.document.getElementById("btn_cancel");
    this.btn_edit = this.document.getElementById("btn_edit");
    this.btn_add = this.document.getElementById("btn_add");
    this.btn_delete = this.document.getElementById("btn_delete");
    this.btn_calcular = this.document.getElementById("btn_calcular");
    this.btn_calcularMNT = this.document.getElementById("btn_calcularMNT");
    this.btn_salir = this.document.getElementById("btn_salir");
    this.btn_cambio_imagen = document.getElementById("btn_cambio_imagen");
    this.imagen_item = document.getElementById("imagen_item");
    this.btn_guardar_factura = document.getElementById("btn_guardar_factura");
    this.btn_ver_factura = document.getElementById("btn_ver_factura");
    this.btn_guardar_manual = document.getElementById("btn_guardar_manual");
    this.btn_ver_manual = document.getElementById("btn_ver_manual");
    this.factura = '';
    this.manual = '';
    // Puntero al codigo de elemento en proceso
    this.current_codigo = null
    // Almacenamiento de elementos, categorias, tiendas y copias de seguridad
    this.itemstorage = null
    this.categorias = null
    this.tiendas = null
    this.copias = null
  }

  init() {
    // Cargar índice de copias de seguridad
    this.copias = JSON.parse(fs.readFileSync(__path + '/backup/indice_backup.json'));
    // Cargar datos de categorías
    this.categorias = JSON.parse(fs.readFileSync(__path + '/data/categorias.json', "utf8"));
    let cadena = '<select class="form-control" id="listacat" style="width: 40%">';
    for (let codigo in this.categorias) {
      cadena += `<option value="${codigo}">${this.categorias[codigo].nombre}</option>`;
    }
    cadena += "</select>"
    this.listacategorias.innerHTML = cadena;
    // Cargar datos de tiendas
    this.tiendas = JSON.parse(fs.readFileSync(__path + '/data/tiendas.json', "utf8"));
    cadena = '<select class="form-control" id="listatien" style="width: 40%">';
    for (let codigo in this.tiendas) {
      cadena += `<option value="${codigo}">${this.tiendas[codigo].nombre}</option>`;
    }
    cadena += "</select>"
    this.listatiendas.innerHTML = cadena;
    this.addEventsListeners();
    this.putFormInReadOnlyMode();
    // ocultar inventario
    ocultainventario();
    // ocultar categorias
    ocultaCategorias();
    // ocultar tiendas
    ocultaTiendas();
    // ocultar copias de seguridad
    ocultaBackup();
  }

  setItemStorage(itemstorage) {
    this.itemstorage = itemstorage
  }

  getCurrentCodigo() {
    return this.current_codigo
  }

  editRegister() {
    this.putFormInWriteMode();
    nuevaImagen = '';
    nuevaFactura = '';
    nuevoManual = '';
    nuevaImagenCompleta = '';
    nuevaFacturaCompleta = '';
    nuevoManualCompleto = '';
    this.nombre.focus()
  }

  deleteRegister() {
    // Confirmar eliminación
    let respuesta = dialog.showMessageBoxSync(window, {
      type: 'warning',
      title: 'Atención',
      message: `¿Seguro que quiere eliminar: ${this.itemstorage.find(this.current_codigo).nombre}?`,
      detail: 'El borrado no podrá revertirse',
      buttons: ["Cancelar", "Confirmar eliminación"],
      noLink: true
    });
    if (respuesta == 1) {
      // borrar imagen excepto si es "sin_imagen"
      let foto = this.itemstorage.find(this.current_codigo).fotografia;
      if (foto !== sinImagen) {
        fs.unlinkSync(__path + '/images/' + foto);
      }
      // borrar factura si la hay
      let factura = this.itemstorage.find(this.current_codigo).factura;
      if (factura !== '') {
        fs.unlinkSync(__path + '/documentos/' + factura);
      }
      // borrar manual si lo hay
      let manual = this.itemstorage.find(this.current_codigo).manual;
      if (manual !== '') {
        fs.unlinkSync(__path + '/documentos/' + manual);
      }
      // borrar plan de mantenimiento
      mant.eliminarMantenimientos(this.current_codigo);
      this.itemstorage.delete(this.current_codigo)
      this.itemstorage.save()
      this.updateRegisterList(this.itemstorage.getAll())
    }
  }

  inventariar() {
    // Visualizar inventario
    muestrainventario();
    // Cargar datos de categorías
    let cadena = '<select class="form-control" id="listacatINV">';
    cadena += `<option value="T">Todas las categorías</option>`;
    for (let codigo in this.categorias) {
      cadena += `<option value="${codigo}">${this.categorias[codigo].nombre}</option>`;
    }
    cadena += "</select>"
    this.listacategoriasINV.innerHTML = cadena;
    creartablainventario('T', this.itemstorage.getAll(), this.categorias);
    // Definir evento Click en lista categorías del Inventario
    this.document.getElementById("listacatINV").addEventListener('click', () => {
      creartablainventario(this.document.getElementById("listacatINV").value, this.itemstorage.getAll(), this.categorias);
    });
    // Definir evento Click en boton salir
    this.btn_salir.addEventListener('click', () => {
      //ocultainventario();
      window.reload();
    });
  }

  gestionCategorias() {
    // Gestionar categorias
    editando = false;
    muestraCategorias();
    crearTablaCategorias(this.categorias, this.itemstorage.getAll());
    nombre_categoria_icono_Add.value = sinIcono;
    // Definir evento Click en salir
    this.btn_salir.addEventListener('click', () => {
      window.reload();
    });
  }

  gestionTiendas() {
    // Gestionar tiendas
    editando = false;
    muestraTiendas();
    crearTablaTiendas(this.tiendas, this.itemstorage.getAll());
    // Definir evento Click en salir
    this.btn_salir.addEventListener('click', () => {
      window.reload();
    });
  }

  gestionBackup() {
    // Gestionar copias de seguridad
    editando = false;
    muestraBackup();
    crearTablaBackup(this.copias);
    // Definir evento Click en salir
    this.btn_salir.addEventListener('click', () => {
      window.reload();
    });
  }

  addEventsListeners() {
    this.btn_edit.addEventListener('click', (e) => {
      editando = true;
      this.editRegister()
    })

    this.btn_delete.addEventListener('click', (e) => {
      desactivarBotonesNavegacion();
      this.deleteRegister();
      activarBotonesNavegacion()
    })

    this.btn_cancel.addEventListener('click', (e) => {
      this.putFormInReadOnlyMode()
      editando = false;
      this.updateForm(this.itemstorage.find(this.current_codigo))
    })

    btn_inicio.addEventListener('click', (e) => {
      window.reload();
    })
    btn_inventario.addEventListener('click', (e) => {
      this.inventariar();
    })
    btn_categorias.addEventListener('click', (e) => {
      this.gestionCategorias();
    });
    btn_tiendas.addEventListener('click', (e) => {
      this.gestionTiendas();
    });
    btn_backup.addEventListener('click', (e) => {
      this.gestionBackup();
    });
    // Definir evento Click en lista de criterio de clasificación
    clasificacion.addEventListener('click', () => {
      this.updateRegisterList(this.itemstorage.getAll())
    });
    ///////////////////////////////////////////////////////////////////////////////
    btn_acercade.addEventListener('click', () => {
      let respuesta = dialog.showMessageBoxSync(window, {
        type: 'info',
        title: 'Acerca de Sistema Control Garantias',
        message: 'SCG - Versión 1.5.0\n© Santiago Cámara 2021',
        detail: 'Licencia: Atribución/Reconocimiento-NoComercial-CompartirIgual 4.0 Internacional',
        buttons: ["Aceptar", "Ver licencia de Software"],
        icon: __path + '/images/scg/logo_scg.ico',
      });
      if (respuesta == 1) {
        shell.openExternal('https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.es')
      }
    });
    ///////////////////////////////////////////////////////////////////////////////
    // Click en checkbox garantías
    this.chk_garantia.addEventListener('click', () => {
      if (this.chk_garantia.checked == true) {
        muestragarantia();
      } else {
        fvtogarantia = "";
        this.textogarantia.innerHTML = "";
        ocultagarantia();
      }
    });
    ///////////////////////////////////////////////////////////////////////////////
    // Click en botón calcular garantía
    this.btn_calcular.addEventListener('click', () => {
      this.unidades.value = Math.trunc(this.unidades.value);
      // Validar fecha compra
      if (this.fcompra.length == 0) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'La fecha de compra debe informarse',
          detail: 'Por favor, introduzca la fecha de compra'
        };
        dialog.showMessageBoxSync(window, msg);
        this.fcompra.focus();
      } else if (this.unidades.value < 1) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'La cantidad de tiempo debe ser positiva',
          detail: 'Por favor, introduzca la cantidad de tiempo'
        };
        dialog.showMessageBoxSync(window, msg);
        this.unidades.focus();
      } else {
        fvtogarantia = this.fcompra.value;
        let fvtog_date = new Date(fvtogarantia);
        switch (this.periodo.value) {
          case 'AA':
            fvtog_date.setFullYear(fvtog_date.getFullYear() + Number(this.unidades.value));
            break;
          case 'MM':
            fvtog_date.setMonth(fvtog_date.getMonth() + Number(this.unidades.value))
            break;
          case 'DD':
            fvtog_date.setDate(fvtog_date.getDate() + Number(this.unidades.value))
            break;
        }
        fvtogarantia = fvtog_date.toISOString().substr(0, 10)
        this.textogarantia.innerHTML = "Fecha vencimiento garantía: " + fvtog_date.toLocaleDateString("es-ES", options);
      };
    });

    ///////////////////////////////////////////////////////////////////////////////
    // Click en checkbox mantenimientos
    this.chk_mantenimientos.addEventListener('click', () => {
      if (this.chk_mantenimientos.checked == true) {
        muestraMNT();
      } else {
        let respuesta = dialog.showMessageBoxSync(window, {
          type: 'warning',
          title: 'Atención',
          message: 'Se va a eliminar el plan de mantenimiento de: ' + this.nombre.value,
          detail: 'El borrado no podrá revertirse',
          buttons: ["Cancelar", "Confirmar eliminación"],
          noLink: true
        });
        if (respuesta == 1) {
          // eliminar plan de mantenimiento
          mant.eliminarMantenimientos(this.current_codigo);
          this.tieneMant = false
          this.textoMNT.innerHTML = '';
          this.motivoMant.value = '';
          this.numeroMNT.value = '';
          this.unidadesMNT.value = '';
          this.periodoMNT.value = 'AA';
          ocultaMNT();
        } else {
          this.chk_mantenimientos.checked = true;
        }
      }
    });
    ///////////////////////////////////////////////////////////////////////////////
    // Click en botón generar mantenimientos
    this.btn_calcularMNT.addEventListener('click', () => {
      this.numeroMNT.value = Math.trunc(this.numeroMNT.value);
      this.unidadesMNT.value = Math.trunc(this.unidadesMNT.value);
      if (this.motivoMant.value.trim().length == 0) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'El motivo del mantenimiento es obligatorio',
          detail: 'Por favor, introduzca una descripción significativa'
        };
        dialog.showMessageBoxSync(window, msg);
        this.motivoMant.focus();
      } else if (this.fcompra.length == 0) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'La fecha de compra debe informarse',
          detail: 'Por favor, introduzca la fecha de compra'
        };
        dialog.showMessageBoxSync(window, msg);
        this.fcompra.focus();
      } else if (this.numeroMNT.value < 1 || this.numeroMNT.value > 50) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'El número de mantenimientos debe estar entre 1 y 50',
          detail: 'Por favor, introduzca el número de mantenimientos'
        };
        dialog.showMessageBoxSync(window, msg);
        this.numeroMNT.focus();
      } else if (this.unidadesMNT.value < 1) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'La cantidad de tiempo en mantenimientos debe ser positiva',
          detail: 'Por favor, introduzca la cantidad de tiempo en mantenimientos'
        };
        dialog.showMessageBoxSync(window, msg);
        this.unidadesMNT.focus();
      } else {
        let respuesta = 1;
        if (this.tieneMant == true) {
          let respuesta = dialog.showMessageBoxSync(window, {
            type: 'warning',
            title: 'Atención',
            message: 'Si confirma esta acción, se sustituirá el plan de mantenimiento anterior por el nuevo plan',
            detail: 'Esta acción no podrá revertirse',
            buttons: ["Cancelar", "Confirmar sustitución"],
            noLink: true
          });
        }
        if (respuesta == 1) {
          // eliminar plan de mantenimiento anterior y generar el nuevo plan
          mant.eliminarMantenimientos(this.current_codigo);
          mant.generarMantenimientos(this.current_codigo, this.fcompra.value, this.motivoMant.value, this.numeroMNT.value,
            this.unidadesMNT.value, this.periodoMNT.value)
          this.tieneMant = true;
          this.textoMNT.innerHTML = '<span class="icon icon-tools"></span>';
        };
      }
    });

    ///////////////////////////////////////////////////////////////////////////////
    this.btn_cambio_imagen.addEventListener('click', () => {
      // seleccionar imagen
      let fileNames = dialog.showOpenDialogSync(window, {
        title: "Seleccionar imagen para el elemento",
        defaultPath: app.getPath('pictures'),
        buttonLabel: "Seleccionar",
        filters: [
          { name: 'Imágenes', extensions: ['jpg', 'png', 'jpeg'] }
        ]
      });
      if (fileNames != undefined) {
        nuevaImagen = util.extraeArchivo(fileNames[0]);
        nuevaImagenCompleta = fileNames[0];
        // actualizar imagen en pantalla
        this.imagen_item.src = nuevaImagenCompleta;
      }
    });
    ///////////////////////////////////////////////////////////////////////////////
    this.btn_guardar_factura.addEventListener('click', () => {
      // seleccionar factura
      let fileNames = dialog.showOpenDialogSync(window, {
        title: "Seleccionar factura o ticket para el elemento",
        defaultPath: app.getPath('pictures'),
        buttonLabel: "Seleccionar",
        filters: [
          { name: 'Documentos/Imágenes', extensions: ['pdf', 'jpg', 'jpeg', 'png'] }
        ]
      });
      if (fileNames != undefined) {
        nuevaFactura = util.extraeArchivo(fileNames[0]);
        nuevaFacturaCompleta = fileNames[0];
        // activar boton ver factura
        this.btn_ver_factura.style.display = "inline";
      }
    });
    ///////////////////////////////////////////////////////////////////////////////
    this.btn_guardar_manual.addEventListener('click', () => {
      // seleccionar manual
      let fileNames = dialog.showOpenDialogSync(window, {
        title: "Seleccionar manual de instrucciones para el elemento",
        defaultPath: app.getPath('pictures'),
        buttonLabel: "Seleccionar",
        filters: [
          { name: 'Documentos/Imágenes', extensions: ['pdf', 'jpg', 'jpeg', 'png'] }
        ]
      });
      if (fileNames != undefined) {
        nuevoManual = util.extraeArchivo(fileNames[0]);
        nuevoManualCompleto = fileNames[0];
        // activar boton ver manual
        this.btn_ver_manual.style.display = "inline";
      }
    });
    ///////////////////////////////////////////////////////////////////////////////
    this.btn_ver_factura.addEventListener('click', () => {
      let archivo = '';
      switch (process.platform) {
        case 'linux':
          if (nuevaFacturaCompleta !== '') {
            archivo = nuevaFacturaCompleta;
          } else {
            if (app.isPackaged) {
              archivo = __path + '/documentos/' + this.factura;
            } else {
              archivo = __dirname + '/../../documentos/' + this.factura;
            }
          }
          exec('xdg-open ' + archivo);
          break;
        case 'win32':
          if (nuevaFacturaCompleta !== '') {
            archivo = nuevaFacturaCompleta;
          } else {
            if (app.isPackaged) {
              archivo = __path + '\\documentos\\' + this.factura;
            } else {
              archivo = __dirname + '\\..\\..\\documentos\\' + this.factura;
            }
          }
          exec('explorer.exe ' + archivo);
          break;
        case 'darwin':
        default:
          throw new Error('Platforma no soportada.');
      }
    });
    ///////////////////////////////////////////////////////////////////////////////
    this.btn_ver_manual.addEventListener('click', () => {
      let archivo = '';
      switch (process.platform) {
        case 'linux':
          if (nuevoManualCompleto !== '') {
            archivo = nuevoManualCompleto;
          } else {
            if (app.isPackaged) {
              archivo = __path + '/documentos/' + this.manual;
            } else {
              archivo = __dirname + '/../../documentos/' + this.manual;
            }
          }
          exec('xdg-open ' + archivo);
          break;
        case 'win32':
          if (nuevoManualCompleto !== '') {
            archivo = nuevoManualCompleto;
          } else {
            if (app.isPackaged) {
              archivo = __path + '\\documentos\\' + this.manual;
            } else {
              archivo = __dirname + '\\..\\..\\documentos\\' + this.manual;
            }
          }
          exec('explorer.exe ' + archivo);
          break;
        case 'darwin':
        default:
          throw new Error('Platforma no soportada.');
      }
    });

    ///////////////////////////////////////////////////////////////////////////////
    // Confirmar edición de elemento
    this.btn_ok.addEventListener('click', (e) => {
      // validar nombre
      if (this.nombre.value.trim().length == 0) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'El nombre del elemento es obligatorio',
          detail: 'Por favor, introduzca un nombre significativo'
        };
        dialog.showMessageBoxSync(window, msg);
        this.nombre.focus();
      } else if (nombreduplicado(this.nombre.value.trim())) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'El nombre ya existe en la base de datos',
          detail: 'Por favor, introduzca un nombre diferente'
        };
        dialog.showMessageBoxSync(window, msg);
        this.nombre.focus();
      } else if (this.fcompra.value.length == 0) {
        // Validar fecha compra
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'La fecha de compra es obligatoria',
          detail: 'Por favor, introduzca la fecha de compra'
        };
        dialog.showMessageBoxSync(window, msg);
        this.fcompra.focus();
      } else {
        let fcompra = this.fcompra.value;
        if (fvtogarantia.length == 0) {
          fvtogarantia = fcompra;
        }
        if (fvtogarantia == fcompra) {
          this.periodo.value = "AA";
          this.unidades.value = "";
        }
        // comprobar si hay que actualizar la imagen
        let archivoAnterior = this.itemstorage.find(this.current_codigo).fotografia;
        if (nuevaImagen !== '') {
          nuevaImagen = 'foto_item_' + this.current_codigo + '.' + util.getFileExtension(nuevaImagen)
          if (archivoAnterior !== '' && archivoAnterior !== sinImagen && archivoAnterior !== nuevaImagen) {
            // eliminar archivo anterior
            fs.unlinkSync(__path + '/images/' + archivoAnterior);
          }
          fs.copyFileSync(nuevaImagenCompleta, __path + '/images/' + nuevaImagen);
        } else {
          nuevaImagen = archivoAnterior;
        }
        // comprobar si hay que actualizar la factura
        archivoAnterior = this.itemstorage.find(this.current_codigo).factura;
        if (nuevaFactura !== '') {
          nuevaFactura = 'factura_item_' + this.current_codigo + '.' + util.getFileExtension(nuevaFactura)
          if (archivoAnterior !== '' && archivoAnterior !== nuevaFactura) {
            // eliminar archivo anterior
            fs.unlinkSync(__path + '/documentos/' + archivoAnterior);
          }
          fs.copyFileSync(nuevaFacturaCompleta, __path + '/documentos/' + nuevaFactura);
        } else {
          nuevaFactura = archivoAnterior;
        }
        // comprobar si hay que actualizar el manual
        archivoAnterior = this.itemstorage.find(this.current_codigo).manual;
        if (nuevoManual !== '') {
          nuevoManual = 'manual_item_' + this.current_codigo + '.' + util.getFileExtension(nuevoManual)
          if (archivoAnterior !== '' && archivoAnterior !== nuevoManual) {
            // eliminar archivo anterior
            fs.unlinkSync(__path + '/documentos/' + archivoAnterior);
          }
          fs.copyFileSync(nuevoManualCompleto, __path + '/documentos/' + nuevoManual);
        } else {
          nuevoManual = archivoAnterior;
        }
        let register = {}
        register[this.current_codigo] = {
          codcategoria: document.getElementById("listacat").value,
          codtienda: document.getElementById("listatien").value,
          nombre: this.nombre.value.trim(),
          marcamodelo: this.marcamodelo.value.trim(),
          notas: this.notas.value.trim(),
          fcompra: fcompra,
          importe: this.importe.value,
          fvtogarantia: fvtogarantia,
          periodo: this.periodo.value,
          unidades: this.unidades.value,
          fotografia: nuevaImagen,
          factura: nuevaFactura,
          manual: nuevoManual,
          tieneMant: this.tieneMant,
          motivoMant: this.motivoMant.value,
          numeroMNT: this.numeroMNT.value,
          unidadesMNT: this.unidadesMNT.value,
          periodoMNT: this.periodoMNT.value
        }
        this.itemstorage.add(register)
        this.itemstorage.save()
        this.updateRegisterList(this.itemstorage.getAll())
        this.putFormInReadOnlyMode()
        editando = false;
      }
    });
    ///////////////////////////////////////////////////////////////////////////////
    btn_Add_categoria.addEventListener('click', (e) => {
      main_Add_categorias.style.display = "inline";
      nombre_categoria_Add.value = '';
      imagen_icono_cat.src = __pathimg + '/images/' + sinIcono + '?nocache=' + Math.random();
      nombre_categoria_icono_Add.value = sinIcono;
      nombre_categoria_Add.focus();
      editando = true;
      // Definir evento Click en añadir icono categoría
      btn_Add_Icono_C.addEventListener('click', () => {
        elegirIconoCatAdd();
      });
    });
    ///////////////////////////////////////////////////////////////////////////////
    btn_Add_cancel_C.addEventListener('click', (e) => {
      main_Add_categorias.style.display = "none";
      editando = false;
    });
    ///////////////////////////////////////////////////////////////////////////////
    btn_Add_ok_C.addEventListener('click', (e) => {
      // validar nombre categoria
      let nombreCategoria = nombre_categoria_Add.value.trim();
      if (nombreCategoria.length == 0) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'El nombre de la categoría es obligatorio',
          detail: 'Por favor, introduzca un nombre significativo'
        };
        dialog.showMessageBoxSync(window, msg);
        nombre_categoria_Add.focus();
      } else if (nombreCategoriaDuplicado(nombreCategoria, -1, this.categorias)) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'La categoría ya existe en la base de datos',
          detail: 'Por favor, introduzca un nombre diferente'
        };
        dialog.showMessageBoxSync(window, msg);
        nombre_categoria_Add.focus();
      } else {
        let nuevaCategoria = {};
        let nuevoId = gui.obtenerIdCategoria();
        let icono = ''
        if (nombre_categoria_icono_Add.value !== sinIcono) {
          icono = 'icono_cat_' + nuevoId + '.' + util.getFileExtension(nuevoIcono);
          fs.copyFileSync(nuevoIcono, __path + '/images/' + icono);
        } else {
          icono = sinIcono;
        }
        nuevaCategoria[nuevoId] = {
          nombre: nombreCategoria,
          icono: icono
        }
        Object.assign(this.categorias, nuevaCategoria);
        fs.writeFileSync(__path + '/data/categorias.json', JSON.stringify(this.categorias));
        main_Add_categorias.style.display = "none";
        this.gestionCategorias();
      }
    });
    ///////////////////////////////////////////////////////////////////////////////
    btn_Add_tienda.addEventListener('click', (e) => {
      main_Add_tiendas.style.display = "inline";
      nombre_tienda_Add.value = '';
      nombre_tienda_Add.focus();
      editando = true;
    });
    ///////////////////////////////////////////////////////////////////////////////
    btn_Add_cancel_T.addEventListener('click', (e) => {
      main_Add_tiendas.style.display = "none";
      editando = false;
    });

    btn_Add_ok_T.addEventListener('click', (e) => {
      // validar nombre tienda
      let nombreTienda = nombre_tienda_Add.value.trim();
      if (nombreTienda.length == 0) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'El nombre de la tienda es obligatorio',
          detail: 'Por favor, introduzca un nombre significativo'
        };
        dialog.showMessageBoxSync(window, msg);
        nombre_tienda_Add.focus();
      } else if (nombreTiendaDuplicado(nombreTienda, -1, this.tiendas)) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'La tienda ya existe en la base de datos',
          detail: 'Por favor, introduzca un nombre diferente'
        };
        dialog.showMessageBoxSync(window, msg);
        nombre_tienda_Add.focus();
      } else {

        let nuevaTienda = {};
        nuevaTienda[gui.obtenerIdTienda()] = {
          nombre: nombreTienda
        }
        Object.assign(this.tiendas, nuevaTienda);
        fs.writeFileSync(__path + '/data/tiendas.json', JSON.stringify(this.tiendas));
        main_Add_tiendas.style.display = "none";
        this.gestionTiendas();
      }
    });

    ///////////////////////////////////////////////////////////////////////////////
    btn_Add_backup.addEventListener('click', (e) => {
      main_Add_backup.style.display = "inline";
      desc_backup_Add.value = '';
      desc_backup_Add.focus();
      editando = true;
    });
    ///////////////////////////////////////////////////////////////////////////////
    btn_Add_cancel_B.addEventListener('click', (e) => {
      main_Add_backup.style.display = "none";
      editando = false;
    });

    btn_Add_ok_B.addEventListener('click', (e) => {
      // validar descripción backup
      let descBackup = desc_backup_Add.value.trim();
      if (descBackup.length == 0) {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'La descripción de la copia de seguridad es obligatoria',
          detail: 'Por favor, introduzca una descripción significativa'
        };
        dialog.showMessageBoxSync(window, msg);
        desc_backup_Add.focus();
      } else {
        let nuevoBackup = {};
        let codigo = util.obtieneTimeStampBackup();
        nuevoBackup[codigo] = {
          desc: descBackup
        }
        Object.assign(this.copias, nuevoBackup);
        fs.writeFileSync(__path + '/backup/indice_backup.json', JSON.stringify(this.copias));
        util.hacerBackup(codigo);
        main_Add_backup.style.display = "none";
        dialog.showMessageBox(window, {
          type: 'info',
          title: 'Copias de seguridad',
          message: 'Se ha realizado la copia de seguridad: ' + codigo,
          detail: '',
          buttons: [],
        });
        this.gestionBackup();
      }
    });

    ///////////////////////////////////////////////////////////////////////////////
    // Validar nombres de elementos duplicados
    let nombreduplicado = (nombre) => {
      let ok = false;
      let items = this.itemstorage.getAll();
      for (let codigo in items) {
        if (codigo !== this.current_codigo) {
          if (items[codigo].nombre.toLowerCase() == nombre.toLowerCase()) {
            ok = true;
            break;
          };
        };
      };
      return ok;
    };
    ///////////////////////////////////////////////////////////////////////////////
    // Definir evento Click en lista categorías
    this.document.getElementById("listacat").addEventListener('click', () => {
      let cadena = `<img class="img-rounded media-object"
          src="${__pathimg}/images/${this.categorias[this.document.getElementById("listacat").value].icono + '?nocache=' + Math.random()}"
          width="32" height="32" style="margin: 0px">`;
      this.iconocat.innerHTML = cadena;
    });
  }

  updateRegisterList(registers) {
    let reg_list = this.document.getElementById("register-list");
    while (reg_list.firstChild) {
      reg_list.removeChild(reg_list.firstChild);
    }
    let i = 0;
    let ordenacion = new Array();
    let reg = {};
    for (let codigo in registers) {
      switch (clasificacion.value) {
        case orden_natural:
          reg = {
            key: codigo
          }
          break;
        case orden_alfabetico:
          reg = {
            key: codigo,
            criterio: registers[codigo].nombre
          }
          break;
        case orden_garantia:
          reg = {
            key: codigo,
            criterio: registers[codigo].fvtogarantia
          }
          break;
        default:
          console.log('error en criterio de clasificacion');
          break;
      }
      ordenacion.push(reg);
    }
    if (clasificacion.value == orden_alfabetico || clasificacion.value == orden_garantia) {
      ordenacion = ordenacion.sort(function (a, b) {
        if (a.criterio.toLocaleLowerCase('es-ES') > b.criterio.toLocaleLowerCase('es-ES')) {
          return 1;
        }
        if (a.criterio.toLocaleLowerCase('es-ES') < b.criterio.toLocaleLowerCase('es-ES')) {
          return -1;
        }
        return 0;
      });
    }
    // generar lista de elementos
    ordenacion.forEach(item => {
      let codigo = item.key;
      let fingarantia = new Date(registers[codigo].fvtogarantia);
      let reg_element = this.document.createElement("li");
      this.current_codigo = codigo
      reg_element.className = `list-group-item ${(i == 0) ? 'active' : ''}`;
      reg_element.id = codigo;
      reg_element.innerHTML = `<img class="img-rounded media-object pull-left"
              src="${__pathimg}/images/${this.categorias[registers[codigo].codcategoria].icono + '?nocache=' + Math.random()}" width="32" height="32">
              <div class="media-body">
                <strong>${registers[codigo].nombre}</strong><p>Fin garantía: ${vigenciagarantia(fingarantia)}</p>
              </div>`;

      reg_list.appendChild(reg_element)

      reg_element.addEventListener('click', (e) => {
        if (editando == true) {
          msg = {
            type: 'error',
            title: 'Atención',
            message: 'No se puede cambiar de elemento, está editando: ' + this.nombre.value,
            detail: 'Por favor, termine la acción anterior'
          };
          dialog.showMessageBoxSync(window, msg);
        } else {
          let active = this.document.getElementsByClassName("active")[0]
          active.classList.remove("active")
          reg_element.className += ' active'
          this.updateForm(registers[codigo])
          this.current_codigo = codigo
        }
      })
      i++
    });

    let first_codigo;
    if (i > 0) {
      // Se posiciona la lista en el primer elemento
      first_codigo = ordenacion[0].key;
      this.updateForm(registers[first_codigo]);
      this.putFormInReadOnlyMode()
    } else {
      // No hay elementos que mostrar
      this.btn_edit.style.display = "none";
      this.btn_delete.style.display = "none";

    }
    this.current_codigo = first_codigo
    this.total_elem.innerHTML = "Nº total de elementos: " + i;

    return this.document
  }

  // devuelve id para nuevo registro de elementos
  obtenerid() {
    let claves = Object.keys(this.itemstorage.getAll());
    let ultima;
    if (claves.length == 0) {
      ultima = 0
    }
    else {
      ultima = claves[claves.length - 1];
    }
    return (parseInt(ultima, 10) + 1);
  }

  obtenerIdCategoria() {
    let claves = Object.keys(this.categorias);
    let ultima = claves[claves.length - 1];
    return (parseInt(ultima, 10) + 1);
  }

  obtenerIdTienda() {
    let claves = Object.keys(this.tiendas);
    let ultima = claves[claves.length - 1];
    return (parseInt(ultima, 10) + 1);
  }

  //////////////////////////////////////////////////////////////////////////////*
  // Actualiza los campos del formulario con el valor del registro
  updateForm(register) {
    // Visualizar imagen del elemento
    let foto = __pathimg + '/images/' + register.fotografia + '?nocache=' + Math.random();
    this.imagen_item.src = foto;
    // Seleccionar la categoria del elemento
    this.document.getElementById("listacat").value = register.codcategoria;
    // Visualizar icono categoría
    let cadena = `<img class="img-rounded media-object"
               src="${__pathimg}/images/${this.categorias[register.codcategoria].icono + '?nocache=' + Math.random()}"
               width="32" height="32" style="margin: 0px">`;
    this.iconocat.innerHTML = cadena;
    // Seleccionar la tienda del elemento
    this.document.getElementById("listatien").value = register.codtienda;
    // resto de campos
    this.nombre.value = register.nombre;
    this.marcamodelo.value = register.marcamodelo;
    this.notas.value = register.notas;
    this.fcompra.value = register.fcompra;
    this.importe.value = register.importe;
    this.periodo.value = register.periodo;
    this.unidades.value = register.unidades;
    fvtogarantia = register.fvtogarantia;
    if (register.fcompra == register.fvtogarantia) {
      this.chk_garantia.checked = false;
      ocultagarantia();
      this.textogarantia.innerHTML = '';
    } else {
      this.chk_garantia.checked = true;
      muestragarantia();
      this.textogarantia.innerHTML = `Garantía hasta: ${vigenciagarantia(new Date(fvtogarantia))}`;
    }
    this.factura = register.factura;
    this.manual = register.manual;
    nuevaFacturaCompleta = '';
    nuevoManualCompleto = '';
    if (this.factura !== '') {
      this.btn_ver_factura.style.display = "inline";
    } else {
      this.btn_ver_factura.style.display = "none";
    }
    if (this.manual !== '') {
      this.btn_ver_manual.style.display = "inline";
    } else {
      this.btn_ver_manual.style.display = "none";
    }
    this.tieneMant = register.tieneMant;
    this.motivoMant.value = register.motivoMant;
    this.numeroMNT.value = register.numeroMNT;
    this.unidadesMNT.value = register.unidadesMNT;
    this.periodoMNT.value = register.periodoMNT;

    if (register.tieneMant == false) {
      this.chk_mantenimientos.checked = false;
      this.textoMNT.innerHTML = '';
      ocultaMNT();
    } else {
      this.chk_mantenimientos.checked = true;
      this.textoMNT.innerHTML = '<span class="icon icon-tools"></span>';
      muestraMNT();
    }
  }

  putFormInReadOnlyMode() {
    activarBotonesNavegacion()
    this.document.getElementById("listacat").disabled = true;
    this.document.getElementById("listatien").disabled = true;

    this.chk_garantia.disabled = true;
    this.unidades.disabled = true;
    this.periodo.disabled = true;
    this.btn_calcular.style.display = "none";

    this.chk_mantenimientos.disabled = true;
    this.motivoMant.disabled = true;
    this.numeroMNT.disabled = true;
    this.unidadesMNT.disabled = true;
    this.periodoMNT.disabled = true;
    this.btn_calcularMNT.style.display = "none";

    this.btn_guardar_factura.style.display = "none";
    this.btn_guardar_manual.style.display = "none";
    this.nombre.readOnly = true;
    this.marcamodelo.readOnly = true;
    this.btn_cambio_imagen.style.display = "none";
    this.notas.readOnly = true;
    this.fcompra.readOnly = true;
    this.importe.readOnly = true;
    this.btn_cancel.style.display = "none";
    this.btn_ok.style.display = "none";
    this.btn_edit.style.display = "inline";
    this.btn_add.style.display = "inline";
    this.btn_delete.style.display = "inline";
  }

  putFormInWriteMode() {
    desactivarBotonesNavegacion()
    this.document.getElementById("listacat").disabled = false;
    this.document.getElementById("listatien").disabled = false;

    this.chk_garantia.disabled = false;
    this.periodo.disabled = false;
    this.unidades.disabled = false;
    this.btn_calcular.style.display = "inline"

    this.chk_mantenimientos.disabled = false;
    this.motivoMant.disabled = false;
    this.numeroMNT.disabled = false;
    this.unidadesMNT.disabled = false;
    this.periodoMNT.disabled = false;
    this.btn_calcularMNT.style.display = "inline";

    this.btn_guardar_factura.style.display = "inline";
    this.btn_guardar_manual.style.display = "inline";
    this.nombre.readOnly = false;
    this.marcamodelo.readOnly = false;
    this.btn_cambio_imagen.style.display = "inline";
    this.notas.readOnly = false;
    this.fcompra.readOnly = false;
    this.importe.readOnly = false;
    this.btn_cancel.style.display = "inline";
    this.btn_ok.style.display = "inline";
    this.btn_edit.style.display = "none";
    this.btn_add.style.display = "none";
    this.btn_delete.style.display = "none";
  }
}

///////////////////////////////////////////////////////////////////////////////
const activarBotonesNavegacion = () => {
  btn_inicio.disabled = true;
  btn_inventario.style.display = "inline";
  btn_categorias.style.display = "inline";
  btn_tiendas.style.display = "inline";
  btn_mantenimientos.style.display = "inline";
  btn_backup.style.display = "inline";
};
///////////////////////////////////////////////////////////////////////////////
const desactivarBotonesNavegacion = () => {
  btn_inicio.disabled = false;
  btn_inventario.style.display = "none";
  btn_categorias.style.display = "none";
  btn_tiendas.style.display = "none";
  btn_mantenimientos.style.display = "none";
  btn_backup.style.display = "none";
};
///////////////////////////////////////////////////////////////////////////////
let ocultagarantia = () => {
  calculogarantia.style.display = "none"
};
///////////////////////////////////////////////////////////////////////////////
let muestragarantia = () => {
  calculogarantia.style.display = "block"
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
// Visualizar pantalla principal
let muestraPrincipal = () => {
  main01.style.display = "inline"
  mainElementos.style.display = "inline"
};
///////////////////////////////////////////////////////////////////////////////
// Ocultar pantalla principal
let ocultaPrincipal = () => {
  main01.style.display = "none"
  mainElementos.style.display = "none"
};
///////////////////////////////////////////////////////////////////////////////
// Visualizar inventario
let muestrainventario = () => {
  ocultaPrincipal();
  main02.style.display = "inline";
  main_Add_C.style.display = "none";
  main_Add_categorias.style.display = "none";
  main_Add_T.style.display = "none";
  main_Add_tiendas.style.display = "none";
  main_Add_B.style.display = "none";
  main_Add_backup.style.display = "none";
  mainInventario.style.display = "inline";
  desactivarBotonesNavegacion();
};
///////////////////////////////////////////////////////////////////////////////
// Ocultar inventario
let ocultainventario = () => {
  muestraPrincipal();
  main02.style.display = "none";
  mainInventario.style.display = "none";
  activarBotonesNavegacion();
};
///////////////////////////////////////////////////////////////////////////////
// Visualizar categorias
let muestraCategorias = () => {
  ocultaPrincipal();
  main02.style.display = "inline";
  main_Add_C.style.display = "inline";
  main_Add_categorias.style.display = "none";
  main_Add_T.style.display = "none";
  main_Add_tiendas.style.display = "none";
  main_Add_B.style.display = "none";
  main_Add_backup.style.display = "none";
  mainCategorias.style.display = "inline";
  desactivarBotonesNavegacion();
};
///////////////////////////////////////////////////////////////////////////////
// Ocultar categorias
let ocultaCategorias = () => {
  muestraPrincipal();
  main02.style.display = "none";
  mainCategorias.style.display = "none";
  activarBotonesNavegacion();
};
///////////////////////////////////////////////////////////////////////////////
// Visualizar tiendas
let muestraTiendas = () => {
  ocultaPrincipal();
  main02.style.display = "inline";
  main_Add_T.style.display = "inline";
  main_Add_tiendas.style.display = "none";
  main_Add_C.style.display = "none";
  main_Add_categorias.style.display = "none";
  main_Add_B.style.display = "none";
  main_Add_backup.style.display = "none";
  mainTiendas.style.display = "inline";
  desactivarBotonesNavegacion();
};
///////////////////////////////////////////////////////////////////////////////
// Ocultar tiendas
let ocultaTiendas = () => {
  muestraPrincipal();
  main02.style.display = "none";
  mainTiendas.style.display = "none";
  activarBotonesNavegacion();
};

///////////////////////////////////////////////////////////////////////////////
// Visualizar copias de seguridad
let muestraBackup = () => {
  ocultaPrincipal();
  main02.style.display = "inline";
  main_Add_T.style.display = "none";
  main_Add_tiendas.style.display = "none";
  main_Add_C.style.display = "none";
  main_Add_categorias.style.display = "none";
  main_Add_B.style.display = "inline";
  main_Add_backup.style.display = "none";
  mainBackup.style.display = "inline";
  desactivarBotonesNavegacion();
};
///////////////////////////////////////////////////////////////////////////////
// Ocultar copias de seguridad
let ocultaBackup = () => {
  muestraPrincipal();
  main02.style.display = "none";
  mainBackup.style.display = "none";
  activarBotonesNavegacion();
};

///////////////////////////////////////////////////////////////////////////////
//crear la tabla para inventario
let creartablainventario = (cat, items, categorias) => {
  // Obtener icono
  let icono = "";
  if (cat == 'T') {
    icono = iconoTodasCategorias;
  } else {
    icono = categorias[cat].icono;
  }
  let cadena = `<img class="img-rounded media-object pull-left" src="${__pathimg}/images/${icono + '?nocache=' + Math.random()}"
                    width="32" height="32" style="margin-bottom: 5px">`;
  iconocatINV.innerHTML = cadena;
  let filas = "";
  let totaltxt = "";
  if (cat == 'T') {
    totaltxt = 'TOTAL DE TODAS LAS CATEGORÍAS';
  } else {
    totaltxt = 'TOTAL ' + categorias[cat].nombre.toUpperCase();
  }
  // recorro los datos creando las filas
  let i = 0;
  let total = 0;
  for (let codigo in items) {
    if (cat == 'T' || cat == items[codigo].codcategoria) {
      let fcompra = new Date(items[codigo].fcompra);
      filas += `
          <tr id="tr${i}">
              <td>${items[codigo].nombre}</td>
              <td>${items[codigo].marcamodelo}</td>
              <td align="center">${fcompra.toLocaleDateString("es-ES", options)}</td>
              <td align="right">${Number(items[codigo].importe).toLocaleString("es-ES", { style: 'currency', currency: 'EUR' })}</td>
          </tr> `;
      i++;
      total += Number(items[codigo].importe);
    }
  }
  filas += `
          <tr id="tr${i}">
              <td></td>
              <td align="right"><b>${totaltxt}</b></td>
              <td align="center"><b>${i} elementos</b></td>
              <td align="right"><b>${total.toLocaleString("es-ES", { style: 'currency', currency: 'EUR' })}</b></td>
          </tr> `;
  datosTablaInventario.innerHTML = filas;
};
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//crear la tabla para mantenimiento de categoriastiendas
let crearTablaCategorias = (categorias, items) => {
  let filas = "";
  let usos = {};
  // recorro los datos creando las filas
  for (let codigo in categorias) {
    // La categoría "Sin categoría" no se puede modficar ni borrar
    if (codigo !== "0") {
      // contar usos de cada categoría en elementos
      let cont = 0;
      for (let x in items) {
        if (codigo == items[x].codcategoria) {
          cont++;
        };
      };
      let nuevoUso = {};
      nuevoUso[codigo] = {
        contador: cont
      }
      Object.assign(usos, nuevoUso);
      // Botón de borrar solo si no está en uso
      let boton_borrar = '';
      if (usos[codigo].contador == 0) {
        boton_borrar = `<button title="Eliminar categoria" id="btn_Cate_Delete${codigo}" class="btn btn-negative">
                        <span class="icon icon-trash"></span></button>`;
      } else {
        boton_borrar = '';
      }
      filas += `<tr id="ft${codigo}">
                  <td>${categorias[codigo].nombre}</td>
                  <td align="center">
                    <img src="${__pathimg}/images/${categorias[codigo].icono + '?nocache=' + Math.random()}"
                    width="24" height="24" style="margin-top: 5px;">
                  </td>
                  <td align="center">${usos[codigo].contador}</td>
                  <td><button title="Editar categoria" id="btn_Cate_Edit${codigo}" class="btn btn-primary">
                      <span class="icon icon-pencil"></span></button>
                      <button title="Cambiar icono" id="icono_edit${codigo}" class="btn btn-primary">
                      <span class="icon icon-camera"></span></button>
                      ${boton_borrar}
                  </td>
                </tr> `;
    }
  }
  datosTablaCategorias.innerHTML = filas;
  for (let codigo in categorias) {
    // La categoría "Sin categoría" no se puede modficar ni borrar
    if (codigo !== "0") {
      eventosCategoriaEditar(codigo, categorias, usos, items);
      eventosCategoriaIconoEditar(codigo, categorias, usos, items);
      eventosCategoriaEliminar(codigo, categorias, usos, items);
    }
  }
};
///////////////////////////////////////////////////////////////////////////////
const eventosCategoriaEditar = (codigo, categorias, usos, items) => {
  document.getElementById(`btn_Cate_Edit${codigo}`).addEventListener('click', () => {
    if (editando == false) {
      // cambiar la fila a editable
      document.getElementById(`ft${codigo}`).innerHTML = `
        <td><input type="text" id="nombreCategoria" value="${categorias[codigo].nombre}"</td>
        <td align="center"><img src="${__pathimg}/images/${categorias[codigo].icono + '?nocache=' + Math.random()}"
            width="24" height="24" style="margin-top: 5px;">
        </td>
        <td align="center">${usos[codigo].contador}</td>
        <td><button title="Guardar cambios en categoria" id="btn_Cate_Edit${codigo}" class="btn btn-primary">
            <span class="icon icon-check"></span></button></td>
        `;
      document.getElementById('nombreCategoria').focus();
      //como he reconstruido el Guardar, debo ponerle su evento otra vez:
      eventosCategoriaGuardar(codigo, categorias, usos, items);
      editando = true;
      // desactivar boton altas
      btn_Add_categoria.disabled = true;
    } else {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'No se puede editar',
        detail: 'Por favor, termine la acción anterior'
      };
      dialog.showMessageBoxSync(window, msg);
    }
  });
};
///////////////////////////////////////////////////////////////////////////////
const eventosCategoriaIconoEditar = (codigo, categorias, usos, items) => {
  document.getElementById(`icono_edit${codigo}`).addEventListener('click', () => {
    if (editando == false) {
      // editar el código
      let fileNames = dialog.showOpenDialogSync(window, {
        title: "Seleccionar icono para la categoría",
        defaultPath: app.getPath('pictures'),
        buttonLabel: "Seleccionar",
        filters: [
          { name: 'Iconos', extensions: ['ico', 'png'] }
        ]
      });
      if (fileNames != undefined) {
        let nuevoIcono = util.extraeArchivo(fileNames[0]);
        // Copiar icono en carpeta images
        let icono = 'icono_cat_' + codigo + '.' + util.getFileExtension(nuevoIcono);
        fs.copyFileSync(fileNames[0], __path + '/images/' + icono);
        // actualizar categorias
        categorias[codigo].icono = icono;
        // grabar datos actualizados en archivo
        fs.writeFileSync(__path + '/data/categorias.json', JSON.stringify(categorias));
        // actualizar listado en pantalla
        let boton_borrar = '';
        if (usos[codigo].contador == 0) {
          boton_borrar = `<button title="Eliminar categoria" id="btn_Cate_Delete${codigo}" class="btn btn-negative">
                        <span class="icon icon-trash"></span></button>`;
        } else {
          boton_borrar = '';
        }
        document.getElementById(`ft${codigo}`).innerHTML = `
            <td>${categorias[codigo].nombre}</td>
            <td align="center">
              <img src="${__pathimg}/images/${categorias[codigo].icono + '?nocache=' + Math.random()}"
              width="24" height="24" style="margin-top: 5px;">
            </td>
            <td align="center">${usos[codigo].contador}</td>
            <td><button title="Editar categoria" id="btn_Cate_Edit${codigo}" class="btn btn-primary">
                <span class="icon icon-pencil"></span></button>
                <button title="Cambiar icono" id="icono_edit${codigo}" class="btn btn-primary">
                      <span class="icon icon-camera"></span></button>
                      ${boton_borrar}
            </td>`;
        //como he reconstruido el Editar, debo ponerle su evento otra vez:
        eventosCategoriaEditar(codigo, categorias, usos, items);
        eventosCategoriaIconoEditar(codigo, categorias, usos, items);
        eventosCategoriaEliminar(codigo, categorias, usos, items);
      } else {
        // Cancelado, se queda el icono anterior
      }
    } else {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'No se puede editar',
        detail: 'Por favor, termine la acción anterior'
      };
      dialog.showMessageBoxSync(window, msg);
    }
  });
};
///////////////////////////////////////////////////////////////////////////////
const eventosCategoriaGuardar = (codigo, categorias, usos, items) => {
  document.getElementById(`btn_Cate_Edit${codigo}`).addEventListener('click', () => {
    // validar nombre categoria
    let nombreCategoria = document.getElementById("nombreCategoria").value.trim();
    if (nombreCategoria.length == 0) {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'El nombre de la categoría es obligatorio',
        detail: 'Por favor, introduzca un nombre significativo'
      };
      dialog.showMessageBoxSync(window, msg);
      document.getElementById("nombreCategoria").focus();
    } else if (nombreCategoriaDuplicado(nombreCategoria, codigo, categorias)) {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'La categoría ya existe en la base de datos',
        detail: 'Por favor, introduzca un nombre diferente'
      };
      dialog.showMessageBoxSync(window, msg);
      document.getElementById("nombreCategoria").focus();
    } else {
      // guardo los datos en el objeto
      categorias[codigo].nombre = nombreCategoria;
      // categorias[codigo].icono = document.getElementById("nombreCategoriaIcono").value.trim();
      // grabar datos actualizados en archivo
      fs.writeFileSync(__path + '/data/categorias.json', JSON.stringify(categorias));
      //cambiar las filas a no editables
      // Botón de borrar solo si no está en uso
      let boton_borrar = '';
      if (usos[codigo].contador == 0) {
        boton_borrar = `<button title="Eliminar categoria" id="btn_Cate_Delete${codigo}" class="btn btn-negative">
                        <span class="icon icon-trash"></span></button>`;
      } else {
        boton_borrar = '';
      }
      document.getElementById(`ft${codigo}`).innerHTML = `
            <td>${categorias[codigo].nombre}</td>
            <td align="center">
              <img src="${__pathimg}/images/${categorias[codigo].icono + '?nocache=' + Math.random()}"
              width="24" height="24" style="margin-top: 5px;">
            </td>
            <td align="center">${usos[codigo].contador}</td>
            <td><button title="Editar categoria" id="btn_Cate_Edit${codigo}" class="btn btn-primary">
                <span class="icon icon-pencil"></span></button>
                <button title="Cambiar icono" id="icono_edit${codigo}" class="btn btn-primary">
                      <span class="icon icon-camera"></span></button>
                      ${boton_borrar}
             </td>`;
      //como he reconstruido el Editar, debo ponerle su evento otra vez:
      eventosCategoriaEditar(codigo, categorias, usos, items);
      eventosCategoriaIconoEditar(codigo, categorias, usos, items);
      eventosCategoriaEliminar(codigo, categorias, usos, items);
      editando = false;
      btn_Add_categoria.disabled = false;
    }
  });
};
///////////////////////////////////////////////////////////////////////////////
const eventosCategoriaEliminar = (codigo, categorias, usos, items) => {
  // Botón de borrar solo si no está en uso
  if (usos[codigo].contador == 0) {
    document.getElementById(`btn_Cate_Delete${codigo}`).addEventListener('click', () => {
      if (editando == false) {
        // Confirmar eliminación
        btn_Add_categoria.disabled = true;
        let respuesta = dialog.showMessageBoxSync(window, {
          type: 'warning',
          title: 'Atención',
          message: `Se va a eliminar la categoría: "${categorias[codigo].nombre}" y su icono asociado`,
          detail: 'El borrado no podrá revertirse',
          buttons: ["Cancelar", "Confirmar eliminación"],
          noLink: true
        });
        btn_Add_categoria.disabled = false;
        if (respuesta == 1) {
          // eliminar icono excepto si se trata del icono 'sinIcono'
          if (categorias[codigo].icono !== sinIcono) {
            fs.unlinkSync(__path + '/images/' + categorias[codigo].icono);
          }
          // eliminar categoria
          delete categorias[codigo];
          fs.writeFileSync(__path + '/data/categorias.json', JSON.stringify(categorias));
          crearTablaCategorias(categorias, items);
        }
      } else {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'No se puede eliminar',
          detail: 'Por favor, termine la acción anterior'
        };
        dialog.showMessageBoxSync(window, msg);
      }
    });
  };
};
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//crear la tabla para mantenimiento de tiendas
let crearTablaTiendas = (tiendas, items) => {
  let filas = "";
  let usos = {};
  // recorro los datos creando las filas
  for (let codigo in tiendas) {
    // La tienda "Otras tiendas" no se puede modficar ni borrar
    if (codigo !== "0") {
      // contar usos de cada tienda en elementos
      let cont = 0;
      for (let x in items) {
        if (codigo == items[x].codtienda) {
          cont++;
        };
      };
      let nuevoUso = {};
      nuevoUso[codigo] = {
        contador: cont
      }
      Object.assign(usos, nuevoUso);
      // Botón de borrar solo si no está en uso
      let boton_borrar = '';
      if (usos[codigo].contador == 0) {
        boton_borrar = `<button title="Eliminar tienda" id="btn_Tien_Delete${codigo}" class="btn btn-negative">
                        <span class="icon icon-trash"></span></button>`;
      } else {
        boton_borrar = '';
      }
      filas += `<tr id="ft${codigo}">
                  <td>${tiendas[codigo].nombre}</td>
                  <td align="center">${usos[codigo].contador}</td>
                  <td><button title="Editar tienda" id="btn_Tien_Edit${codigo}" class="btn btn-primary">
                      <span class="icon icon-pencil"></span></button>
                      ${boton_borrar}
                  </td>
                </tr> `;
    }
  }
  datosTablaTiendas.innerHTML = filas;
  for (let codigo in tiendas) {
    // La tienda "Otras tiendas" no se puede modficar ni borrar
    if (codigo !== "0") {
      eventosTiendaEditar(codigo, tiendas, usos, items);
      eventosTiendaEliminar(codigo, tiendas, usos, items);
    }
  }
};
///////////////////////////////////////////////////////////////////////////////
const eventosTiendaEditar = (codigo, tiendas, usos, items) => {
  document.getElementById(`btn_Tien_Edit${codigo}`).addEventListener('click', () => {
    if (editando == false) {
      // cambiar la fila a editable
      document.getElementById(`ft${codigo}`).innerHTML = `
        <td><input type="text" id="nombreTienda" value="${tiendas[codigo].nombre}"</td>
        <td align="center">${usos[codigo].contador}</td>
        <td><button title="Guardar cambio tienda" id="btn_Tien_Edit${codigo}" class="btn btn-primary">
            <span class="icon icon-check"></span></button>
        </td>`;
      document.getElementById('nombreTienda').focus();
      //como he reconstruido el Guardar, debo ponerle su evento otra vez:
      eventosTiendaGuardar(codigo, tiendas, usos, items);
      editando = true;
      // desactivar boton altas
      btn_Add_tienda.disabled = true;
    } else {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'No se puede editar',
        detail: 'Por favor, termine la acción anterior'
      };
      dialog.showMessageBoxSync(window, msg);
    }
  });
};
///////////////////////////////////////////////////////////////////////////////
const eventosTiendaGuardar = (codigo, tiendas, usos, items) => {
  document.getElementById(`btn_Tien_Edit${codigo}`).addEventListener('click', () => {
    // validar nombre
    let nombreTienda = document.getElementById("nombreTienda").value.trim();
    if (nombreTienda.length == 0) {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'El nombre de la tienda es obligatorio',
        detail: 'Por favor, introduzca un nombre significativo'
      };
      dialog.showMessageBoxSync(window, msg);
      document.getElementById("nombreTienda").focus();
    } else if (nombreTiendaDuplicado(nombreTienda, codigo, tiendas)) {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'La tienda ya existe en la base de datos',
        detail: 'Por favor, introduzca un nombre diferente'
      };
      dialog.showMessageBoxSync(window, msg);
      document.getElementById("nombreTienda").focus();
    } else {
      // guardo los datos en el objeto
      tiendas[codigo].nombre = nombreTienda;
      // grabar datos actualizados en archivo
      fs.writeFileSync(__path + '/data/tiendas.json', JSON.stringify(tiendas));
      //cambiar las filas a no editables
      // Botón de borrar solo si no está en uso
      let boton_borrar = '';
      if (usos[codigo].contador == 0) {
        boton_borrar = `<button title="Eliminar tienda" id="btn_Tien_Delete${codigo}" class="btn btn-negative">
                        <span class="icon icon-trash"></span></button>`;
      } else {
        boton_borrar = '';
      }
      document.getElementById(`ft${codigo}`).innerHTML = `
            <td>${tiendas[codigo].nombre}</td>
            <td align="center">${usos[codigo].contador}</td>
            <td><button title="Editar tienda" id="btn_Tien_Edit${codigo}" class="btn btn-primary">
                <span class="icon icon-pencil"></span></button>
                ${boton_borrar}
            </td>`;
      //como he reconstruido el Editar, debo ponerle su evento otra vez:
      eventosTiendaEditar(codigo, tiendas, usos, items);
      eventosTiendaEliminar(codigo, tiendas, usos, items);
      editando = false;
      btn_Add_tienda.disabled = false;
    }
  });
};
///////////////////////////////////////////////////////////////////////////////
const eventosTiendaEliminar = (codigo, tiendas, usos, items) => {
  // Botón de borrar solo si no está en uso
  if (usos[codigo].contador == 0) {
    document.getElementById(`btn_Tien_Delete${codigo}`).addEventListener('click', () => {
      if (editando == false) {
        // Confirmar eliminación
        btn_Add_tienda.disabled = true;
        let respuesta = dialog.showMessageBoxSync(window, {
          type: 'warning',
          title: 'Atención',
          message: `¿Seguro que quiere eliminar la tienda: ${tiendas[codigo].nombre}?`,
          detail: 'El borrado no podrá revertirse',
          buttons: ["Cancelar", "Confirmar eliminación"],
          noLink: true
        });
        btn_Add_tienda.disabled = false;
        if (respuesta == 1) {
          delete tiendas[codigo];
          fs.writeFileSync(__path + '/data/tiendas.json', JSON.stringify(tiendas));
          crearTablaTiendas(tiendas, items);
        }
      } else {
        msg = {
          type: 'error',
          title: 'Atención',
          message: 'No se puede eliminar',
          detail: 'Por favor, termine la acción anterior'
        };
        dialog.showMessageBoxSync(window, msg);
      }
    });
  };
};
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
//crear la tabla para mantenimiento de copias de seguridad
let crearTablaBackup = (copias) => {
  let filas = "";
  // recorro los datos creando las filas
  for (let codigo in copias) {
    filas += `<tr id="ft${codigo}">
              <td>${util.obtieneFechaBack(codigo)}</td>
              <td>${util.obtieneHoraBack(codigo)}</td>
              <td>${copias[codigo].desc}</td>
              <td><button title="Recuperar esta copia de seguridad" id="btn_Back_Edit${codigo}" class="btn btn-primary">
                  <span class="icon icon-download"></span></button>
                  <button title="Eliminar esta copia de seguridad" id="btn_Back_Delete${codigo}" class="btn btn-negative">
                    <span class="icon icon-trash"></span></button>
              </td>
              </tr> `;
  }
  datosTablaBackup.innerHTML = filas;
  for (let codigo in copias) {
    eventosBackRecuperar(codigo, copias);
    eventosBackEliminar(codigo, copias);
  }
};
///////////////////////////////////////////////////////////////////////////////
const eventosBackRecuperar = (codigo, copias) => {
  document.getElementById(`btn_Back_Edit${codigo}`).addEventListener('click', () => {
    if (editando == false) {
      let respuesta = dialog.showMessageBoxSync(window, {
        type: 'warning',
        title: 'Atención',
        message: `¿Seguro que quiere recuperar los datos de la copia de seguridad de:
        ${util.obtieneFechaBack(codigo)} ${util.obtieneHoraBack(codigo)}?`,
        detail: 'Se sobreescribirán los datos actuales',
        buttons: ["Cancelar", "Confirmar recuperación"],
        noLink: true
      });
      if (respuesta == 1) {
        util.recuperarBackup(codigo);
        dialog.showMessageBox(window, {
          type: 'info',
          title: 'Copias de seguridad',
          message: 'Se han recuperado los datos desde la copia de seguridad: ' + codigo,
          detail: '',
          buttons: [],
        });
        crearTablaBackup(copias);
      }
    } else {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'Acción no disponible en este momento',
        detail: 'Por favor, termine la acción anterior'
      };
      dialog.showMessageBoxSync(window, msg);
    }
  });
};
///////////////////////////////////////////////////////////////////////////////
const eventosBackEliminar = (codigo, copias) => {
  document.getElementById(`btn_Back_Delete${codigo}`).addEventListener('click', () => {
    if (editando == false) {
      let respuesta = dialog.showMessageBoxSync(window, {
        type: 'warning',
        title: 'Atención',
        message: `¿Seguro que quiere eliminar la copia de seguridad de: ${util.obtieneFechaBack(codigo)} ${util.obtieneHoraBack(codigo)}?`,
        detail: 'El borrado no podrá revertirse',
        buttons: ["Cancelar", "Confirmar eliminación"],
        noLink: true
      });
      if (respuesta == 1) {
        delete copias[codigo];
        fs.writeFileSync(__path + '/backup/indice_backup.json', JSON.stringify(copias));
        util.eliminarBackup(codigo);
        dialog.showMessageBox(window, {
          type: 'info',
          title: 'Copias de seguridad',
          message: 'Se ha eliminado la copia de seguridad: ' + codigo,
          detail: '',
          buttons: [],
        });
        crearTablaBackup(copias);
      }
    } else {
      msg = {
        type: 'error',
        title: 'Atención',
        message: 'Acción no disponible en este momento',
        detail: 'Por favor, termine la acción anterior'
      };
      dialog.showMessageBoxSync(window, msg);
    }
  });
};

///////////////////////////////////////////////////////////////////////////////
// Calcular vigencia de la garantía respecto a hoy
const vigenciagarantia = (fingarantia) => {
  let hoy = new Date(new Date().toISOString().substr(0, 10));
  let diasgar = (fingarantia - hoy) / 86400000 // de milisegundos a días
  let color = diasgar <= 0 ? "red" : (diasgar <= 90 ? "orange" : "green");
  let stylefecha = 'style="color: ' + color + '; font-weight: bold"';
  let txt = `<span ${stylefecha}>${fingarantia.toLocaleDateString("es-ES", options)}${diasgar <= 0
    ? ' (vencida)' : ', faltan ' + diasgar + ' días'}</span>`;
  return txt;
};
///////////////////////////////////////////////////////////////////////////////
// Validar categorias duplicadas
const nombreCategoriaDuplicado = (nombreCategoria, codigo_actual, categorias) => {
  let ok = false;
  for (let codigo in categorias) {
    if (codigo !== codigo_actual) {
      if (categorias[codigo].nombre.toLowerCase() == nombreCategoria.toLowerCase()) {
        ok = true;
        break;
      };
    };
  };
  return ok;
};
///////////////////////////////////////////////////////////////////////////////
// Validar tiendas duplicadas
const nombreTiendaDuplicado = (nombreTienda, codigo_actual, tiendas) => {
  let ok = false;
  for (let codigo in tiendas) {
    if (codigo !== codigo_actual) {
      if (tiendas[codigo].nombre.toLowerCase() == nombreTienda.toLowerCase()) {
        ok = true;
        break;
      };
    };
  };
  return ok;
};
///////////////////////////////////////////////////////////////////////////////
// Elegir nuevo archivo para icono categoria
const elegirIconoCatAdd = () => {
  let fileNames = dialog.showOpenDialogSync(window, {
    title: "Seleccionar icono para la categoría",
    defaultPath: app.getPath('pictures'),
    buttonLabel: "Seleccionar",
    filters: [
      { name: 'Iconos', extensions: ['ico', 'png'] }
    ]
  });
  if (fileNames != undefined) {
    nombre_categoria_icono_Add.value = util.extraeArchivo(fileNames[0]);
    nuevoIcono = fileNames[0];
    imagen_icono_cat.src = fileNames[0] + '?nocache=' + Math.random();

  } else {
    nombre_categoria_icono_Add.value = sinIcono;
  }
};

module.exports.GUI = GUI;
