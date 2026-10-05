<?php

namespace Obatala\Metadata;

class ProcessMetadataManager {

    // Prefixo para os metadados
    private static $meta_prefix = 'dynamic_field_';

    /**
     * Adiciona ou atualiza um metadado dinâmico para uma etapa específica.
     *
     * @param int $step_id O ID da etapa.
     * @param string $meta_value O valor do metadado a ser salvo.
     * @param string $meta_key A chave do metadado. Se vazio, será gerado um identificador único.
     * @return bool True em caso de sucesso, False em caso de falha.
     */
    public static function save_metadata($step_id, $meta_value, $meta_key = '') {
        if (!is_numeric($step_id) || $step_id <= 0) {
            error_log('ID da etapa inválido: ' . $step_id);
            return false;
        }

        if (empty($meta_key)) {
            $meta_key = 'meta_' . uniqid();
        }

        // Sanitiza o valor do metadado antes de salvar
        $sanitized_meta_value = self::sanitize_metadata($meta_value);

        // Valida os dados do metadado
        if (!self::validate_metadata($sanitized_meta_value)) {
            error_log('Metadados inválidos para etapa ' . $step_id);
            return false;
        }

        // Serializa o valor do metadado para salvar no banco de dados
        $serialized_meta_value = wp_json_encode($sanitized_meta_value);

        // Atualiza o metadado no banco de dados
        $result = update_post_meta($step_id, $meta_key, $serialized_meta_value);

        if ($result) {
            return true;
        } else {
            error_log('Erro ao salvar metadado para o passo ' . $step_id);
            return false;
        }
    }

    /**
     * Salva os dados dos campos de uma etapa do processo.
     *
     * @param int $step_id O ID da etapa do processo.
     * @param int $process_id O ID do processo.
     * @return bool True se os dados foram salvos com sucesso, False caso contrário.
     */
    public static function save_step_data($step_id, $process_id) {
        // Recupera todos os metadados associados a esta etapa
        $meta_data = self::get_metadata($step_id);

        // Armazena os dados da etapa 
        $step_data = $meta_data;

        // Salva os dados da etapa no post_meta do processo
        return update_post_meta($process_id, 'step_data_' . $step_id, $step_data);
    }

    /**
     * Recupera todos os metadados dinâmicos associados a uma etapa específica.
     *
     * @param int $step_id O ID da etapa.
     * @return array Um array de metadados dinâmicos.
     */
    public static function get_metadata($step_id) {
        // Recupera todos os metadados associados a esta etapa
        $meta_data = get_post_meta($step_id);

        // Filtra apenas os metadados com o prefixo específico
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
        // Remove o metadado específico
        $result = delete_post_meta($step_id, $meta_key);

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
        // Adiciona o tipo de campo aos argumentos para ser salvo como metadado
        $args['type'] = $type;

        // Gera um identificador único para o metadado
        $meta_key = self::$meta_prefix . uniqid();

        // Salva os dados do campo como metadado para ser utilizado no frontend
        self::save_metadata($args['step_id'], $args, $meta_key);

        // Gera e exibe o HTML do input
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
                // Renderiza um input básico de texto se o tipo não for reconhecido.
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
        $name  = isset($args['name']) ? esc_attr($args['name']) : '';
        $label = isset($args['label']) ? esc_html($args['label']) : '';
        $value = isset($args['value']) ? esc_attr($args['value']) : '';
        $placeholder = isset($args['placeholder']) ? esc_attr($args['placeholder']) : '';

        echo '<label for="' . $name . '">' . $label . '</label><br />';
        echo '<input type="' . $type . '" id="' . $name . '" name="' . $name . '" value="' . $value . '" placeholder="' . $placeholder . '" />';
        echo '<br />';
    }

    /**
     * Método para renderizar textarea.
     *
     * @param array $args Argumentos para textarea.
     * @return void
     */
    private static function render_textarea($args) {
        $name  = isset($args['name']) ? esc_attr($args['name']) : '';
        $label = isset($args['label']) ? esc_html($args['label']) : '';
        $value = isset($args['value']) ? esc_textarea($args['value']) : '';

        echo '<label for="' . $name . '">' . $label . '</label><br />';
        echo '<textarea id="' . $name . '" name="' . $name . '">' . $value . '</textarea>';
        echo '<br />';
    }

    /**
     * Método para renderizar select dropdown.
     *
     * @param array $args Argumentos para select dropdown.
     *                    Exemplo: 'options' => array('value1' => 'Label 1', 'value2' => 'Label 2').
     * @return void
     */
    private static function render_select($args) {
        $name    = isset($args['name']) ? esc_attr($args['name']) : '';
        $label   = isset($args['label']) ? esc_html($args['label']) : '';
        $options = isset($args['options']) && is_array($args['options']) ? $args['options'] : array();

        echo '<label for="' . $name . '">' . $label . '</label><br />';
        echo '<select id="' . $name . '" name="' . $name . '">';
        foreach ($options as $value => $label) {
            echo '<option value="' . esc_attr($value) . '">' . esc_html($label) . '</option>';
        }
        echo '</select>';
        echo '<br />';
    }

    /**
     * Método para renderizar radio buttons.
     *
     * @param array $args Argumentos para radio buttons.
     *                    Exemplo: 'options' => array('value1' => 'Label 1', 'value2' => 'Label 2').
     * @return void
     */
    private static function render_radio($args) {
        $name    = isset($args['name']) ? esc_attr($args['name']) : '';
        $label   = isset($args['label']) ? esc_html($args['label']) : '';
        $options = isset($args['options']) && is_array($args['options']) ? $args['options'] : array();

        echo '<label>' . $label . '</label><br />';
        foreach ($options as $value => $label) {
            echo '<input type="radio" id="' . esc_attr($value) . '" name="' . $name . '" value="' . esc_attr($value) . '">';
            echo '<label for="' . esc_attr($value) . '">' . esc_html($label) . '</label><br />';
        }
        echo '<br />';
    }

    /**
     * Sanitiza os dados do metadado.
     *
     * @param array $meta_data Os dados do metadado a serem sanitizados.
     * @return array Os dados do metadado sanitizados.
     */
    private static function sanitize_metadata($meta_data) {
        $sanitized_data = array();

        foreach ($meta_data as $key => $value) {
            switch ($key) {
                case 'type':
                case 'name':
                case 'value':
                case 'label':
                    // Sanitiza como um campo de texto
                    $sanitized_data[$key] = sanitize_text_field($value);
                    break;
                case 'options':
                    // Sanitiza cada chave e valor dos options, se for um array
                    if (is_array($value)) {
                        $sanitized_options = array();
                        foreach ($value as $opt_key => $opt_value) {
                            $sanitized_options[sanitize_text_field($opt_key)] = sanitize_text_field($opt_value);
                        }
                        $sanitized_data[$key] = $sanitized_options;
                    }
                    break;
                default:
                    // Sanitiza como um campo de texto por padrão
                    $sanitized_data[$key] = sanitize_text_field($value);
                    break;
            }
        }

        return $sanitized_data;
    }

    /**
     * Valida os dados do metadado.
     *
     * @param array $meta_data Os dados do metadado a serem validados.
     * @return bool True se os dados do metadado forem válidos, False caso contrário.
     */
    private static function validate_metadata($meta_data) {
        if (empty($meta_data['name'])) {
            error_log('Campo "name" não fornecido para os metadados: ' . json_encode($meta_data));
            return false;
        }
        return true;
    }
}
