'use strict'
const fs = require("fs");

class ItemStorage {
  constructor(item_filepath) {
    this.item_filepath = item_filepath;
    this.data_object = null;
  }

  openDataFile() {
    // Si el fichero no existe lo creamos
    if (!fs.existsSync(this.item_filepath)) {
      fs.writeFileSync(this.item_filepath, "{}");
    }
    let data = fs.readFileSync(this.item_filepath, "utf8");
    this.data_object = JSON.parse(data);
  }

  add(item_register) {
    Object.assign(this.data_object, item_register);
  }

  save() {
    let data_json = JSON.stringify(this.data_object);
    fs.writeFileSync(this.item_filepath, data_json, "utf8");
  }

  find(codigo) {
    return this.data_object[codigo]
  }

  getAll() {
    return this.data_object
  }

  delete(codigo) {
    return delete this.data_object[codigo]
  }
}

module.exports.ItemStorage = ItemStorage