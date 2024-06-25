<?php

namespace Obatala\Ajax;

use Obatala\Metadata\ProcessMetadataManager;

class SaveMetadataHandler {
    public function process() {
        if (isset($_POST['step_id']) && isset($_POST['meta_data'])) {
            $step_id = intval($_POST['step_id']);
            $meta_data = $_POST['meta_data'];
            $meta_key = isset($_POST['meta_key']) ? sanitize_text_field($_POST['meta_key']) : '';

            $result = ProcessMetadataManager::save_metadata($step_id, $meta_data, $meta_key);
            if ($result) {
                wp_send_json_success('Metadados salvos com sucesso.');
            } else {
                wp_send_json_error('Erro ao salvar os metadados.');
            }
        } else {
            wp_send_json_error('Dados inválidos.');
        }
    }
}
