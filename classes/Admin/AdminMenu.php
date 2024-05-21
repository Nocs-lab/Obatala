<?php
namespace Obatala\Admin;

defined('ABSPATH') || exit;

class AdminMenu {
    public static function add_admin_pages() {
        add_menu_page(
            __('Obatala Settings', 'obatala-tainacan'),  // Page title
            'Obatala',                                    // Menu title
            'manage_options',                             // Capability
            'obatala_settings_page',                      // Menu slug
            [SettingsPage::class, 'create_settings_page'], // Callback function
            'dashicons-media-interactive',                    // Icon URL (optional)
            -1                                             // Position (optional)
        );
        
        add_submenu_page(
            'obatala_settings_page',                       // Parent slug
            __('Obatala Settings', 'obatala-tainacan'),    // Page title
            __('Settings', 'obatala-tainacan'),            // Menu title
            'manage_options',                              // Capability
            'obatala_settings_page',                       // Menu slug
            [SettingsPage::class, 'create_settings_page']  // Callback function
        );

        // Add submenu for Process Collection
        add_submenu_page(
            'obatala_settings_page',                        // Parent slug
            __('All Processes', 'obatala-tainacan'),        // Page title
            __('All Processes', 'obatala-tainacan'),        // Menu title
            'manage_options',                               // Capability
            'edit.php?post_type=process_obatala'         // Menu slug
        );

        // Add submenu for Add New Process
        add_submenu_page(
            'obatala_settings_page',                        // Parent slug
            __('Add New Process', 'obatala-tainacan'),      // Page title
            __('Add New Process', 'obatala-tainacan'),      // Menu title
            'manage_options',                               // Capability
            'post-new.php?post_type=process_obatala'     // Menu slug
        );

        // Add submenu for Process Step Collection
        add_submenu_page(
            'obatala_settings_page',                        // Parent slug
            __('All Steps', 'obatala-tainacan'),            // Page title
            __('All Steps', 'obatala-tainacan'),            // Menu title
            'manage_options',                               // Capability
            'edit.php?post_type=step_obatala'    // Menu slug
        );

        // Add submenu for Add New Step
        add_submenu_page(
            'obatala_settings_page',                        // Parent slug
            __('Add New Step', 'obatala-tainacan'),         // Page title
            __('Add New Step', 'obatala-tainacan'),         // Menu title
            'manage_options',                               // Capability
            'post-new.php?post_type=step_obatala'// Menu slug
        );
    }
}
