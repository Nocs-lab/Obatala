# 🧩 Criação de Interfaces no WordPress para Gerenciamento de Processos no Plugin Obatala

Antes de desenvolver ou testar localmente, siga o guia [Instalação](../instalacao.md) (`composer install`, `npm run build`, Tainacan ativo).

O desenvolvimento de interfaces administrativas no WordPress com o plugin **Obatala** envolve:

- Criação de menus personalizados.
- Registro de Custom Post Types (CPTs).
- Uso de blocos Gutenberg com React.
- Implementação de endpoints REST personalizados.

Este guia mostra como configurar essas funcionalidades de forma segura e escalável.

---

## 1. 📦 Registro de Custom Post Types com Tainacan

Para o gerenciamento de processos, o Obatala utiliza o [Tainacan](https://tainacan.github.io/tainacan-wiki/#/dev/repository-methods) como base para registro de **Custom Post Types**, como:

- `Process`
- `ProcessType`
- `Sector`

Cada tipo é tratado como uma coleção dentro da estrutura do Tainacan, permitindo controle sobre metadados, permissões e visualização.

---

## 2. 🛠️ Criação da Interface de Administração

A interface administrativa é composta por um menu principal e submenus no painel do WordPress, gerenciados pela classe `AdminMenu`.

### 📋 Estrutura do Menu

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
                'title' => 'Dashboard',
                'menu_title' => 'Dashboard',
                'capability' => 'manage_options',
                'slug' => 'obatala-main',
                'callback' => 'render_main_page',
                'show_in_menu' => true
            ],
            [
                'parent_slug' => 'obatala-main',
                'title' => 'Processes',
                'menu_title' => 'Processes',
                'capability' => 'manage_options',
                'slug' => 'process-manager',
                'callback' => 'render_page',
                'show_in_menu' => true
            ],
            [
                'parent_slug' => 'obatala-main',
                'title' => 'Models',
                'menu_title' => 'Models',
                'capability' => 'edit_posts',
                'slug' => 'process-type-manager',
                'callback' => 'render_page',
                'show_in_menu' => true
            ],
            [
                'parent_slug' => 'obatala-main',
                'title' => 'Process type editor',
                'menu_title' => 'Process type editor',
                'capability' => 'manage_options',
                'slug' => 'process-type-editor',
                'callback' => 'render_page',
                'show_in_menu' => true
            ],
            [
                'parent_slug' => 'obatala-main',
                'title' => 'Groups',
                'menu_title' => 'Groups',
                'capability' => 'manage_options',
                'slug' => 'sector_manager',
                'callback' => 'render_page',
                'show_in_menu' => true
            ],
            [
                'parent_slug' => 'obatala-main',
                'title' => 'Process viewer',
                'menu_title' => 'Process viewer',
                'capability' => 'read',
                'slug' => 'process-viewer',
                'callback' => 'render_page',
                'show_in_menu' => true
            ],
            [
                'parent_slug' => 'obatala-main',
                'title' => 'Group details',
                'menu_title' => 'Group details',
                'capability' => 'manage_options',
                'slug' => 'sector-details',
                'callback' => 'render_page',
                'show_in_menu' => true
            ],
            [
                'parent_slug' => 'obatala-main',
                'title' => 'Mappers',
                'menu_title' => 'Mappers',
                'capability' => 'read',
                'slug' => 'mappers',
                'callback' => 'render_mappers_page',
                'show_in_menu' => true
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
            $title = __($submenu['title'], 'obatala');
            $menu_title = __($submenu['menu_title'], 'obatala');
            add_submenu_page(
                $submenu['parent_slug'],
                $title,
                $menu_title,
                $submenu['capability'],
                $submenu['slug'],
                [self::class, $submenu['callback']]
            );
        }
    }
}
?>
```

### 🖥️ Renderização do Conteúdo das Páginas
A função `render_main_page` define um container `<div id="dashboard"></div>` onde o React monta o Dashboard. Os submenus utilizam `render_page`, que gera um `<div id="...">` conforme o slug da página; o React monta o componente correspondente.

## 3. 🧱 Utilização de Blocos Gutenberg com React
O Obatala utiliza blocos e componentes React dentro do painel administrativo com Gutenberg. Isso permite uma interface moderna e interativa para os usuários.

Exemplo de Integração:

```php
<?php
function obatala_manage_processos_page() {
    echo '<div class="wrap">';
    echo '<h1>' . esc_html(get_admin_page_title()) . '</h1>';
    echo '<div id="obatala-admin-app"></div>';
    echo '</div>';

    wp_enqueue_script(
        'obatala-admin-scripts',
        plugin_dir_url(__FILE__) . 'js/obatala-admin.js',
        ['wp-element', 'wp-components', 'wp-i18n', 'wp-api-fetch', 'wp-data'],
        filemtime(plugin_dir_path(__FILE__) . 'js/obatala-admin.js'),
        true
    );
}
?>
```

## 4. 🔐 Segurança e Validação
A segurança é fundamental. Recomenda-se sempre:

- Sanitizar entradas com sanitize_text_field(), esc_html(), esc_attr().

- Verificar intenções com check_admin_referer().

- Restringir acesso com current_user_can() para proteger conteúdo sensível.

## 5. 🔑 Permissões e Controle de Acesso
As capacidades (capability) definidas em cada submenu determinam quem pode visualizar e interagir com cada página:

- manage_options: administradores.

- edit_posts: editores e acima.

- read: qualquer usuário autenticado.

Utilize:

```php
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( __( 'Acesso negado.', 'obatala' ) );
}
```

## 6. 🔗 Registro de Endpoints REST
A API personalizada do Obatala expõe dados para manipulação via JavaScript/React:

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

    $exporter_api = new \Obatala\Api\ExporterApi();
    $exporter_api->register();
}
?>
```

