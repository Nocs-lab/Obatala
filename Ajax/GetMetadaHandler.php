<?php 

namespace Obatala\Ajax;

use Obatala\Metadata\ProcessMetadataManager;

class GetMetadataHandler {
    /**
     * Processa a requisição AJAX para obter metadados.
     * Verifica se o ID da etapa foi fornecido e chama o método para recuperar os metadados.
     */
    public function process() {
        // Verifica se 'step_id' foi enviado via GET
        if (isset($_GET['step_id'])) {
            // Sanitiza e converte 'step_id' para um inteiro
            $step_id = intval($_GET['step_id']);
            // Chama o método para obter os metadados associados ao 'step_id'
            $metadata = ProcessMetadataManager::get_metadata($step_id);
            // Envia uma resposta de sucesso com os metadados
            wp_send_json_success($metadata);
        } else {
            // Se 'step_id' não for fornecido, envia uma resposta de erro
            wp_send_json_error('ID da etapa inválido.');
        }
    }
}
?>
