/**
 * Compiles a .po file to .mo and generates Jed JSON for script translations.
 * Use when WP-CLI is not available (e.g. Windows).
 *
 * Usage: node developer/po-to-mo-and-json.mjs [locale]
 * Example: node developer/po-to-mo-and-json.mjs es_ES
 * Default locale: es_ES
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import gettextParser from 'gettext-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_DIR = path.resolve(__dirname, '..');
const LANGUAGES_DIR = path.join(PLUGIN_DIR, 'languages');
const SCRIPT_HANDLE = 'obatala-admin-scripts';

const locale = process.argv[2] || 'es_ES';
const poPath = path.join(LANGUAGES_DIR, `obatala-${locale}.po`);
const moPath = path.join(LANGUAGES_DIR, `obatala-${locale}.mo`);
const jsonPath = path.join(LANGUAGES_DIR, `obatala-${locale}-${SCRIPT_HANDLE}.json`);

if (!fs.existsSync(poPath)) {
  console.error('PO file not found:', poPath);
  process.exit(1);
}

const poContent = fs.readFileSync(poPath, 'utf8');
const parsed = gettextParser.po.parse(poContent);

// Compile .mo
const moBuffer = gettextParser.mo.compile(parsed);
fs.writeFileSync(moPath, moBuffer);
console.log('Written:', moPath);

// Build Jed JSON for wp_set_script_translations (handle = obatala-admin-scripts)
const jed = {
  domain: 'obatala',
  locale_data: {
    obatala: {
      '': {
        plural_forms: parsed.headers['plural-forms'] || 'nplurals=1; plural=0;'
      }
    }
  }
};

const translations = parsed.translations || {};
for (const [msgctxt, contextTable] of Object.entries(translations)) {
  for (const [msgid, item] of Object.entries(contextTable)) {
    if (!item.msgstr || !item.msgstr.length) continue;
    // Skip the empty header entry (msgid ""); we already set "" to plural_forms
    if (msgid === '' && msgctxt === '') continue;
    const key = msgctxt ? `${msgctxt}\u0004${msgid}` : msgid;
    const value = item.msgstr.filter(Boolean).length ? item.msgstr : [msgid];
    jed.locale_data.obatala[key] = value;
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(jed), 'utf8');
console.log('Written:', jsonPath);
