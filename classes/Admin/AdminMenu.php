<?php
namespace Obatala\Admin;

defined('ABSPATH') || exit;

class AdminMenu {
    public static function add_admin_pages() {
        add_menu_page(
            __('Obatala Settings', 'obatala'),  // Page title
            'Obatala',                                    // Menu title
            'manage_options',                             // Capability
            'obatala_settings_page',                      // Menu slug
            [SettingsPage::class, 'create_settings_page'], // Callback function
            'dashicons-media-interactive',                    // Icon URL (optional)
            -1                                             // Position (optional)
        );
        
        add_submenu_page(
            'obatala_settings_page',                       // Parent slug
            __('Obatala Settings', 'obatala'),    // Page title
            __('Settings', 'obatala'),            // Menu title
            'manage_options',                              // Capability
            'obatala_settings_page',                       // Menu slug
            [SettingsPage::class, 'create_settings_page']  // Callback function
        );

        // Add submenu for Process Collection
        add_submenu_page(
            'obatala_settings_page',                        // Parent slug
            __('All Processes', 'obatala'),        // Page title
            __('All Processes', 'obatala'),        // Menu title
            'manage_options',                               // Capability
            'obatala_manage_processes',           // Menu slug
            [self::class, 'render_all_processes_page']      // Callback function
        );

        // Add submenu for Add New Process
        add_submenu_page(
            'obatala_settings_page',                        // Parent slug
            __('Add New Process', 'obatala'),      // Page title
            __('Add New Process', 'obatala'),      // Menu title
            'manage_options',                               // Capability
            'post-new.php?post_type=process_obatala'     // Menu slug
        );

        // Add submenu for Process Step Collection
        add_submenu_page(
            'obatala_settings_page',                        // Parent slug
            __('All Steps', 'obatala'),            // Page title
            __('All Steps', 'obatala'),            // Menu title
            'manage_options',                               // Capability
            'edit.php?post_type=step_obatala'    // Menu slug
        );

        // Add submenu for Add New Step
        add_submenu_page(
            'obatala_settings_page',                        // Parent slug
            __('Add New Step', 'obatala'),         // Page title
            __('Add New Step', 'obatala'),         // Menu title
            'manage_options',                               // Capability
            'post-new.php?post_type=step_obatala'// Menu slug
        );
        
        add_action('admin_enqueue_scripts', [self::class, 'enqueue_admin_scripts']);
    }

    public static function render_all_processes_page() {
        echo '<div id="obatala-manage-processes">';
    }

    public static function enqueue_admin_scripts($hook) {
        if ($hook !== 'obatala_page_obatala_manage_processes') {
            return;
        }

        wp_enqueue_script(
            'obatala-admin-scripts',
            plugin_dir_url(__FILE__) . '../../js/admin.js',
            ['wp-element', 'wp-components', 'wp-i18n', 'wp-api-fetch', 'wp-data'],
            filemtime(plugin_dir_path(__FILE__) . '../../js/admin.js'),
            true
        );

        // wp_enqueue_style(
        //     'obatala-admin-styles',
        //     plugin_dir_url(__FILE__) . '../../css/admin.css',
        //     [],
        //     filemtime(plugin_dir_path(__FILE__) . '../../css/admin.css')
        // );
    }
}
