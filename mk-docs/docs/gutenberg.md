# 🧱 Criando uma Página no Painel de Administração com Blocos Gutenberg

Este guia mostra como criar páginas personalizadas no painel de administração do WordPress usando **blocos Gutenberg com React**, facilitando a construção de interfaces modernas e interativas.

> 💡 **Dica**  
> Para uma introdução mais ampla ao Gutenberg e aos blocos reutilizáveis, consulte a [documentação oficial do Gutenberg](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page).

---

## ✅ Etapas do Processo

### 1️⃣ Enfileiramento de Scripts

No arquivo principal do plugin (`obatala.php`), chamamos o enfileiramento de scripts administrativos:

```php
public function admin_enqueue_scripts( $hook ) {
    \Obatala\Admin\Enqueuer::enqueue_admin_scripts( $hook );
}
```

### 2️⃣ Registro da Página de Administração
Na classe AdminMenu, criamos uma nova página no painel. O callback associado imprime uma div com um ID, que será usada para renderizar o conteúdo via React:

```php
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

### 3️⃣ Enfileiramento Condicional de Scripts
Na classe Enqueuer, verificamos se o hook da página atual corresponde à nossa página personalizada. Se sim, os scripts e estilos são carregados:

```php
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

### 4️⃣ Renderização com React
No arquivo src/admin/App.js, usamos React para renderizar nosso componente dentro da div criada no HTML da página de administração:

```javascript
document.addEventListener("DOMContentLoaded", () => {
  const processElement = document.getElementById("process-manager");
  const processTypeElement = document.getElementById("process-type-manager");
  const processViewerElement = document.getElementById("process-viewer");
  const ProcessModelEditorElement = document.getElementById("process-type-editor");
  const sectorManagerElement = document.getElementById("sector-manager");
  const dashboardElement = document.getElementById("dashboard");
  const sectorDetailsElement = document.getElementById("sector-details");

  if (sectorDetailsElement) {
    createRoot(sectorDetailsElement).render(<SectorDetailsPage />);
  }

  if (processElement) {
    createRoot(processElement).render(<ProcessManager onSelectProcess={navigateToProcessViewer} />);
  }

  if (processTypeElement) {
    createRoot(processTypeElement).render(<ProcessTypeManager />);
  }

  if (processViewerElement) {
    createRoot(processViewerElement).render(<ProcessViewer />);
  }

  if (ProcessModelEditorElement) {
    createRoot(ProcessModelEditorElement).render(<ProcessModelEditor />);
  }

  if (sectorManagerElement) {
    createRoot(sectorManagerElement).render(<SectorManager />);
  }

  if (dashboardElement) {
    createRoot(dashboardElement).render(<DashboardPage />);
  }
});
```

### 📎 Recursos Complementares
📘 Links úteis

- Curso oficial:[Using the WordPress Data Layer](https://learn.wordpress.org/course/using-the-wordpress-data-layer/)

- Documentação dos blocos Gutenberg:[Gutenberg Storybook](https://wordpress.github.io/gutenberg/?path=/docs/docs-introduction--page)