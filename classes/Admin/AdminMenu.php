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
                'title' => 'Process Type Editor',
                'menu_title' => 'Process Type Editor',
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
                'title' => 'Process Viewer',
                'menu_title' => 'Process Viewer',
                'capability' => 'read',
                'slug' => 'process-viewer',
                'callback' => 'render_page',
                'show_in_menu' => true
            ],
            [
                'parent_slug' => 'obatala-main',
                'title' => 'Group Details',
                'menu_title' => 'Group Details',
                'capability' => 'manage_options',
                'slug' => 'sector-details',
                'callback' => 'render_page',
                'show_in_menu' => true
            ] 
        ]
    ];

    /**
     * Inicializa o hook para adicionar as páginas de administração ao menu do WordPress.
     */
    public static function init() {
        add_action('admin_menu', [self::class, 'add_admin_pages']);
        add_action('admin_enqueue_scripts', [self::class, 'enqueue_scripts']);
    }

    /**
     * Adiciona as páginas de administração ao menu do WordPress.
     */
    public static function add_admin_pages() {
        // Adiciona o menu principal "Obatala".
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

        // Adiciona os submenus.
        foreach (self::$pages['submenus'] as $submenu) {
            if ($submenu['show_in_menu']) {
                add_submenu_page(
                    $submenu['parent_slug'],
                    __($submenu['title'], 'obatala'),
                    __($submenu['menu_title'], 'obatala'),
                    $submenu['capability'],
                    $submenu['slug'],
                    [self::class, $submenu['callback']]
                );
            } else {
                add_submenu_page(
                    null, // Permitir acesso direto
                    __($submenu['title'], 'obatala'),
                    __($submenu['menu_title'], 'obatala'),
                    $submenu['capability'],
                    $submenu['slug'],
                    [self::class, $submenu['callback']]
                );
            }
        }
    }

    /**
     * Renderiza a página principal do menu.
     */
    public static function render_main_page() {
        echo '<div id="dashboard"></div>';
    }

    /**
     * Renderiza a página de administração correta com base no slug da página atual.
     */
    public static function render_page() {
        // Verificar se estamos no contexto correto da tela
        $screen = get_current_screen();
    
        if (!$screen || empty($screen->id)) {
            // Não pode continuar sem o contexto de tela, então mostramos uma mensagem.
            echo '<h1>Página não encontrada</h1>';
            return;
        }
    
        $page_id = $screen->id;
    
        // Agora podemos fazer a comparação sem os erros
        if (is_string($page_id) && strpos($page_id, 'obatala_page_') === 0) {
            $id_cleaned = str_replace('_', '-', substr($page_id, strlen('obatala_page_')));
            echo '<div id="' . esc_attr($id_cleaned) . '"></div>';
        } else {
            echo '<h1>Página não encontrada</h1>';
        }
    }
    

    /**
     * Enfileira os scripts necessários para garantir o comportamento do menu.
     */
    public static function enqueue_scripts() {
        add_action('admin_footer', function () {
            ?>
<script type="text/javascript">
// Quando a página do admin for carregada, esconda os itens "Process Viewer" e "Process Type Editor"
document.addEventListener('DOMContentLoaded', function() {
    const processViewerItem = document.querySelector(
        '#toplevel_page_obatala-main .wp-submenu li a[href*="process-viewer"]');
    const processTypeEditorItem = document.querySelector(
        '#toplevel_page_obatala-main .wp-submenu li a[href*="process-type-editor"]');
    const processSector_details = document.querySelector(
        '#toplevel_page_obatala-main .wp-submenu li a[href*="sector-details"]');
    if (processSector_details) {
        processSector_details.parentElement.style.display = 'none'; // Esconde o item "Group Details"
    }

    if (processViewerItem) {
        processViewerItem.parentElement.style.display = 'none'; // Esconde o item "Process Viewer"
    }

    if (processTypeEditorItem) {
        processTypeEditorItem.parentElement.style.display = 'none'; // Esconde o item "Process Type Editor"
    }

    // Exibe os itens "Process Viewer" e "Process Type Editor" quando o usuário clicar no item principal do menu
    const menuItem = document.querySelector('#toplevel_page_obatala-main');
    if (menuItem) {
        menuItem.addEventListener('click', function() {
            if (processViewerItem) {
                processViewerItem.parentElement.style.display =
                    'block'; // Exibe o item "Process Viewer"
            }
            if (processTypeEditorItem) {
                processTypeEditorItem.parentElement.style.display =
                    'block'; // Exibe o item "Process Type Editor"
            }
            if (processSector_details) {
                processSector_details.parentElement.style.display =
                    'block'; // Exibe o item "Group Details"
            }
        });
    }
});
</script>
<style>
/* Esconde os itens "Process Viewer" e "Process Type Editor" por padrão */
#toplevel_page_obatala-main .wp-submenu li a[href*="process-viewer"],
#toplevel_page_obatala-main .wp-submenu li a[href*="process-type-editor"],
#toplevel_page_obatala-main .wp-submenu li a[href*="sector-details"] {
    display: none;
}
</style>
<?php
        });
    }
}