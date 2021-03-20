const { readdirSync, lstatSync } = require("fs");
const { join } = require("path");

const fetch = require("node-fetch");
const { nodes } = require("../config.json");

module.exports.Util = class Util {
  static walk(dir, files = []) {
    for (const file of readdirSync(dir)) {
      const path = join(dir, file);

      if (lstatSync(path).isDirectory()) {
        files.concat(this.walk(path, files));
      } else {
        files.push(path);
      }
    }

    return files;
  }
};
