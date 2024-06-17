<?php

namespace Obatala\Admin;

class AdminMenu {
    public static function add_admin_pages() {
        add_menu_page(
            __('Process Manager', 'obatala'),
            __('Process Manager', 'obatala'),
            'manage_options',
            'process-manager',
            [self::class, 'render_process_manager_page'],
            'dashicons-media-document',
            -1
        );

        add_menu_page(
            __('Process Type Manager', 'obatala'),
            __('Process Type Manager', 'obatala'),
            'manage_options',
            'process-type-manager',
            [self::class, 'render_process_type_manager_page'],
            'dashicons-admin-generic',
            -1
        );
    }

    public static function render_process_manager_page() {
        echo '<div id="process-manager"></div>';
    }

    public static function render_process_type_manager_page() {
        echo '<div id="process-type-manager"></div>';
    }
}
