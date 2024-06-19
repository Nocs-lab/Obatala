<?php

namespace Obatala\Metadata;
class ProcessMetadataManager {

    // Prefixo para os metadados
    private static $meta_prefix = 'dynamic_field_';

    /**
     * Adiciona ou atualiza um metadado dinâmico para uma etapa específica.
     *
     * @param int $step_id O ID da etapa.
     * @param string $meta_key A chave do metadado. Se vazio, será gerado um identificador único.
     * @param array $meta_data Os dados do metadado a serem salvos.
     * @return bool True em caso de sucesso, False em caso de falha.
     */
    public static function save_metadata($step_id, $meta_data, $meta_key = '') {
        // Gerar um identificador único para o metadado se a chave não for fornecida
        if (empty($meta_key)) {
            $meta_key = self::$meta_prefix . uniqid();
        }

        // Serializar o metadado para armazenar como string JSON
        $serialized_meta_data = json_encode($meta_data);

        // Salvar ou atualizar o metadado usando update_post_meta, que adiciona ou atualiza conforme necessário
        return update_post_meta($step_id, $meta_key, $serialized_meta_data);
    }

    /**
     * Recupera todos os metadados dinâmicos associados a uma etapa específica.
     *
     * @param int $step_id O ID da etapa.
     * @return array Um array de metadados dinâmicos.
     */
    public static function get_metadata($step_id) {
        // Recuperar todos os metadados associados a esta etapa
        $meta_data = get_post_meta($step_id);

        // Filtrar apenas os metadados com o prefixo específico
        $dynamic_fields = [];
        foreach ($meta_data as $key => $value) {
            if (strpos($key, self::$meta_prefix) === 0) {
                $dynamic_fields[$key] = json_decode($value[0], true);
            }
        }

        return $dynamic_fields;
    }

    /**
     * Remove um metadado dinâmico específico de uma etapa.
     *
     * @param int $step_id O ID da etapa.
     * @param string $meta_key A chave do metadado a ser removido.
     * @return bool True em caso de sucesso, False em caso de falha.
     */
    public static function delete_metadata($step_id, $meta_key) {
        // Remover o metadado específico
        return delete_post_meta($step_id, $meta_key);
    }
}
