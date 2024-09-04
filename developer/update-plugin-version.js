const fs = require('fs');
const path = require('path');

// Carrega o package.json
const packageJson = require('../package.json');

// Caminhos dos arquivos do plugin e README
const pluginFilePath = path.join(__dirname, '../obatala.php');
const readmeFilePath = path.join(__dirname, '../README.md');

// Função para atualizar a versão nos arquivos
const updatePluginVersion = () => {
  const version = packageJson.version;

  // Atualiza a versão no arquivo principal do plugin
  if (!fs.existsSync(pluginFilePath)) {
    console.error(`Arquivo não encontrado: ${pluginFilePath}`);
    process.exit(1);
  }

  let pluginFileContent = fs.readFileSync(pluginFilePath, 'utf8');
  pluginFileContent = pluginFileContent.replace(
    /(Version:\s*)(\d+\.\d+\.\d+)/,
    `$1${version}`
  );

  if (!pluginFileContent.includes(`Version: ${version}`)) {
    console.error('Falha ao atualizar a versão no arquivo do plugin.');
    process.exit(1);
  }

  fs.writeFileSync(pluginFilePath, pluginFileContent, 'utf8');
  console.log(`Versão do plugin atualizada para ${version} em ${pluginFilePath}`);

  // Atualiza a versão no README.md
  if (!fs.existsSync(readmeFilePath)) {
    console.error(`Arquivo não encontrado: ${readmeFilePath}`);
    process.exit(1);
  }

  let readmeFileContent = fs.readFileSync(readmeFilePath, 'utf8');
  readmeFileContent = readmeFileContent.replace(
    /(\!\[Versão do Plugin\]\(https:\/\/img.shields.io\/badge\/version-)(\d+\.\d+\.\d+)(-blue\.svg\))/,
    `$1${version}$3`
  );

  if (!readmeFileContent.includes(`https://img.shields.io/badge/version-${version}-blue.svg`)) {
    console.error('Falha ao atualizar a versão no README.md.');
    process.exit(1);
  }

  fs.writeFileSync(readmeFilePath, readmeFileContent, 'utf8');
  console.log(`Versão no README.md atualizada para ${version}`);
};

// Chama a função para atualizar a versão
updatePluginVersion();
