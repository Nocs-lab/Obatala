<?php
namespace Obatala\Admin;

defined('ABSPATH') || exit;

class AdminMenu {
    public static function add_admin_pages() {
        // register the settings page at Settings > Obatala Settings
        add_options_page(
            __('Obatala Settings', 'obatala-tainacan'),
            'Obatala',
            'manage_options',
            'obatala_settings_page',
            array(SettingsPage::class, 'create_settings_page')
        );

        add_menu_page(
            __('Obatala Settings', 'obatala-tainacan'),  // Page title
            'Obatala',                                    // Menu title
            'manage_options',                             // Capability
            'obatala_settings_page',                      // Menu slug
            [SettingsPage::class, 'create_settings_page'], // Callback function
            'dashicons-admin-generic',                    // Icon URL (optional)
            6                                             // Position (optional)
        );
        
    }
}