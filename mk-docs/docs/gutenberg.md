### Guia Detalhado: Criando uma Página no Painel de Administração com Blocos Gutenberg

Este guia detalha como criar uma página no painel de administração do WordPress que utiliza blocos Gutenberg. O uso de Gutenberg permite criar interfaces interativas e dinâmicas, aproveitando o poder do React no WordPress.

!!! nota
    Para mais detalhes sobre a utilização do Gutenberb e a lista completa de blocos reutilizáveis visite: [The WordPress Gutenberg](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page)

---

## Passo 1: Estrutura do Projeto

Certifique-se de que seu plugin tem uma estrutura organizada. Para este guia, usaremos a seguinte estrutura de diretórios:

```
└── 📁Obatala
    └── 📁js
        └── admin.js
    └── 📁src
        └── admin
            └── App.js
            └── components
                └── ExampleComponent.js
    └── 📁classes
        └── 📁admin
            └── AdminMenu.php
            └── SettingsPage.php
    └── obatala.php
```

---

## Passo 2: Registrar a Página de Administração

Primeiro, registre uma página de administração no WordPress usando `add_menu_page()`.

### `AdminMenu.php`

```php
<?php
    namespace Obatala\Admin;

    class AdminMenu {
        public function __construct() {
            add_action('admin_menu', [$this, 'add_admin_menu']);
        }

        public function add_admin_menu() {
            add_menu_page(
                __('Gerenciar Processos', 'obatala'),
                'Gerenciar Processos',
                'manage_options',
                'obatala_manage_processos',
                [$this, 'render_admin_page'],
                'dashicons-admin-tools'
            );
        }

        public function render_admin_page() {
            echo '<div id="obatala-admin-app"></div>';
        }
    }
```

### `obatala.php`

No arquivo principal do plugin, inicialize a classe `AdminMenu`.

```php
<?php 
    if ( ! defined( 'ABSPATH' ) ) {
        exit; // Exit if accessed directly
    }

    require_once __DIR__ . '/classes/admin/AdminMenu.php';

    new \Obatala\Admin\AdminMenu();
```

---

## Passo 3: Enfileirar Scripts de Blocos Gutenberg

Enfileire os scripts necessários para Gutenberg na página de administração.

### `AdminMenu.php` (continuação)

Adicione a função para enfileirar scripts no construtor da classe.

```php
<?php
    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
    }

    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'toplevel_page_obatala_manage_processos') {
            return;
        }

        wp_enqueue_script(
            'obatala-admin-scripts',
            plugin_dir_url(__FILE__) . '../../js/admin.js',
            ['wp-element', 'wp-components', 'wp-i18n', 'wp-api-fetch', 'wp-data'],
            filemtime(plugin_dir_path(__FILE__) . '../../js/admin.js'),
            true
        );

        wp_enqueue_style(
            'obatala-admin-styles',
            plugin_dir_url(__FILE__) . '../../css/admin.css',
            [],
            filemtime(plugin_dir_path(__FILE__) . '../../css/admin.css')
        );
    }
```

---

## Passo 4: Criar Componentes React para Gutenberg

Crie componentes React que serão usados nos blocos Gutenberg.

### `App.js`

```javascript
import { render } from '@wordpress/element';
import ExampleComponent from './components/ExampleComponent';

const App = () => {
    return (
        <div>
            <h1>Gerenciar Processos</h1>
            <ExampleComponent />
        </div>
    );
};

document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('obatala-admin-app');
    if (appElement) {
        render(<App />, appElement);
    }
});
```

### `ExampleComponent.js`

```javascript
import { useState } from '@wordpress/element';

const ExampleComponent = () => {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Você clicou {count} vezes</p>
            <button onClick={() => setCount(count + 1)}>Clique aqui</button>
        </div>
    );
};

export default ExampleComponent;
```

---

## Passo 5: Configurar o Build com Webpack

Configure o Webpack para compilar seus arquivos JavaScript.

### `webpack.config.js`

```javascript
const path = require('path');

module.exports = {
    entry: './src/admin/App.js',
    output: {
        path: path.resolve(__dirname, 'js'),
        filename: 'admin.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react', '@babel/preset-env']
                    }
                }
            }
        ]
    }
};
```

### `package.json`

Adicione os scripts de build e dependências.

```json
{
    "name": "obatala",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": {
        "build": "webpack --mode production",
        "start": "webpack --mode development --watch"
    },
    "devDependencies": {
        "@babel/core": "^7.14.6",
        "@babel/preset-env": "^7.14.7",
        "@babel/preset-react": "^7.14.5",
        "babel-loader": "^8.2.2",
        "webpack": "^5.44.0",
        "webpack-cli": "^4.7.2"
    },
    "dependencies": {
        "@wordpress/api-fetch": "^4.2.0",
        "@wordpress/components": "^11.1.0",
        "@wordpress/element": "^2.9.0",
        "@wordpress/i18n": "^4.0.11"
    }
}
```

---

## Passo 6: Build e Enfileiramento

### Construir o Projeto

Execute o comando para compilar o JavaScript:

```bash
npm install
npm run build
```

---

### Enfileirar o JavaScript e o CSS

Certifique-se de que os arquivos compilados sejam enfileirados corretamente na função `enqueue_admin_scripts` que criamos anteriormente.

---

### Conclusão

Seguindo esses passos, você criou uma página no painel de administração do WordPress que utiliza blocos Gutenberg para uma interface dinâmica e interativa. Este guia detalha o processo de configuração da página de administração, criação de componentes React, e compilação do código com Webpack. A utilização de Gutenberg e React proporciona uma experiência de usuário moderna e eficiente.