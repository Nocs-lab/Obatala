<?php

namespace Obatala\Admin;

if (!defined('ABSPATH')) {
    exit; // Se sim, encerra a execução para segurança
}

class Enqueuer {
    private static $pages = [
        'obatala_page_process-manager' => 'process-manager',
        'obatala_page_process-type-manager' => 'process-type-manager',
        'obatala_page_process-viewer' => 'process-viewer',
        'obatala_page_process-step-manager' => 'process-step-manager',
        'obatala_page_process-type-editor' => 'process-type-editor',
        'obatala_page_sector_manager' => 'sector_manager',
        'toplevel_page_obatala-main' => 'dashboard',
        'obatala_page_sector-details' => 'sector-details',
        'obatala_page_mappers' => 'mappers',
    ];

    public static function init() {
        add_action('admin_enqueue_scripts', [self::class, 'enqueue_admin_scripts']);
    }

    public static function enqueue_admin_scripts($hook) {
        if (array_key_exists($hook, self::$pages)) {
           
            $asset_file = include OBATALA_PLUGIN_DIR . 'build/index.asset.php';

            $script_deps = array_merge(
                $asset_file['dependencies'],
                ['wp-i18n']
            );
            wp_register_script(
                'obatala-admin-scripts',
                OBATALA_PLUGIN_URL . 'build/index.js',
                $script_deps,
                $asset_file['version'],
                true
            );
            wp_enqueue_script('obatala-admin-scripts');
            wp_set_script_translations(
                'obatala-admin-scripts',
                'obatala',
                OBATALA_PLUGIN_DIR . 'languages'
            );

            wp_add_inline_script(
                'obatala-admin-scripts',
                'window.wpApiSettings = window.wpApiSettings || {};'
                . 'window.wpApiSettings.root = ' . wp_json_encode( esc_url_raw( rest_url() ) ) . ';'
                . 'window.wpApiSettings.nonce = ' . wp_json_encode( wp_create_nonce('wp_rest') ) . ';',
                'before'
            );

            // Localiza o nonce para o JS
            wp_localize_script(
                'obatala-admin-scripts',
                'ObatalaApi',
                [
                    'nonce' => wp_create_nonce('wp_rest'),
                ]
            );

            // Enfileirando o estilo principal do plugin
            wp_register_style(
                'obatala-admin-styles',
                OBATALA_PLUGIN_URL . 'css/style.css',
                ['wp-components'],
                $asset_file['version']
            );
            wp_enqueue_style('obatala-admin-styles');

            // Enfileirando o estilo do React Flow
            wp_register_style(
                'react-flow-styles',
                OBATALA_PLUGIN_URL . 'css/react-flow.css', // Certifique-se de que o arquivo foi copiado
                [],
                $asset_file['version']
            );
            wp_enqueue_style('react-flow-styles');

            wp_localize_script('obatala-admin-scripts', 'obatalaApp', [
                'admin_url' => admin_url(),
                'site_url'  => site_url(), 
                'plugin_url' => OBATALA_PLUGIN_URL, 
            ]);

        }
    }
}