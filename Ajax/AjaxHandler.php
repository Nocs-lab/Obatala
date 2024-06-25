<?php 

namespace Obatala\Ajax;

class AjaxHandler {
    public function __construct() {
        // Aqui registramos todos os endpoints AJAX
        add_action('wp_ajax_my_custom_action', [$this, 'handle_ajax_request']);
        add_action('wp_ajax_nopriv_my_custom_action', [$this, 'handle_ajax_request']);
    }

    public function handle_ajax_request() {
        // Verificação de nonce para segurança
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'my_custom_nonce')) {
            wp_send_json_error('Nonce inválido.');
        }

        // Determina a ação específica a ser executada
        $action = isset($_POST['action_type']) ? sanitize_text_field($_POST['action_type']) : '';
        switch ($action) {
            case 'save_metadata':
                $handler = new SaveMetadataHandler();
                $handler->process();
                break;
            case 'get_metadata':
                $handler = new GetMetadataHandler();
                $handler->process();
                break;
            case 'delete_metadata':
                $handler = new DeleteMetadataHandler();
                $handler->process();
                break;
            default:
                wp_send_json_error('Ação inválida.');
        }
    }

    protected function check_permissions() {
        // Aqui podemos verificar permissões, por exemplo
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permissões insuficientes.');
        }
    }
}

// Instancia a classe para registrar os hooks
new AjaxHandler();
