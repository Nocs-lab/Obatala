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

        // Garantir que $step_id seja um número inteiro positivo
        if (!is_numeric($step_id) || $step_id <= 0) {
            error_log('ID da etapa inválido: ' . $step_id);
            return false; // $step_id inválido
        }

        // Gerar um identificador único para o metadado se a chave não for fornecida
        if (empty($meta_key)) {
            $meta_key = self::$meta_prefix . uniqid();
        } 

        // Sanitizar os dados antes de salvar
        $sanitized_meta_data = self::sanitize_metadata($meta_data);

        // Validar os dados antes de salvar
        if (!self::validate_metadata($sanitized_meta_data)) {
            error_log('Metadados inválidos para etapa ' . $step_id);
            return false; // Dados inválidos, abortar salvamento
        }

        // Verificar se já existe um metadado duplicado
        if (self::has_duplicate_metadata($step_id)) {
            error_log('Metadado duplicado detectado para a etapa ' . $step_id);
            return false; // Metadado duplicado, abortar salvamento
        }

        // Adicionar o dado '_type' que irá identificar o tipo de campo no frontend
        $sanitized_meta_data['_type'] = $sanitized_meta_data['type'];

        // Serializar o metadado para armazenar como string JSON
        $serialized_meta_data = wp_json_encode($sanitized_meta_data);

        // Utilizar a função do WordPress para salvar/atualizar o metadado
        $result = update_post_meta($step_id, sanitize_key($meta_key), $serialized_meta_data);

        // Verificar se a operação foi bem sucedida
        if ($result) {
            return true;
        } else {
            // Caso ocorra um erro ao salvar, log ou trate conforme necessário
            error_log('Erro ao salvar metadado para o passo ' . $step_id);
            return false;
        }
    }

    public static function metadata_exists($step_id, $meta_name) {
        $meta_data = self::get_metadata($step_id);

        foreach ($meta_data as $meta_key => $meta_value) {
            if ($meta_value['name'] === $meta_name) {
                return true;
            }
        }

        return false;
    }

    public static function has_duplicate_metadata($step_id) {
        $meta_data = self::get_metadata($step_id);
        $meta_names = [];
    
        foreach ($meta_data as $meta_key => $meta_value) {
            if (isset($meta_value['name'])) {
                if (in_array($meta_value['name'], $meta_names)) {
                    return true;
                }
                $meta_names[] = $meta_value['name'];
            }
        }
    
        return false;
    }

    /**
     * Salva os dados dos campos de uma etapa do processo.
     *
     * @param int $step_id O ID da etapa do processo.
     * @return bool True se os dados foram salvos com sucesso, False caso contrário.
     */
    public static function save_step_data($step_id, $process_id) {
        global $wpdb;

        // Recuperar todos os metadados associados a esta etapa
        $meta_data = self::get_metadata($step_id);

        // Armazenar os dados da etapa
        $step_data = $meta_data; 
        // Preparar consulta SQL
        $meta_key = 'step_data_' . $step_id;
        $prepared_query = $wpdb->prepare("UPDATE {$wpdb->postmeta} SET meta_value = %s WHERE post_id = %d AND meta_key = %s", $step_data, $process_id, $meta_key);

        // Executar consulta preparada
        return $wpdb->query($prepared_query);
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
        $result = delete_post_meta($step_id, sanitize_key($meta_key));

        if ($result) {
            error_log('Metadado removido com sucesso para a etapa ' . $step_id);
        } else {
            error_log('Erro ao remover metadado para a etapa ' . $step_id);
        }

        return $result;
    }

    /**
     * Renderiza um campo de input com base no tipo especificado.
     *
     * @param string $type O tipo de input (text, datepicker, upload, number, textfield, select, radio).
     * @param array $args Os argumentos adicionais para o input.
     *                    Exemplo: 'label' => 'Label do Campo', 'name' => 'nome_do_campo', 'options' => array(...).
     * @return void
     */
    public static function render_input_field($type, $args = array()) {
        // Adicionar o tipo de campo aos argumentos para ser salvo como metadado
        $args['type'] = $type;

        // Gerar um identificador único para o metadado
        $meta_key = self::$meta_prefix . uniqid();

        // Salvar os dados do campo como metadado para ser utilizado no frontend
        self::save_metadata($args['step_id'], $args, $meta_key);

        // Aqui, iremos gerar e exibir o HTML do input
        self::generate_input_html($type, $args);
    }

    /**
     * Método privado para gerar HTML para o input.
     *
     * @param string $type O tipo de input.
     * @param array $args Os argumentos para o input.
     * @return void
     */
    private static function generate_input_html($type, $args) {
        switch ($type) {
            case 'text':
            case 'date':
            case 'number':
            case 'file':
                self::render_basic_input($type, $args);
                break;
            case 'textfield':
                self::render_textarea($args);
                break;
            case 'select':
                self::render_select($args);
                break;
            case 'radio':
                self::render_radio($args);
                break;
            default:
                // Default para text input se o tipo não for reconhecido.
                self::render_basic_input('text', $args);
                break;
        }
    }

    /**
     * Método para renderizar inputs básicos (text, date, number, file).
     *
     * @param string $type Tipo do input.
     * @param array $args Argumentos adicionais.
     * @return void
     */
    private static function render_basic_input($type, $args) {
        echo '<label for="' . esc_attr($args['name']) . '">' . esc_html($args['label']) . '</label>';
        echo '<input type="' . esc_attr($type) . '" name="' . esc_attr($args['name']) . '" id="' . esc_attr($args['name']) . '" value="' . esc_attr($args['value']) . '">';
    }

    /**
     * Método para renderizar textarea.
     *
     * @param array $args Argumentos adicionais.
     * @return void
     */
    private static function render_textarea($args) {
        echo '<label for="' . esc_attr($args['name']) . '">' . esc_html($args['label']) . '</label>';
        echo '<textarea name="' . esc_attr($args['name']) . '" id="' . esc_attr($args['name']) . '">' . esc_textarea($args['value']) . '</textarea>';
    }

    /**
     * Método para renderizar select.
     *
     * @param array $args Argumentos adicionais.
     * @return void
     */
    private static function render_select($args) {
        echo '<label for="' . esc_attr($args['name']) . '">' . esc_html($args['label']) . '</label>';
        echo '<select name="' . esc_attr($args['name']) . '" id="' . esc_attr($args['name']) . '">';
        foreach ($args['options'] as $key => $label) {
            echo '<option value="' . esc_attr($key) . '">' . esc_html($label) . '</option>';
        }
        echo '</select>';
    }

    /**
     * Método para renderizar radio buttons.
     *
     * @param array $args Argumentos adicionais.
     * @return void
     */
    private static function render_radio($args) {
        echo '<label>' . esc_html($args['label']) . '</label>';
        foreach ($args['options'] as $key => $label) {
            echo '<input type="radio" name="' . esc_attr($args['name']) . '" value="' . esc_attr($key) . '">' . esc_html($label);
        }
    }

    // Outros métodos da classe...

    private static function sanitize_metadata($meta_data) {
        $sanitized_data = array();
    
        foreach ($meta_data as $key => $value) {
            switch ($key) {
                case 'type':
                case 'name':
                case 'value':
                case 'label':
                    $sanitized_data[$key] = sanitize_text_field($value);
                    break;
                case 'options':
                    if (is_array($value)) {
                        $sanitized_options = array();
                        foreach ($value as $opt_key => $opt_value) {
                            $sanitized_options[sanitize_text_field($opt_key)] = sanitize_text_field($opt_value);
                        }
                        $sanitized_data[$key] = $sanitized_options;
                    }
                    break;
                default:
                    $sanitized_data[$key] = sanitize_text_field($value);
                    break;
            }
        }
    
        return $sanitized_data;
    }
    
    private static function validate_metadata($meta_data) {
        if (empty($meta_data['name'])) {
            error_log('Campo "name" não fornecido para os metadados: ' . json_encode($meta_data));
            return false;
        }
        return true;
    }
}


