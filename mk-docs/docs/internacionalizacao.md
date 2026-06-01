# Internacionalização (i18n) do Obatala

O plugin Obatala suporta tradução tanto no backend (PHP) quanto no frontend (React). O idioma padrão do código é o inglês; as traduções são fornecidas em arquivos `.po` e carregadas de acordo com o locale do WordPress. O domínio de texto é `obatala`.

O plugin chama `load_plugin_textdomain('obatala', ...)` em `initialize()` para carregar as traduções PHP a partir da pasta `languages/`.

## Estrutura de arquivos

```
languages/
├── obatala.pot                              # Template de strings (PHP + JS)
├── obatala-pt_BR.po                         # Traduções em português brasileiro
├── obatala-pt_BR.mo                         # Compilado para PHP
├── obatala-pt_BR-obatala-admin-scripts.json # Traduções JS (handle obatala-admin-scripts)
├── obatala-es_ES.po                         # Traduções em espanhol
├── obatala-es_ES.mo                         # Compilado para PHP
└── obatala-es_ES-obatala-admin-scripts.json # Traduções JS para es_ES
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

O script `developer/i18n-make-json.js` gera um mapa de `src/*.js` → `build/index.js` e executa `wp i18n make-json` com `--use-map`. O WordPress carrega o JSON cujo nome inclui o **handle do script** registrado em `Enqueuer.php`: `obatala-admin-scripts`. Exemplo: `languages/obatala-pt_BR-obatala-admin-scripts.json`.

**Requisito:** WP-CLI instalado. Para WordPress em caminho custom: `WP_PATH=/caminho/wordpress npm run i18n:make-json`

**Nota:** O `wp i18n make-json` só extrai strings que têm referência a arquivos `.js` no `.po`. Garanta que o `.pot` seja gerado com `wp i18n make-pot` (que escaneia PHP e JS) antes de atualizar o `.po`.

### 4. Compilar o .mo e o JSON (PHP + React, sem WP-CLI)

Quando WP-CLI ou `msgfmt` não estiverem disponíveis (ex.: Windows), use o script Node que compila `.mo` **e** gera o JSON do frontend a partir do `.po`:

```bash
node developer/po-to-mo-and-json.mjs pt_BR
node developer/po-to-mo-and-json.mjs es_ES
```

Ou via npm (padrão `es_ES`):

```bash
npm run i18n:po-to-mo-json
```

O script está em `developer/po-to-mo-and-json.mjs` e usa `gettext-parser`.

### 5. Compilar apenas o .mo (PHP)

Para as traduções PHP, compile o `.po` em `.mo`:

```bash
msgfmt -o languages/obatala-pt_BR.mo languages/obatala-pt_BR.po
```

O Poedit faz isso automaticamente ao salvar.

## Checklist ao adicionar novas strings

1. Envolver a string em `__('...', 'obatala')` (PHP) ou `__('...', 'obatala')` via `@wordpress/i18n` (React)
2. Adicionar a entrada em `languages/obatala.pot` (ou regenerar com `npm run i18n:make-pot`)
3. Traduzir em `obatala-pt_BR.po` e `obatala-es_ES.po`
4. Recompilar `.mo` e JSON: `node developer/po-to-mo-and-json.mjs pt_BR` e `es_ES`
5. Testar com o idioma do site em **Português do Brasil** ou **Español**

!!! warning "Strings só no código não bastam"
    Usar `__()` no JavaScript **não traduz automaticamente**. O texto só aparece no idioma do site se a string existir no arquivo JSON (`obatala-{locale}-obatala-admin-scripts.json`) gerado a partir do `.po`.

### Exemplo: exclusão de processo

| msgid (código) | pt_BR |
|----------------|-------|
| Process deleted successfully. | Processo excluído com sucesso. |
| Error deleting process. | Erro ao excluir processo. |
| Are you sure you want to delete process %s? | Tem certeza que deseja excluir o processo %s? |
| Delete process | Excluir processo |

No React, mensagens retornadas pela API também devem passar por `__(response.message, 'obatala')` antes de exibir ao usuário.

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