Esses endpoints fornecem acesso a dados para:

- Listagem e edição de processos
- **Numeração única** na criação (`POST /obatala/v1/process_obatala`) e filtro `?numero_processo=` na listagem
- Exclusão lógica de processos (`DELETE /obatala/v1/process_obatala/{id}`)
- Tipos de processo
- Setores e suas relações
- Relatórios PDF (`GET /obatala/v1/process_obatala/{id}/report-pdf`)

### Numeração de processo

Ao criar uma instância (`POST /obatala/v1/process_obatala`), o backend atribui automaticamente um número no formato **`AAAA-NNNNN-DV`** (ex.: `2026-00042-6`). Os metadados `numero_processo`, `ano_processo`, `sequencial_processo` e `digito_verificador_processo` são gravados e retornados na resposta.

Filtrar listagem por número (completo, parcial ou sem máscara):

```http
GET /wp-json/obatala/v1/process_obatala?numero_processo=2026-00042-6
```

Regra do dígito verificador: soma dos dígitos de `AAAANNNNN` módulo 10. Detalhes, tabelas de banco e testes em [Gestão de processos](../processos/gestao-processos.md#numeracao-unica-do-processo).

### Exclusão lógica de processo

```http
DELETE /wp-json/obatala/v1/process_obatala/{id}
```

Marca `is_deleted = 1` e grava `deleted_at`, `deleted_by` e `deleted_by_name`. Processos excluídos não aparecem nas listagens REST nem na interface. Detalhes em [Gestão de processos](../processos/gestao-processos.md).

**Controle de acesso:** As rotas REST usam `permission_callback` definido em `ObatalaAPI` (`Obatala\Security\Roles::can_access_obatala()`), exigindo usuário autenticado com permissão Obatalá adequada.

### ✅ Conclusão
A arquitetura do plugin Obatala integra:

- WordPress como CMS robusto

- Tainacan para estrutura de dados personalizada

- Gutenberg para interfaces ricas com React

- REST API para integração entre front-end e back-end

Essas práticas garantem um ambiente intuitivo, modular e seguro para o gerenciamento de processos curatoriais no WordPress.