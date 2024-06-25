<?php

namespace Obatala\Ajax;

use Obatala\Metadata\ProcessMetadataManager;

class DeleteMetadataHandler {
    /**
     * Processa a requisição AJAX para deletar metadados.
     * Verifica se os dados necessários estão presentes e chama o método de deleção.
     */
    public function process() {
        // Verifica se 'step_id' e 'meta_key' foram enviados via POST
        if (isset($_POST['step_id']) && isset($_POST['meta_key'])) {
            // Sanitiza e converte 'step_id' para um inteiro
            $step_id = intval($_POST['step_id']);
            // Sanitiza a chave dos metadados
            $meta_key = sanitize_text_field($_POST['meta_key']);

            // Chama o método para deletar os metadados, passando o ID da etapa e a chave
            $result = ProcessMetadataManager::delete_metadata($step_id, $meta_key);
            if ($result) {
                // Se a operação for bem-sucedida, envia uma resposta de sucesso
                wp_send_json_success('Metadado removido com sucesso.');
            } else {
                // Se houver falha ao deletar, envia uma resposta de erro
                wp_send_json_error('Erro ao remover o metadado.');
            }
        } else {
            // Se 'step_id' ou 'meta_key' não forem fornecidos, envia uma resposta de erro
            wp_send_json_error('Dados inválidos.');
        }
    }
}
?>
