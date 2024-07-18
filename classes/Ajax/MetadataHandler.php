<?php

namespace Obatala\Ajax;

use Obatala\Metadata\ProcessMetadataManager;

class MetadataHandler {

    /**
     * Processa a requisição AJAX para salvar metadados.
     * Verifica se os dados necessários estão presentes e chama o método de salvamento.
     */
    public function handle_save_metadata() {
        // Verifica se 'step_id' e 'meta_data' foram enviados via POST
        if (isset($_POST['step_id']) && isset($_POST['meta_data'])) {
            // Sanitiza e converte 'step_id' para um inteiro
            $step_id = intval($_POST['step_id']);
            $meta_data = $_POST['meta_data'];

            // Itera sobre cada campo de metadado enviado
            foreach ($meta_data as $field) {
                // Sanitiza a chave e o valor do metadado
                $meta_key = sanitize_text_field($field['key']);
                $meta_value = sanitize_text_field($field['value']);

                // Chama o método para salvar o metadado
                $result = ProcessMetadataManager::save_metadata($step_id, $meta_value, $meta_key);
                if (!$result) {
                    // Se houver erro ao salvar, envia uma resposta de erro
                    wp_send_json_error('Erro ao salvar os metadados.');
                    return;
                }
            }

            // Se todos os metadados foram salvos com sucesso, envia uma resposta de sucesso
            wp_send_json_success('Metadados salvos com sucesso.');
        } else {
            // Se 'step_id' ou 'meta_data' não forem fornecidos, envia uma resposta de erro
            wp_send_json_error('Dados inválidos.');
        }
    }


    /**
     * Processa a requisição AJAX para obter metadados.
     * Verifica se o ID da etapa foi fornecido e chama o método para recuperar os metadados.
     */
    public function handle_get_metadata() {
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

    /**
     * Processa a requisição AJAX para deletar metadados.
     * Verifica se os dados necessários estão presentes e chama o método de deleção.
     */
    public function handle_delete_metadata() {
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

    /**
     * Processa a requisição AJAX para salvar os dados de uma etapa.
     * Verifica se os dados necessários estão presentes e chama o método de salvamento.
     */
    public function handle_save_step_data() {
        // Verifica se 'step_id' e 'process_id' foram enviados via POST
        if (isset($_POST['step_id']) && isset($_POST['process_id'])) {
            // Sanitiza e converte 'step_id' e 'process_id' para inteiros
            $step_id = intval($_POST['step_id']);
            $process_id = intval($_POST['process_id']);

            // Chama o método para salvar os dados da etapa, passando o ID da etapa e do processo
            $result = ProcessMetadataManager::save_step_data($step_id, $process_id);
            if ($result) {
                // Se a operação for bem-sucedida, envia uma resposta de sucesso
                wp_send_json_success('Dados da etapa salvos com sucesso.');
            } else {
                // Se houver falha ao salvar, envia uma resposta de erro
                wp_send_json_error('Erro ao salvar os dados da etapa.');
            }
        } else {
            // Se 'step_id' ou 'process_id' não forem fornecidos, envia uma resposta de erro
            wp_send_json_error('Dados inválidos.');
        }
    }
}
?>
