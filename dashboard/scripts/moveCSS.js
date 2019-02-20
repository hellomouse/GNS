const fs = require('fs');
const path = require('path');

/**
 * Moves CSS files in specified folder
 * @param {string} startPath
 * @param {RegExp} filter
 */
function fromDir(startPath, filter) {
  const files = fs.readdirSync(startPath);

  for (const file of files) {
    const filename = path.join(startPath, file);
    const stat = fs.lstatSync(filename);

    if (stat.isDirectory()) {
      fromDir(filename, filter); // recurse
    } else if (filter.test(filename)) {
      if (fs.copyFileSync) {
        fs.copyFileSync(filename, `./lib/${filename}`);
      } else {
        fs.createReadStream(filename).pipe(fs.createWriteStream(`./lib/${filename}`));
      }
    }
  }
}

fromDir('./src', /.\.css$/);
