<?php
// Deprecated
namespace Obatala\Ajax;


class AjaxHandler {
    public function __construct() {
        // Registra os endpoints AJAX com a função handle_ajax_request como callback
        add_action('wp_ajax_my_custom_action', [$this, 'handle_ajax_request']);
        add_action('wp_ajax_nopriv_my_custom_action', [$this, 'handle_ajax_request']);

        // Registra ação para salvar metadados
        add_action('wp_ajax_save_metadata', [$this, 'handle_ajax_request']);
        add_action('wp_ajax_nopriv_save_metadata', [$this, 'handle_ajax_request']);
    }

    /**
     * Callback para todas as requisições AJAX registradas.
     */
    public function handle_ajax_request() {
        // Verifica a existência e validade do nonce para segurança
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'my_custom_nonce')) {
            wp_send_json_error('Nonce inválido.');
        }

        // Verifica a ação a ser executada com base no parâmetro 'action_type' enviado
        $action = isset($_POST['action_type']) ? sanitize_text_field($_POST['action_type']) : '';
        $handler = new MetadataHandler();

        try {
            switch ($action) {
                case 'save_metadata':
                    $this->check_permissions();
                    $handler->handle_save_metadata();
                    break;
                case 'get_metadata':
                    $this->check_permissions();
                    $handler->handle_get_metadata();
                    break;
                case 'delete_metadata':
                    $this->check_permissions();
                    $handler->handle_delete_metadata();
                    break;
                case 'save_step_data':
                    $this->check_permissions();
                    $handler->handle_save_step_data();
                    break;
                default:
                    wp_send_json_error('Ação inválida.');
            }
        } catch (\Exception $e) {
            // Captura exceções e envia mensagem de erro JSON
            wp_send_json_error($e->getMessage());
        }

        // Finaliza a execução do script PHP após o envio da resposta JSON
        wp_die();
    }

    /**
     * Verifica as permissões necessárias para executar ações protegidas.
     * Lança uma exceção se as permissões não forem adequadas.
     */
    protected function check_permissions() {
        if (!current_user_can('manage_options')) {
            throw new \Exception('Permissões insuficientes.');
        }
    }
}

// Instancia a classe para registrar os hooks
new AjaxHandler();
