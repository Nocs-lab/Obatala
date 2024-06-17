# Criando uma Página no Painel de Administração com Blocos Gutenberg

Este guia fornece uma visão clara e concisa sobre como criar uma página no painel de administração do WordPress utilizando blocos Gutenberg, permitindo a criação de interfaces interativas e dinâmicas com React no WordPress.

!!! Nota 
    Para mais detalhes sobre o uso de Gutenberg e uma lista completa de blocos reutilizáveis, visite: [The WordPress Gutenberg](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page).

---

### Passo 1: Enfileiramento de Scripts

No arquivo principal `obatala.php`, enfileiramos os scripts necessários para carregar a interface React no painel de administração:

```php
<?php

public function admin_enqueue_scripts( $hook ) {
    \Obatala\Admin\Enqueuer::enqueue_admin_scripts( $hook );
}
```

### Passo 2: Registro das Páginas de Administração

Na classe `AdminMenu`, registramos as páginas de administração. Cada página é associada a um callback que imprime uma `div` com um ID específico. Este ID é usado posteriormente para renderizar o corpo da página com React.

```php
<?php

namespace Obatala\Admin;

class AdminMenu {
    public static function add_admin_pages() {
        add_menu_page(
            __('Exemplo', 'obatala'),
            __('Exemplo', 'obatala'),
            'manage_options',
            'exemplo',
            [self::class, 'funcao_exemplo'],
            'dashicons-admin-generic',
            8
        );
    }
    public static function funcao_exemplo() {
        echo '<div id="id-exemplo"></div>';
    }
}
```

### Passo 3: Enfileiramento Condicional de Scripts

A classe `Enqueuer` verifica se o hook da página atual corresponde a um dos hooks esperados. Se sim, os scripts JavaScript e estilos CSS são carregados na página.

```php
<?php

namespace Obatala\Admin;

class Enqueuer {
    private static $pages = [
        'toplevel_page_exemplo' => 'exemplo',
    ];

    public static function enqueue_admin_scripts($hook) {
        if (array_key_exists($hook, self::$pages)) {
            $asset_file = include OBATALA_PLUGIN_DIR . 'build/index.asset.php';

            wp_register_script(
                'obatala-admin-scripts',
                OBATALA_PLUGIN_URL . 'build/index.js',
                $asset_file['dependencies'],
                $asset_file['version'],
                true
            );
            wp_enqueue_script('obatala-admin-scripts');

            wp_register_style(
                'obatala-admin-styles',
                OBATALA_PLUGIN_URL . 'css/style.css',
                ['wp-components'],
                $asset_file['version']
            );
            wp_enqueue_style('obatala-admin-styles');
        }
    }
}
```

### Passo 4: Renderização com React

No arquivo `src/admin/App.js`, utilizamos o React para renderizar componentes nas páginas de administração do WordPress. A função `render` do React é chamada para cada `div` com um ID correspondente.

```javascript
import { render } from '@wordpress/element';
import Exemplo from './components/Exemplo';

document.addEventListener('DOMContentLoaded', () => {

    const exemploElement = document.getElementById('id-exemplo');

    if (exemploElement) {
        render(<Exemplo />, exemploElement);
    }

});
```

---

### Recursos Adicionais
!!! Nota 
    - Para uma visão detalhada sobre como utilizar Gutenberg no contexto do nosso plugin, acesse o [curso online](https://learn.wordpress.org/course/using-the-wordpress-data-layer/).
    - Documentação completa e lista de blocos reutilizáveis estão disponíveis em: [The WordPress Gutenberg](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page).