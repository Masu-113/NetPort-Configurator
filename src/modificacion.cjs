const fs = require('fs');
const path = require('path');

// Ruta al archivo main.wxs generado
const filePath = path.join(__dirname, "src-tauri/target/release/wix/x64/main.wxs"); // Ajusta la ruta según sea necesario

// Leer el archivo
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error al leer el archivo:', err);
    return;
  }

  // Realiza las modificaciones necesarias
  const modifiedData = data.replace(
    '<Shortcut Id="ApplicationStartMenuShortcut"',
    '<Shortcut Id="ApplicationStartMenuShortcut" RunAs="elevated"'
  );

  // Escribir el archivo modificado
  fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error('Error al escribir el archivo:', err);
    } else {
      console.log('Archivo main.wxs modificado con exito.');
    }
  });
});
