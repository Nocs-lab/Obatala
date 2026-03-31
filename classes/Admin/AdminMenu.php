<?php

namespace {
    if (!defined('ABSPATH')) {
        exit;
    }
}

namespace Obatala\Admin {



    class AdminMenu
    {
        private static $pages = [
            'main' => [
                'title' => 'obatala',
                'menu_title' => 'obatala',
                'capability' => 'obatala_access',
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
                    'capability' => 'obatala_access',
                    'slug' => 'obatala-main',
                    'callback' => 'render_main_page',
                    'show_in_menu' => true
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Processes',
                    'menu_title' => 'Processes',
                    'capability' => 'obatala_manage_processes',
                    'slug' => 'process-manager',
                    'callback' => 'render_page',
                    'show_in_menu' => true
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Models',
                    'menu_title' => 'Models',
                    'capability' => 'obatala_manage_models',
                    'slug' => 'process-type-manager',
                    'callback' => 'render_page',
                    'show_in_menu' => true
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Process type editor',
                    'menu_title' => 'Process type editor',
                    'capability' => 'obatala_manage_models',
                    'slug' => 'process-type-editor',
                    'callback' => 'render_page',
                    'show_in_menu' => true
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Groups',
                    'menu_title' => 'Groups',
                    'capability' => 'obatala_manage_groups',
                    'slug' => 'sector_manager',
                    'callback' => 'render_page',
                    'show_in_menu' => true
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Process viewer',
                    'menu_title' => 'Process viewer',
                    'capability' => 'obatala_access',
                    'slug' => 'process-viewer',
                    'callback' => 'render_page',
                    'show_in_menu' => true
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Group details',
                    'menu_title' => 'Group details',
                    'capability' => 'obatala_manage_groups',
                    'slug' => 'sector-details',
                    'callback' => 'render_page',
                    'show_in_menu' => true
                ],
                [
                    'parent_slug' => 'obatala-main',
                    'title' => 'Mappers',
                    'menu_title' => 'Mappers',
                    'capability' => 'obatala_manage_mappers',
                    'slug' => 'mappers',
                    'callback' => 'render_mappers_page',
                    'show_in_menu' => true
                ]
            ]
        ];

        public static function init()
        {
            add_action('admin_menu', [self::class, 'add_admin_pages']);
            add_action('admin_enqueue_scripts', [self::class, 'enqueue_scripts']);
        }

        public static function add_admin_pages()
        {
            $main = self::$pages['main'];
            add_menu_page(
                $main['title'],
                $main['menu_title'],
                $main['capability'],
                $main['slug'],
                [self::class, $main['callback']],
                $main['icon'],
                $main['position']
            );

            foreach (self::$pages['submenus'] as $submenu) {
                $title = __($submenu['title'], 'obatala');
                $menu_title = __($submenu['menu_title'], 'obatala');
                if ($submenu['show_in_menu']) {
                    add_submenu_page(
                        $submenu['parent_slug'],
                        $title,
                        $menu_title,
                        $submenu['capability'],
                        $submenu['slug'],
                        [self::class, $submenu['callback']]
                    );
                } else {
                    add_submenu_page(
                        null,
                        $title,
                        $menu_title,
                        $submenu['capability'],
                        $submenu['slug'],
                        [self::class, $submenu['callback']]
                    );
                }
            }
        }


        public static function render_main_page()
        {
            echo '<div id="dashboard"></div>';
        }

        public static function render_mappers_page()
        {
            echo '<div id="mappers"></div>';
            echo '<script>console.log("div mappers encontrada:", document.getElementById("mappers"));</script>';
        }

        /**
         * Renderiza a página de administração correta com base no slug da página atual.
         */

        public static function render_page()
        {
            $screen = get_current_screen();

            if (!$screen || empty($screen->id)) {
                echo '<h1>Página não encontrada</h1>';
                return;
            }

            $page_id = $screen->id;

            if (is_string($page_id) && strpos($page_id, 'obatala_page_') === 0) {
                $id_cleaned = str_replace('_', '-', substr($page_id, strlen('obatala_page_')));
                echo '<div id="' . esc_attr($id_cleaned) . '"></div>';
            } else {
                echo '<h1>Página não encontrada</h1>';
            }
        }

        public static function enqueue_scripts()
        {
            add_action('admin_footer', function () {
                ?>
                <script type="text/javascript">
                    document.addEventListener('DOMContentLoaded', function () {
                        const processViewerItem = document.querySelector(
                            '#toplevel_page_obatala-main .wp-submenu li a[href*="process-viewer"]');
                        const processTypeEditorItem = document.querySelector(
                            '#toplevel_page_obatala-main .wp-submenu li a[href*="process-type-editor"]');
                        const processSector_details = document.querySelector(
                            '#toplevel_page_obatala-main .wp-submenu li a[href*="sector-details"]');
                        const processTypeExport = document.querySelector(
                            '#toplevel_page_obatala-main .wp-submenu li a[href*="mappers"]');

                        if (processSector_details) {
                            processSector_details.parentElement.style.display = 'none';
                        }

                        if (processViewerItem) {
                            processViewerItem.parentElement.style.display = 'none';
                        }

                        if (processTypeEditorItem) {
                            processTypeEditorItem.parentElement.style.display = 'none';
                        }

                        if (processTypeExport) {
                            processTypeExport.parentElement.style.display = 'none';
                        }

                        const menuItem = document.querySelector('#toplevel_page_obatala-main');
                        if (menuItem) {
                            menuItem.addEventListener('click', function () {
                                if (processViewerItem) {
                                    processViewerItem.parentElement.style.display = 'block';
                                }
                                if (processTypeEditorItem) {
                                    processTypeEditorItem.parentElement.style.display = 'block';
                                }
                                if (processSector_details) {
                                    processSector_details.parentElement.style.display = 'block';
                                }
                            });
                        }
                    });
                </script>
                <style>
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
}