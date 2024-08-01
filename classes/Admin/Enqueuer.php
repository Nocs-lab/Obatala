<?php

namespace Obatala\Admin;

// Verifica se o arquivo está sendo acessado diretamente
if (!defined('ABSPATH')) {
    exit; // Se sim, encerra a execução para segurança
}

// Define a classe Enqueuer
class Enqueuer {
    private static $pages = [
        'obatala_page_process-manager' => 'process-manager',
        'obatala_page_process-type-manager' => 'process-type-manager',
        'obatala_page_process-viewer' => 'process-viewer',
        'obatala_page_process-step-manager' => 'process-step-manager',
        'obatala_page_process-type-editor' => 'process-type-editor',
        'obatala_page_process-step-editor' => 'process-step-editor'
    ];

    public static function init() {
        add_action('admin_enqueue_scripts', [self::class, 'enqueue_admin_scripts']);
    }

    public static function enqueue_admin_scripts($hook) {
        if (array_key_exists($hook, self::$pages)) {
            error_log("Enqueueing scripts for $hook");

            $asset_file = include OBATALA_PLUGIN_DIR . 'build/index.asset.php';

            wp_register_script(
                'obatala-admin-scripts',
                OBATALA_PLUGIN_URL . 'build/index.js',
                array_merge($asset_file['dependencies']),
                $asset_file['version'],
                true
            );
            wp_enqueue_script('obatala-admin-scripts');

            wp_register_style(
                'obatala-admin-styles',
                OBATALA_PLUGIN_URL . 'css/style.css',
                ['wp-components'],
                $asset_file['version']
            );
            wp_enqueue_style('obatala-admin-styles');
        }
    }
}

