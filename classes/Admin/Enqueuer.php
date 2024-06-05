<?php

namespace Obatala\Admin;

if (!defined('ABSPATH')) {
    exit;
}

class Enqueuer {
    private static $pages = [
        'toplevel_page_process-manager' => 'process-manager',
		'toplevel_page_process-type-manager' => 'process-type-manager',
        // Adicione mais páginas conforme necessário
    ];

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

            error_log("Scripts and styles enqueued for $hook");
        } else {
            error_log("Skipping script enqueue for $hook");
        }
    }
}
