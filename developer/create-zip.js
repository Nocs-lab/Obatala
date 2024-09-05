const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const packageJson = require('../package.json');
const version = packageJson.version;
const outputDir = path.join(__dirname, '../dist');
const outputFilePath = path.join(outputDir, `obatala.zip`);

function createZip() {
  // Garantir que o diretório dist exista
  fs.mkdirSync(outputDir, { recursive: true });

  const output = fs.createWriteStream(outputFilePath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`Arquivo .zip criado: ${outputFilePath}`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Inclui as pastas e arquivos necessários no .zip
  archive.directory('build/', 'build');
  archive.directory('classes/', 'classes');
  archive.directory('css/', 'css');
  archive.directory('languages/', 'languages');
  archive.directory('vendor/', 'vendor');
  archive.file('obatala.php', { name: 'obatala.php' });

  archive.finalize();
}

createZip();