/**
 * Runs wp i18n make-json with a mapping from src/*.js to build/index.js.
 * This produces Jed-formatted JSON files that WordPress loads for script translations.
 *
 * Prerequisites:
 * - WP-CLI installed (https://wp-cli.org/)
 * - Run from plugin directory, or set WP_PATH
 *
 * The mapping ensures all strings from src/ end up in one JSON file
 * (obatala-{locale}-{md5}.json) that WordPress finds for build/index.js.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PLUGIN_DIR = path.resolve(__dirname, '..');
const LANGUAGES_DIR = path.join(PLUGIN_DIR, 'languages');
const SRC_DIR = path.join(PLUGIN_DIR, 'src');

function findJsFiles(dir, base = '') {
    const results = [];
    const fullPath = path.join(dir, base);
    if (!fs.existsSync(fullPath)) return results;
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const e of entries) {
        const rel = path.join(base, e.name).replace(/\\/g, '/');
        if (e.isDirectory()) {
            results.push(...findJsFiles(dir, rel));
        } else if (e.name.endsWith('.js') || e.name.endsWith('.jsx')) {
            results.push(rel);
        }
    }
    return results;
}

function buildMap() {
    const files = findJsFiles(SRC_DIR);
    const map = {};
    for (const file of files) {
        map['src/' + file] = 'build/index.js';
    }
    return map;
}

function getWpPath() {
    const envPath = process.env.WP_PATH;
    if (envPath) return envPath;
    const possibleRoot = path.resolve(PLUGIN_DIR, '..', '..', '..');
    const wpConfig = path.join(possibleRoot, 'wp-config.php');
    if (fs.existsSync(wpConfig)) return possibleRoot;
    return null;
}

function main() {
    const map = buildMap();
    const mapPath = path.join(PLUGIN_DIR, 'developer', 'i18n-map.json');
    fs.writeFileSync(mapPath, JSON.stringify(map, null, 0), 'utf8');

    const wpPath = getWpPath();
    const pathArg = wpPath ? `--path=${wpPath}` : '';

    const languagesPath = path.relative(process.cwd(), LANGUAGES_DIR) || 'languages';

    const cmd = `wp i18n make-json ${languagesPath} ${languagesPath} --no-purge --domain=obatala ${pathArg} --use-map=${mapPath}`;

    try {
        execSync(cmd, {
            stdio: 'inherit',
            cwd: PLUGIN_DIR,
            shell: true,
        });
        console.log('JSON translation files created in', LANGUAGES_DIR);
    } catch (err) {
        console.error('Error running wp i18n make-json:', err.message);
        console.error('Ensure WP-CLI is installed and you are in the plugin directory.');
        console.error('For custom WordPress path: WP_PATH=/path/to/wordpress npm run i18n:make-json');
        process.exit(1);
    }
}

main();
