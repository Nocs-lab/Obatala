<?php

namespace Obatala\Admin;

// Verifica se o arquivo está sendo acessado diretamente
if (!defined('ABSPATH')) {
    exit; // Se sim, encerra a execução para segurança
}

// Define a classe Enqueuer
class Enqueuer {
    // Propriedade estática que mapeia as páginas de administração aos seus IDs
    private static $pages = [
        'toplevel_page_process-manager' => 'process-manager',
        'toplevel_page_process-type-manager' => 'process-type-manager',
        'toplevel_page_process-viewer' => 'process-viewer',
        'toplevel_page_process-step-manager' => 'process-step-manager',
        // Adicione mais páginas conforme necessário
    ];

    // Método estático para enfileirar scripts e estilos de administração
    public static function enqueue_admin_scripts($hook) {
        // Verifica se a página atual está no array $pages
        if (array_key_exists($hook, self::$pages)) {
            // Log de depuração indicando que os scripts estão sendo enfileirados para a página atual
            error_log("Enqueueing scripts for $hook");

            // Inclui o arquivo de dependências gerado pelo Webpack
            $asset_file = include OBATALA_PLUGIN_DIR . 'build/index.asset.php';

            // Registra o script de administração
            wp_register_script(
                'obatala-admin-scripts', // Nome do script
                OBATALA_PLUGIN_URL . 'build/index.js', // URL do script
                array_merge($asset_file['dependencies']), // Dependências do script
                $asset_file['version'], // Versão do script
                true // Carregar no footer
            );
            // Enfileira o script de administração
            wp_enqueue_script('obatala-admin-scripts');

            // Registra o estilo de administração
            wp_register_style(
                'obatala-admin-styles', // Nome do estilo
                OBATALA_PLUGIN_URL . 'css/style.css', // URL do estilo
                ['wp-components'], // Dependências do estilo
                $asset_file['version'] // Versão do estilo
            );
            // Enfileira o estilo de administração
            wp_enqueue_style('obatala-admin-styles');

            // Log de depuração indicando que os scripts e estilos foram enfileirados
            error_log("Scripts and styles enqueued for $hook");
        } else {
            // Log de depuração indicando que a página atual foi ignorada
            error_log("Skipping script enqueue for $hook");
        }
    }
}
