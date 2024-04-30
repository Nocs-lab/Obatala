<?php
namespace Obatala\Admin;

defined('ABSPATH') || exit;

class AdminMenu {
    public static function add_admin_menu() {
        // register the settings page at Settings > Obatala Settings
        add_options_page(
            __('Obatala Settings', 'obatala-tainacan'),
            'Obatala',
            'manage_options',
            'obatala_settings_page',
            array(SettingsPage::class, 'create_settings_page')
        );
        
    }
}