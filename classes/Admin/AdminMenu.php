<?php

namespace Obatala\Admin;

class AdminMenu {
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
        add_menu_page(
            __('Obatala', 'obatala'), // Título da página principal.
            __('Obatala', 'obatala'), // Título do menu principal.
            'manage_options', // Capacidade necessária para acessar o menu principal.
            'obatala-main', // Slug da página principal.
            function() {
                // Exibe uma mensagem ou uma página básica para o menu principal.
                echo '<h1>' . __('Bem-vindo ao Obatala', 'obatala') . '</h1>';
                echo '<p>' . __('Selecione uma opção do submenu para começar.', 'obatala') . '</p>';
            }, // Função de callback para exibir o conteúdo do menu principal.
            'dashicons-admin-site', // Ícone do menu principal.
            2 // Posição no menu.
        );

        // Adiciona os submenus.
        add_submenu_page(
            'obatala-main',
            __('Process Manager', 'obatala'),
            __('Process Manager', 'obatala'),
            'manage_options',
            'process-manager',
            [self::class, 'render_page']
        );

        add_submenu_page(
            'obatala-main',
            __('Process Type Manager', 'obatala'),
            __('Process Type Manager', 'obatala'),
            'edit_posts',
            'process-type-manager',
            [self::class, 'render_page']
        );

        add_submenu_page(
            'obatala-main',
            __('Process Viewer', 'obatala'),
            __('Process Viewer', 'obatala'),
            'read',
            'process-viewer',
            [self::class, 'render_page'] 
        );

        add_submenu_page(
            'obatala-main',
            __('Step Manager', 'obatala'),
            __('Step Manager', 'obatala'),
            'manage_options',
            'process-step-manager',
            [self::class, 'render_page']
        );
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
            case 'obatala_page_process-manager':
                echo '<div id="process-manager"></div>';
                break;
            case 'obatala_page_process-type-manager':
                echo '<div id="process-type-manager"></div>';
                break;
            case 'obatala_page_process-viewer':
                echo '<div id="process-viewer"></div>';
                break;
            case 'obatala_page_process-step-manager':
                echo '<div id="process-step-manager"></div>';
                break;
            default:
                echo '<h1>Page Not Found</h1>';
                break;
        }
    }
    /**
     * Enfileira os scripts necessários para garantir o comportamento do menu.
     */
    public static function enqueue_scripts() {
        // Adiciona o script para manter o menu aberto somente ao passar o mouse sobre "Obatala".
        add_action('admin_footer', function() {
            echo '<style>
                #toplevel_page_obatala-main.wp-menu-open > .wp-submenu {
                    display: block;
                }
                #toplevel_page_obatala-main:hover > .wp-submenu {
                    display: block;
                }
            </style>';
        });
    }
}

