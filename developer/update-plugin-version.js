const fs = require('fs');
const path = require('path');

// Caminhos dos arquivos do plugin e READMEs
const pluginFilePath = path.join(__dirname, '../obatala.php');
const readmeMdFilePath = path.join(__dirname, '../README.md');
const readmeTxtFilePath = path.join(__dirname, '../readme.txt');
const packageJsonPath = path.join(__dirname, '../package.json');

// Função para atualizar a versão nos arquivos
const updatePluginVersion = () => {
  // Carrega o package.json atualizado (depois de rodar `npm version`)
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
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

  // Atualiza a versão no README.md (badge)
  if (!fs.existsSync(readmeMdFilePath)) {
    console.error(`Arquivo não encontrado: ${readmeMdFilePath}`);
    process.exit(1);
  }

  let readmeMdFileContent = fs.readFileSync(readmeMdFilePath, 'utf8');
  readmeMdFileContent = readmeMdFileContent.replace(
    /(\!\[Versão do Plugin\]\(https:\/\/img.shields.io\/badge\/version-)(\d+\.\d+\.\d+)(-blue\.svg\))/,
    `$1${version}$3`
  );

  if (!readmeMdFileContent.includes(`https://img.shields.io/badge/version-${version}-blue.svg`)) {
    console.error('Falha ao atualizar a versão no README.md.');
    process.exit(1);
  }

  fs.writeFileSync(readmeMdFilePath, readmeMdFileContent, 'utf8');
  console.log(`Versão no README.md atualizada para ${version}`);

  // Atualiza Stable tag no readme.txt
  if (!fs.existsSync(readmeTxtFilePath)) {
    console.error(`Arquivo não encontrado: ${readmeTxtFilePath}`);
    process.exit(1);
  }

  let readmeTxtFileContent = fs.readFileSync(readmeTxtFilePath, 'utf8');
  readmeTxtFileContent = readmeTxtFileContent.replace(
    /(Stable tag:\s*)(\d+\.\d+\.\d+)/i,
    `$1${version}`
  );

  if (!new RegExp(`Stable tag:\\s*${version}`, 'i').test(readmeTxtFileContent)) {
    console.error('Falha ao atualizar Stable tag no readme.txt.');
    process.exit(1);
  }

  fs.writeFileSync(readmeTxtFilePath, readmeTxtFileContent, 'utf8');
  console.log(`Stable tag no readme.txt atualizada para ${version}`);
};

// Chama a função para atualizar a versão
updatePluginVersion();
