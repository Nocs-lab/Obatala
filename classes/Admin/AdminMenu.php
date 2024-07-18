<?php

namespace Obatala\Admin;

class AdminMenu {
    /**
     * Adiciona as páginas de administração ao menu do WordPress.
     */
    public static function add_admin_pages() {
        // Array contendo os detalhes das páginas de administração.
        $pages = [
            'process-manager' => [
                'title' => __('Process Manager', 'obatala'),
                'menu_title' => __('Process Manager', 'obatala'),
                'capability' => 'manage_options', // Capacidade necessária para acessar esta página.
                'icon' => 'dashicons-media-document',
                'position' => -1,
            ],
            'process-type-manager' => [
                'title' => __('Process Type Manager', 'obatala'),
                'menu_title' => __('Process Type Manager', 'obatala'),
                'capability' => 'edit_posts', // Capacidade necessária para acessar esta página.
                'icon' => 'dashicons-admin-generic',
                'position' => -1,
            ],
            'process-viewer' => [
                'title' => __('Process Viewer', 'obatala'),
                'menu_title' => __('Process Viewer', 'obatala'),
                'capability' => 'read', // Capacidade necessária para acessar esta página.
                'icon' => 'dashicons-visibility',
                'position' => -1,
            ], 
            'process-step-manager' => [
                'title' => __('Step Manager', 'obatala'),
                'menu_title' => __('Step Manager', 'obatala'),
                'capability' => 'manage_options', // Capacidade necessária para acessar esta página.
                'icon' => 'dashicons-admin-tools',
                'position' => -1,
            ],
        ];

        // Chama a função que cria as páginas de administração.
        self::create_admin_pages($pages);
    }

    /**
     * Cria as páginas de administração com base nos detalhes fornecidos.
     *
     * @param array $pages Array contendo os detalhes das páginas de administração.
     */
    private static function create_admin_pages($pages) {
        // Itera sobre o array de páginas e adiciona cada uma ao menu de administração.
        foreach ($pages as $slug => $page) {
            add_menu_page(
                $page['title'], // Título da página.
                $page['menu_title'], // Título do menu.
                $page['capability'], // Capacidade necessária para acessar a página.
                $slug, // Slug da página.
                [self::class, 'render_page'], // Função de callback para renderizar a página.
                $page['icon'], // Ícone do menu.
                $page['position'] // Posição no menu.
            );
        }
    }

    /**
     * Renderiza a página de administração correta com base no ID da tela atual.
     */
    public static function render_page() {
        // Obtém a tela atual.
        $screen = get_current_screen();
        $page_id = $screen->id;

        // Verifica o ID da tela e renderiza a div correspondente.
        switch ($page_id) {
            case 'toplevel_page_process-manager':
                echo '<div id="process-manager"></div>';
                break;
            case 'toplevel_page_process-type-manager':
                echo '<div id="process-type-manager"></div>';
                break;
            case 'toplevel_page_process-viewer':
                echo '<div id="process-viewer"></div>';
                break;
            case 'toplevel_page_process-step-manager':
                echo '<div id="process-step-manager"></div>';
                break;
        }
    }
}
