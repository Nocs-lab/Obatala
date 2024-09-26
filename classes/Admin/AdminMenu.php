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
                'title' => 'Process Models',
                'menu_title' => 'Process Models',
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
        echo '<h1>' . __('Bem-vindo ao Obatala', 'obatala') . '</h1>';
        echo '<p>' . __('Selecione uma opção do submenu para começar.', 'obatala') . '</p>';
        echo '<style>.wp-admin #toplevel_page_obatala-main .wp-submenu li a[href*="process-viewer"],
                .wp-admin #toplevel_page_obatala-main .wp-submenu li a[href*="process-step-editor"],
                .wp-admin #toplevel_page_obatala-main .wp-submenu li a[href*="process-type-editor"] {
                    display: none;
                }</style>';
    }

    /**
     * Renderiza a página de administração correta com base no slug da página atual.
     */
    public static function render_page() {
        $screen = get_current_screen();
        $page_id = $screen->id;

        // Renderiza a div correspondente com base no ID da tela
        if (strpos($page_id, 'obatala_page_') === 0) {
            echo '<div id="' . str_replace('_', '-', substr($page_id, strlen('obatala_page_'))) . '"></div>';
        } else {
            echo '<h1>Page Not Found</h1>';
        }
    }

    /**
     * Enfileira os scripts necessários para garantir o comportamento do menu.
     */
    public static function enqueue_scripts() {
        add_action('admin_footer', function () {
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
