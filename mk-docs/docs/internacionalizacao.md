# Internacionalização (i18n) do Obatala

O plugin Obatala suporta tradução tanto no backend (PHP) quanto no frontend (React). O idioma padrão do código é o inglês; as traduções são fornecidas em arquivos `.po` e carregadas de acordo com o locale do WordPress. O domínio de texto é `obatala`.

O plugin chama `load_plugin_textdomain('obatala', ...)` em `initialize()` para carregar as traduções PHP a partir da pasta `languages/`.

## Estrutura de arquivos

```
languages/
├── obatala.pot               # Template de strings (PHP + JS)
├── obatala-pt_BR.po          # Traduções em português brasileiro
├── obatala-pt_BR.mo          # Compilado para PHP
├── obatala-pt_BR-{md5}.json  # Traduções para o frontend React (gerado por wp i18n make-json)
├── obatala-es_ES.po          # Traduções em espanhol
├── obatala-es_ES.mo          # Compilado para PHP (msgfmt ou Poedit)
└── obatala-es_ES-{md5}.json  # Traduções para o frontend React (gerado por wp i18n make-json)
```

O plugin suporta **inglês** (código padrão), **português (pt_BR)** e **espanhol (es_ES)**. O idioma exibido segue o locale do WordPress (Configurações > Geral > Idioma do site).

## Fluxo de trabalho

### 1. Extrair novas strings (atualizar o .pot)

Para extrair strings do PHP e do JavaScript:

```bash
# Requer WP-CLI instalado
wp i18n make-pot . languages/obatala.pot --domain=obatala
```

Ou via npm:

```bash
npm run i18n:make-pot
```

### 2. Atualizar o arquivo .po

Após extrair as strings, atualize `obatala-pt_BR.po` com as novas traduções. Você pode usar o [Poedit](https://poedit.net/) ou editar manualmente.

### 3. Gerar o JSON para o frontend

O WordPress carrega as traduções do JavaScript a partir de arquivos JSON no formato Jed. Use o comando oficial `wp i18n make-json` via script npm:

```bash
npm run i18n:make-json
```

O script `developer/i18n-make-json.js` gera um mapa de `src/*.js` → `build/index.js` e executa `wp i18n make-json` com `--use-map`. O resultado é `languages/obatala-{locale}-{md5}.json`, que o WordPress carrega automaticamente para o script `obatala-admin-scripts`.

**Requisito:** WP-CLI instalado. Para WordPress em caminho custom: `WP_PATH=/caminho/wordpress npm run i18n:make-json`

**Nota:** O `wp i18n make-json` só extrai strings que têm referência a arquivos `.js` no `.po`. Garanta que o `.pot` seja gerado com `wp i18n make-pot` (que escaneia PHP e JS) antes de atualizar o `.po`.

### 4. Compilar o .mo (PHP)

Para as traduções PHP, compile o `.po` em `.mo`:

```bash
msgfmt -o languages/obatala-pt_BR.mo languages/obatala-pt_BR.po
```

O Poedit faz isso automaticamente ao salvar.

## Uso no código React

Use as funções de `@wordpress/i18n`:

```javascript
import { __, _x, _n, sprintf } from '@wordpress/i18n';

// String simples
__('Processes', 'obatala')

// String com contexto
_x('Process', 'Post type singular name', 'obatala')

// Plural
_n('%s item', '%s items', count, 'obatala')

// Com substituição
sprintf(__('Delete %s?', 'obatala'), name)
```

**Sempre use o domínio `'obatala'`** como segundo argumento.

## Testando

1. Configure o site em português: **Configurações > Geral > Idioma do site** → Português do Brasil.
2. Acesse as páginas do Obatala no painel.
3. As strings do menu, botões, labels e mensagens devem aparecer em português.

## Menu do painel (PHP)

O menu administrativo é registrado em `AdminMenu.php`. Os títulos são armazenados como strings em inglês no array estático; a tradução é aplicada em tempo de execução via `__($submenu['title'], 'obatala')` dentro de `add_admin_pages()`, pois funções não podem ser usadas em inicializadores de propriedades estáticas (expressão constante).

## Idiomas disponíveis

- **en** (padrão): strings no código em inglês.
- **pt_BR**: português do Brasil (`obatala-pt_BR.po` / `.mo` / `.json`).
- **es_ES**: espanhol (`obatala-es_ES.po` / `.mo` / `.json`).

## Adicionando novos idiomas

1. Copie `obatala-pt_BR.po` para `obatala-{locale}.po` (ex: `obatala-es_ES.po`).
2. Altere o cabeçalho do `.po`: `Language: locale` (ex: `es_ES`).
3. Traduza todas as entradas `msgstr`.
4. Compile o `.mo`: `msgfmt -o languages/obatala-{locale}.mo languages/obatala-{locale}.po` (ou salve no Poedit).
5. Execute `npm run i18n:make-json` (requer WP-CLI) — gera o JSON de frontend para cada `.po` em `languages/`.
