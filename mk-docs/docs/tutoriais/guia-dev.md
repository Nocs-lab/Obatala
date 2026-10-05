# Criação de Interfaces no WordPress para Gerenciamento de Processos no Plugin Obatala

O desenvolvimento de interfaces de usuário no WordPress para gerenciar processos personalizados no plugin Obatala envolve a criação de menus de administração, registro de tipos de posts (Custom Post Types) e implementação de blocos no editor Gutenberg. Este documento descreve como configurar a interface administrativa e gerenciar processos, utilizando funções nativas do WordPress e padrões de desenvolvimento recomendados.

## 1. Registro de Custom Post Types

Para a gestão de processos no Obatala, utilizamos o [Tainacan](https://tainacan.github.io/tainacan-wiki/#/dev/repository-methods) para criar e gerenciar tipos de posts personalizados. Estendemos a classe de coleção do Tainacan para definir os tipos de posts necessários, como `Process`, `ProcessType` e `Sector`.

## 2. Criação da Interface de Administração

Para criar uma interface de administração no WordPress utilizando o plugin Obatala, são configurados menus e submenus, permitindo aos usuários acessar diferentes ferramentas de gerenciamento de processos.

### Estrutura do Menu Principal

Abaixo está o código PHP usado para registrar o menu principal e seus submenus no painel administrativo. A classe `AdminMenu` gerencia a criação do menu "Obatala" com suas páginas de submenus específicas, como `Process Manager`, `Process Viewer`, `Process Models`, `Process Type Editor`, e `Sector Manager`.

```php
<?php
    namespace Obatala\Admin;

    class AdminMenu {
        private static $pages = [
            'main' => [
                'title' => 'Obatala',
                'menu_title' => 'Obatala',
                'capability' => 'manage_options',
                'slug' => 'obatala-main',
                'callback' => 'render_main_page',
                'icon' => 'dashicons-admin-site',
                'position' => 2
            ],
            'submenus' => [
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Process Manager',
                    'menu_title' => 'Process Manager',
                    'capability' => 'manage_options',
                    'slug' => 'process-manager',
                    'callback' => 'render_page'
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Process Viewer',
                    'menu_title' => 'Process Viewer',
                    'capability' => 'read',
                    'slug' => 'process-viewer',
                    'callback' => 'render_page'
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Process Models',
                    'menu_title' => 'Process Models',
                    'capability' => 'edit_posts',
                    'slug' => 'process-type-manager',
                    'callback' => 'render_page'
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Process Type Editor',
                    'menu_title' => 'Process Type Editor',
                    'capability' => 'manage_options',
                    'slug' => 'process-type-editor',
                    'callback' => 'render_page'
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Sector Manager',
                    'menu_title' => 'Sector Manager',
                    'capability' => 'manage_options',
                    'slug' => 'sector_manager',
                    'callback' => 'render_page'
                ]
            ]
        ];

        public static function init() {
            add_action('admin_menu', [self::class, 'add_admin_pages']);
            add_action('admin_enqueue_scripts', [self::class, 'enqueue_scripts']);
        }

        public static function add_admin_pages() {
            $main = self::$pages['main'];
            add_menu_page(
                __($main['title'], 'obatala'),
                __($main['menu_title'], 'obatala'),
                $main['capability'],
                $main['slug'],
                [self::class, $main['callback']],
                $main['icon'],
                $main['position']
            );

            foreach (self::$pages['submenus'] as $submenu) {
                add_submenu_page(
                    $submenu['parent_slug'],
                    __($submenu['title'], 'obatala'),
                    __($submenu['menu_title'], 'obatala'),
                    $submenu['capability'],
                    $submenu['slug'],
                    [self::class, $submenu['callback']]
                );
            }
        }
    }
?>
```

### Renderização das Páginas de Menu
Cada submenu é renderizado pela função render_page, que identifica a página com base no slug. A função render_main_page define o conteúdo inicial exibido ao acessar o menu principal "Obatala".

```php
<?php
    public static function render_main_page() {
        echo '<h1>' . __('Bem-vindo ao Obatala', 'obatala') . '</h1>';
        echo '<p>' . __('Selecione uma opção do submenu para começar.', 'obatala') . '</p>';
    }
?>
```

3. Uso de Blocos Gutenberg
Para criar uma interface de administração interativa, o Obatala utiliza blocos do editor Gutenberg. Com o Gutenberg, é possível criar componentes de interface utilizando React, o que permite uma experiência de usuário mais dinâmica.

```php
<?php
    function obatala_manage_processos_page() {
        <div class="wrap">
            <h1>echo esc_html(get_admin_page_title());></h1>
            <div id="obatala-admin-app"></div>
        </div>
        wp_enqueue_script(
            'obatala-admin-scripts',
            plugin_dir_url(__FILE__) . 'js/obatala-admin.js',
            array('wp-element', 'wp-components', 'wp-i18n', 'wp-api-fetch', 'wp-data'),
            filemtime(plugin_dir_path(__FILE__) . 'js/obatala-admin.js'),
            true
        );
    }
?>
```

1. Segurança e Validação
Para garantir segurança, todas as entradas de dados devem ser validadas e sanitizadas. Funções como sanitize_text_field() e check_admin_referer() devem ser usadas para proteger contra ataques como Cross-Site Scripting (XSS).

1. Permissões e Restrições de Acesso
As páginas e funcionalidades do plugin devem ser acessíveis apenas para usuários autorizados. Funções como current_user_can() são usadas para checar as permissões do usuário antes de exibir conteúdo sensível ou permitir certas ações.

1. Registro de Endpoints da REST API
O plugin registra endpoints personalizados da REST API para permitir a manipulação de dados do Obatala. Esses endpoints são implementados para manipular entidades como Process, ProcessType e Sector.

```php
<?php
    private function register_api_endpoints() {
        $custom_post_type_api = new \Obatala\Api\CustomPostTypeApi();
        $custom_post_type_api->register();

        $process_custom_fields = new \Obatala\Api\ProcessApi();
        $process_custom_fields->register();

        $process_type_custom_fields = new \Obatala\Api\ProcessTypeApi();
        $process_type_custom_fields->register();

        $sector_api = new \Obatala\Api\SectorApi();
        $sector_api->register();
    }
?>
```

## Conclusão
Essas etapas configuram uma interface robusta e segura para o WordPress com o plugin Obatala. A integração com o Tainacan e o uso de blocos Gutenberg permite que os usuários interajam com o plugin de maneira eficaz e moderna, proporcionando uma experiência de gestão de processos curatoriais intuitiva e personalizada.