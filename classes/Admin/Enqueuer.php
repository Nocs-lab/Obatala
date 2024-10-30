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
        'obatala_page_sector_manager' => 'sector_manager'
    ];
    // variavel onde estara o id do usuario logado.
    private static $current_user;
    
    public static function init() {
        self::$current_user = get_current_user_id();
        add_action('admin_enqueue_scripts', [self::class, 'enqueue_admin_scripts']);    
    }

    public static function enqueue_admin_scripts($hook) {
        if (array_key_exists($hook, self::$pages) && self::$current_user != 0) {
        // if (array_key_exists($hook, self::$pages)) {

            $asset_file = include OBATALA_PLUGIN_DIR . 'build/index.asset.php';

            wp_register_script(
                'obatala-admin-scripts',
                OBATALA_PLUGIN_URL . 'build/index.js',
                array_merge($asset_file['dependencies']),
                $asset_file['version'],
                true
            );
            wp_enqueue_script('obatala-admin-scripts');

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
        }
    }

    public static function get_user_id() {
        // Se o usuário ainda não foi carregado (ex.: caso `init` ainda não tenha sido executado)
        if (!self::$current_user) {
            self::$current_user = get_current_user_id();
        }
        return self::$current_user;
    }
}
