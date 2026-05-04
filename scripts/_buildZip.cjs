// Helper script for buildCmi5PlayerForEditor.sh when `zip` is not available (Windows).
// Produces a zip with forward-slash paths, compatible with JSZip extraction in the browser.
// Usage: node _buildZip.cjs <sourceDir> <outputZipName>
const fs = require('fs');
const path = require('path');
const JSZip = require(path.resolve(__dirname, '../node_modules/jszip/lib/index.js'));

const [, , sourceDir, zipName] = process.argv;
if (!sourceDir || !zipName) {
  console.error('Usage: node _buildZip.cjs <sourceDir> <outputZipName>');
  process.exit(1);
}

const zip = new JSZip();

function addDir(dir, base) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const rel = (base ? base + '/' : '') + entry;
    if (rel === zipName) continue; // skip existing zip file
    if (fs.statSync(full).isDirectory()) { addDir(full, rel); }
    else { zip.file(rel, fs.readFileSync(full)); }
  }
}

addDir(sourceDir, '');

zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
  .then(buf => {
    fs.writeFileSync(path.join(sourceDir, zipName), buf);
    console.log(`zip written: ${zipName} (${buf.length} bytes)`);
  });
