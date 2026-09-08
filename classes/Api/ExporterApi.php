<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;
use WP_REST_Response;
use Obatala\Services\TainacanExportService;
use Obatala\Services\TainacanMappingService;

class ExporterApi extends ObatalaAPI {
    private const DEFAULT_DECISION_RULES = [
        'quantity_field_id' => '',
        'quantity_fallback' => '1',
        'multi_or_single_field_id' => '',
        'data_entry_mode_field_id' => '',
        'spreadsheet_upload_field_id' => '',
        'same_values_mode_field_id' => '',
        'same_values_unique_id_field_id' => '',
        'same_values_prefix_mode_field_id' => '',
        'same_values_prefix_text_field_id' => '',
        'same_values_id_prefix' => '',
        'multi_items_value' => 'Sim',
        'single_item_value' => 'Não',
        'upload_mode_value' => 'Planilha',
        'fill_mode_value' => 'Manual',
        'same_values_enabled_value' => 'Sim',
    ];
    private const MAPPER_STATUS_ENABLED = 'enabled';
    private const MAPPER_STATUS_DRAFT = 'draft';
    private const MAPPER_STATUS_DISABLED = 'disabled';

    public function register_routes() {

        // Route to get all collections
        $this->add_route('exporter/all_collections_tainacan', [
            'methods' => 'GET',
            'callback' => [$this, 'get_all_collections'],
            'permission_callback' => [$this, 'permission_check_manage_mappers'],
        ]);

        // Route to get metadata collection
        $this->add_route('exporter/get_metadata_collection/(?P<collection_id>[a-zA-Z0-9_\-.]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_metadata_collection'],
            'permission_callback' => [$this, 'permission_check_manage_mappers'],
        ]);

        // Route to get mapper collection
        $this->add_route('exporter/get_mapper_process_type/(?P<process_model_id>[a-zA-Z0-9_\-.]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_mapper_process_type'],
            'permission_callback' => [$this, 'permission_check_manage_mappers'],
        ]);

         // Route to get items from collection
         $this->add_route('get_items_collection/(?P<collection_id>[a-zA-Z0-9_\-.]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_items_collection'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('exporter/save_mapping_data', [
            'methods'  => 'POST',
            'callback' => [$this, 'save_mapping_data'],
            'permission_callback' => [$this, 'permission_check_manage_mappers'],
        ]);

        $this->add_route('exporter/process/(?P<process_id>\d+)/input', [
            'methods' => 'GET',
            'callback' => [$this, 'get_process_export_input'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('exporter/process/(?P<process_id>\d+)/input-file', [
            'methods' => 'POST',
            'callback' => [$this, 'upload_process_export_input_file'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('exporter/process/(?P<process_id>\d+)/input', [
            'methods' => 'POST',
            'callback' => [$this, 'save_process_export_input'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('exporter/process/(?P<process_id>\d+)/runtime-config', [
            'methods' => 'GET',
            'callback' => [$this, 'get_runtime_config'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('exporter/process/(?P<process_id>\d+)/spreadsheet-template', [
            'methods' => 'GET',
            'callback' => [$this, 'get_process_spreadsheet_template'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('exporter/process/(?P<process_id>\d+)/manual-items', [
            'methods' => 'GET',
            'callback' => [$this, 'get_manual_items'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('exporter/process/(?P<process_id>\d+)/manual-items', [
            'methods' => 'POST',
            'callback' => [$this, 'save_manual_items'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('exporter/process/(?P<process_id>\d+)/execute', [
            'methods' => 'POST',
            'callback' => [$this, 'execute_process_export'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('exporter/process/(?P<process_id>\d+)/review', [
            'methods' => 'GET',
            'callback' => [$this, 'get_process_export_review'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('exporter/process/(?P<process_id>\d+)/decision', [
            'methods' => 'POST',
            'callback' => [$this, 'decide_process_export'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

    }

    public function get_all_collections() {
        $collections = $this->get_all_collection_names();
        
        return $collections;
    }

    function get_all_collection_names() {
        $collections_names = [];
        $collections = \Tainacan\Repositories\Collections::get_instance()->fetch([], 'OBJECT');
        
        foreach ($collections as $collection) {
            $collections_names[] = $collection;
        }

        return $collections_names;
    }   

    public function get_metadata_collection($request){

        $collection_id = sanitize_text_field($request['collection_id']);
    
        // Obtém a instância do repositório de metadados
        $metadata_repository = \Tainacan\Repositories\Metadata::get_instance();
    
        // Busca os metadados da coleção
        $metadata = $metadata_repository->fetch(
            [ 'collection_id' => $collection_id ],
            'OBJECT'
        );

        return $metadata;
    }

    public function get_mapper_process_type($request) {
        // Sanitiza o ID da coleção
        $process_model_id = (int) sanitize_text_field($request['process_model_id']);
        $meta_value       = get_post_meta($process_model_id, '_obatala_mapping_data', true);

        // Retorna o resultado (como array associativo)
        return [
            'mapping_data' => maybe_unserialize($meta_value),
        ];
    }


    public function get_items_collection($request) {
        $collection_id = sanitize_text_field($request['collection_id']);
        $selected_metadata_json = $request->get_param('selected_metadata');
        $mapper_type = $request->get_param('mapper_type');
        
        $items_repository = \Tainacan\Repositories\Items::get_instance();
        $items = $items_repository->fetch([
            'collection_id' => $collection_id,
            'posts_per_page' => -1
        ]);
                
        $metadados = [];

        foreach ($items->posts as $item) {
            $item_metadados = get_post_meta($item->ID);

            $metadados[] = $item_metadados;
        }

        return $this->export_xlsx($metadados, $selected_metadata_json, $mapper_type);
    }

    public function save_mapping_data($request) {
        $params = $request->get_json_params();

        $process_model_id = $params['process_model_id'] ?? null;
        $mappings         = $params['mappings'] ?? [];

        if (!$process_model_id || empty($mappings)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Dados incompletos.',
            ], 400);
        }

        $profile_selector_field_id = '';
        if (is_array($mappings) && isset($mappings['profile_selector_field_id'])) {
            $profile_selector_field_id = sanitize_text_field($mappings['profile_selector_field_id']);
        }
        $requested_mapper_status = $this->normalize_mapper_status(is_array($mappings) ? ($mappings['status'] ?? null) : null);
        $mapper_is_requested = $requested_mapper_status !== self::MAPPER_STATUS_DISABLED;

        $decision_rules_payload = [];
        if (is_array($mappings) && isset($mappings['decision_rules']) && is_array($mappings['decision_rules'])) {
            $decision_rules_payload = $mappings['decision_rules'];
        }

        $profiles = [];
        if (is_array($mappings) && isset($mappings['profiles']) && is_array($mappings['profiles'])) {
            $profiles = $mappings['profiles'];
        }

        if (!is_array($profiles)) {
            $profiles = [];
        }

        if ($mapper_is_requested && empty($profiles)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Cadastre ao menos uma coleção de exportação.',
                ], 400);
        }

        if (empty($decision_rules_payload)) {
            $decision_rules_payload = $this->extract_profile_decision_rules($profiles);
        }
        $decision_rules = $this->normalize_decision_rules($decision_rules_payload);

        if ($mapper_is_requested && $profile_selector_field_id === '') {
            $profile_selector_field_id = TainacanMappingService::DEFAULT_PROFILE_SELECTOR_FIELD_ID;
        }

        $has_data_entry_mode_field = !empty($decision_rules['data_entry_mode_field_id']);
        $has_spreadsheet_upload_field = !empty($decision_rules['spreadsheet_upload_field_id']);

        if ($mapper_is_requested && $has_data_entry_mode_field && !$has_spreadsheet_upload_field) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Selecione o campo de upload que receberá a planilha no passo 3.',
            ], 400);
        }

        $used_profile_keys = [];
        $used_collection_ids = [];
        $used_collection_names = [];
        $used_field_ids = [];
        $normalized_profiles = [];

        foreach ($profiles as $index => $profile) {
            if (!is_array($profile)) {
                continue;
            }

            $collection_id = isset($profile['collection_id']) ? (int) $profile['collection_id'] : 0;
            $field_mappings = isset($profile['field_mappings']) && is_array($profile['field_mappings'])
                ? $profile['field_mappings']
                : [];

            if ($mapper_is_requested && !$collection_id) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'Todas as configurações precisam ter uma coleção válida.',
                ], 400);
            }

            if ($mapper_is_requested && in_array($collection_id, $used_collection_ids, true)) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'Cada configuração deve apontar para uma coleção diferente.',
                ], 400);
            }

            $collection_post = $collection_id > 0 ? get_post($collection_id) : null;
            if ($mapper_is_requested && !$collection_post) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'Coleção de destino não encontrada para uma das configurações.',
                ], 404);
            }

            $collection_name = sanitize_text_field($profile['collection_name'] ?? '');
            if ($collection_name === '' && $collection_post) {
                $collection_name = sanitize_text_field(get_the_title($collection_post));
            }
            if ($collection_name === '') {
                $collection_name = $collection_id > 0
                    ? ('Coleção ' . $collection_id)
                    : ('Configuração ' . ($index + 1));
            }

            $normalized_collection_name = strtolower(remove_accents($collection_name));
            if ($mapper_is_requested && in_array($normalized_collection_name, $used_collection_names, true)) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'As coleções selecionadas precisam ter nomes diferentes para identificação na tramitação.',
                ], 400);
            }

            $profile_key_source = $profile['key'] ?? $collection_name ?? ('colecao_' . $collection_id);
            $profile_key = sanitize_key($profile_key_source);
            if ($profile_key === '') {
                $profile_key = 'colecao_' . $collection_id;
            }

            if (in_array($profile_key, $used_profile_keys, true)) {
                return new \WP_REST_Response([
                    'success' => false,
                    'message' => 'As chaves das configurações precisam ser únicas.',
                ], 400);
            }

            $normalized_field_mappings = [];
            $used_metadata_ids = [];
            foreach ($field_mappings as $mapping) {
                if (!is_array($mapping)) {
                    continue;
                }

                $obatala_field = is_array($mapping['obatala_field'] ?? null) ? $mapping['obatala_field'] : [];
                $field_id = isset($obatala_field['value']) ? sanitize_text_field($obatala_field['value']) : '';
                $metadata_id = isset($mapping['tainacan_metadata_id']) ? (int) $mapping['tainacan_metadata_id'] : 0;

                if ($mapper_is_requested && ($field_id === '' || !$metadata_id)) {
                    return new \WP_REST_Response([
                        'success' => false,
                        'message' => 'Todos os campos de todas as configurações devem estar mapeados corretamente.',
                    ], 400);
                }

                if ($field_id === '' || !$metadata_id) {
                    continue;
                }

                if (in_array($field_id, $used_field_ids, true)) {
                    return new \WP_REST_Response([
                        'success' => false,
                        'message' => 'Cada field do Obatala pode ser mapeado somente uma vez.',
                    ], 400);
                }

                if (in_array($metadata_id, $used_metadata_ids, true)) {
                    return new \WP_REST_Response([
                        'success' => false,
                        'message' => 'Cada metadado do Tainacan pode receber somente um field.',
                    ], 400);
                }

                $normalized_field_mappings[] = [
                    'obatala_field' => $obatala_field,
                    'tainacan_metadata_id' => $metadata_id,
                ];
                $used_field_ids[] = $field_id;
                $used_metadata_ids[] = $metadata_id;
            }

            $normalized_profiles[] = [
                'key' => $profile_key,
                'collection_id' => $collection_id,
                'collection_name' => $collection_name,
                'field_mappings' => $normalized_field_mappings,
            ];

            $used_profile_keys[] = $profile_key;
            $used_collection_ids[] = $collection_id;
            $used_collection_names[] = $normalized_collection_name;
        }

        $has_field_mappings = false;
        foreach ($normalized_profiles as $normalized_profile) {
            if (!empty($normalized_profile['field_mappings'])) {
                $has_field_mappings = true;
                break;
            }
        }
        $mapper_status = $requested_mapper_status === self::MAPPER_STATUS_DISABLED
            ? self::MAPPER_STATUS_DISABLED
            : ($has_field_mappings ? self::MAPPER_STATUS_ENABLED : self::MAPPER_STATUS_DRAFT);

        $data_to_save = [
            'schema_version' => 3,
            'process_model_id' => (int) $process_model_id,
            'mappings' => [
                'status' => $mapper_status,
                'profile_selector_field_id' => $profile_selector_field_id,
                'decision_rules' => $decision_rules,
                'profiles' => $normalized_profiles,
            ],
        ];

        $encoded_data = wp_json_encode($data_to_save, JSON_UNESCAPED_UNICODE);
        if ($encoded_data === false) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => __('Could not save the mapping.', 'obatala'),
                'details' => json_last_error_msg(),
            ], 500);
        }

        // update_post_meta() removes slashes before persisting. Protect the
        // escaped characters in the JSON so the stored value remains valid.
        $saved = update_post_meta(
            (int) $process_model_id,
            TainacanMappingService::MAPPING_META_KEY,
            wp_slash($encoded_data)
        );

        if ($saved === false) {
            // update_post_meta() also returns false when the value is unchanged.
            $current_data = get_post_meta((int) $process_model_id, TainacanMappingService::MAPPING_META_KEY, true);
            if ($current_data === $encoded_data) {
                return new \WP_REST_Response([
                    'success' => true,
                    'message' => 'Dados já estavam salvos.',
                    'saved_data' => $data_to_save,
                    'mapper_status' => $mapper_status,
                ], 200);
            }

            global $wpdb;
            if (!empty($wpdb->last_error)) {
                error_log(sprintf(
                    'Obatala: failed to save mapping for process model %d: %s',
                    (int) $process_model_id,
                    $wpdb->last_error
                ));
            }

            return new \WP_REST_Response([
                'success' => false,
                'message' => __('Could not save the mapping.', 'obatala'),
            ], 500);
        }


        return new \WP_REST_Response([
            'success' => true,
            'saved_data' => $data_to_save,
            'mapper_status' => $mapper_status,
            'message' => $mapper_status === self::MAPPER_STATUS_DRAFT
                ? 'Configuração salva como rascunho. Mapeie ao menos um field para ativar a exportação.'
                : 'Mapeamento salvo com sucesso.',
        ], 200);
    }

    public function permission_check_manage_mappers($request) {
        return is_user_logged_in() && current_user_can('obatala_manage_mappers');
    }

    public function get_process_export_input($request) {
        $process_id = (int) $request['process_id'];
        $service = $this->get_export_service();
        return new WP_REST_Response([
            'success' => true,
            'input' => $service->get_process_export_input($process_id),
            'runtime' => $service->get_runtime_config($process_id),
        ], 200);
    }

    public function save_process_export_input($request) {
        $process_id = (int) $request['process_id'];
        $params = $request->get_json_params();
        $input = is_array($params['input'] ?? null) ? $params['input'] : [];
        $result = $this->get_export_service()->save_process_export_input($process_id, $input);
        return new WP_REST_Response($result, !empty($result['success']) ? 200 : 400);
    }

    public function upload_process_export_input_file($request) {
        if (empty($_FILES['file'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Nenhum arquivo enviado.'], 400);
        }
        if (!function_exists('wp_handle_upload')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }
        $uploaded = wp_handle_upload($_FILES['file'], [
            'test_form' => false,
            'mimes' => [
                'csv' => 'text/csv',
                'xls' => 'application/vnd.ms-excel',
                'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
        ]);
        if (!empty($uploaded['error'])) {
            return new WP_REST_Response(['success' => false, 'message' => $uploaded['error']], 400);
        }

        $upload_dir = wp_upload_dir();
        $custom_dir = trailingslashit($upload_dir['basedir']) . 'obatala';
        if (!wp_mkdir_p($custom_dir)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Não foi possível preparar o diretório de upload.'], 500);
        }
        $file_name = sanitize_file_name(wp_basename($uploaded['file']));
        $target = trailingslashit($custom_dir) . $file_name;
        if (!@rename($uploaded['file'], $target)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Não foi possível armazenar a planilha.'], 500);
        }

        return new WP_REST_Response([
            'success' => true,
            'file_name' => $file_name,
            'message' => 'Planilha enviada com sucesso.',
        ], 200);
    }

    private function get_export_service() {
        return new TainacanExportService();
    }

    public function get_runtime_config($request) {
        $process_id = (int) $request['process_id'];
        $runtime = $this->get_export_service()->get_runtime_config($process_id);

        return new WP_REST_Response($runtime, 200);
    }

    public function get_process_spreadsheet_template($request) {
        $process_id = (int) $request['process_id'];
        $runtime = $this->get_export_service()->get_runtime_config($process_id);

        if (empty($runtime['enabled'])) {
            return new WP_REST_Response([
                'success' => false,
                'message' => (string) ($runtime['message'] ?? 'Mapeador não habilitado para este processo.'),
            ], 400);
        }

        $mapped_fields = is_array($runtime['mapped_fields'] ?? null) ? $runtime['mapped_fields'] : [];
        if (empty($mapped_fields)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Nenhum campo mapeado foi encontrado para gerar a planilha modelo.',
            ], 400);
        }

        $headers = [];
        $example_row = [];
        $used_headers = [];

        foreach ($mapped_fields as $index => $mapped_field) {
            if (!is_array($mapped_field)) {
                continue;
            }

            $header_label = sanitize_text_field((string) ($mapped_field['obatala_field_label'] ?? ''));
            if ($header_label === '') {
                $header_label = sanitize_text_field((string) ($mapped_field['tainacan_metadata_name'] ?? ''));
            }
            if ($header_label === '') {
                $header_label = 'Campo ' . ((int) $index + 1);
            }

            $unique_header = $this->build_unique_header_label($header_label, $used_headers);
            $headers[] = $unique_header;
            $example_row[] = $this->build_spreadsheet_example_value($mapped_field, $index);
        }

        if (empty($headers)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Não foi possível preparar os cabeçalhos da planilha modelo.',
            ], 400);
        }

        $stream = fopen('php://temp', 'r+');
        if ($stream === false) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Não foi possível gerar o arquivo de planilha modelo.',
            ], 500);
        }

        fputcsv($stream, $headers, ';');
        fputcsv($stream, $example_row, ';');
        rewind($stream);
        $csv_content = stream_get_contents($stream);
        fclose($stream);

        if ($csv_content === false) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Não foi possível ler o conteúdo da planilha modelo.',
            ], 500);
        }

        $filename = sprintf(
            'modelo-exportacao-processo-%d-%s.csv',
            $process_id,
            date('Ymd-His')
        );

        return new WP_REST_Response([
            'success' => true,
            'filename' => sanitize_file_name($filename),
            'mime_type' => 'text/csv;charset=utf-8',
            'file' => base64_encode("\xEF\xBB\xBF" . $csv_content),
            'message' => 'Planilha modelo gerada com sucesso.',
        ], 200);
    }

    public function get_manual_items($request) {
        $process_id = (int) $request['process_id'];
        $runtime = $this->get_export_service()->get_runtime_config($process_id);

        return new WP_REST_Response([
            'success' => true,
            'manual_items' => is_array($runtime['manual_items'] ?? null) ? $runtime['manual_items'] : [],
            'runtime' => $runtime,
        ], 200);
    }

    public function save_manual_items($request) {
        $process_id = (int) $request['process_id'];
        $rows = [];
        $json_params = $request->get_json_params();

        if (is_array($json_params) && array_key_exists('rows', $json_params)) {
            $rows = $json_params['rows'];
        } else {
            $raw_rows = $request->get_param('rows');

            if (is_string($raw_rows)) {
                $decoded_rows = json_decode($raw_rows, true);
                $rows = is_array($decoded_rows) ? $decoded_rows : [];
            } elseif (is_array($raw_rows)) {
                $rows = $raw_rows;
            }
        }

        $result = $this->get_export_service()->save_manual_items($process_id, $rows);
        $status_code = !empty($result['success']) ? 200 : 400;

        return new WP_REST_Response($result, $status_code);
    }

    public function execute_process_export($request) {
        $process_id = (int) $request['process_id'];
        $params = $request->get_json_params();
        $force = !empty($params['force']);

        $result = $this->get_export_service()->execute_export($process_id, $force);
        $status_code = ($result['status'] ?? 'error') === 'error' ? 400 : 200;

        return new WP_REST_Response($result, $status_code);
    }

    public function get_process_export_review($request) {
        $process_id = (int) $request['process_id'];
        $preview_limit = (int) $request->get_param('preview_limit');
        if ($preview_limit <= 0) {
            $preview_limit = 20;
        }

        $result = $this->get_export_service()->get_export_review_data($process_id, $preview_limit);
        return new WP_REST_Response($result, 200);
    }

    public function decide_process_export($request) {
        $process_id = (int) $request['process_id'];
        $params = $request->get_json_params();
        $decision = sanitize_text_field($params['decision'] ?? '');
        $force = !empty($params['force']);

        $result = $this->get_export_service()->decide_export($process_id, $decision, $force);
        $status_code = !empty($result['success']) ? 200 : 400;

        return new WP_REST_Response($result, $status_code);
    }

    private function extract_profile_decision_rules(array $profiles) {
        foreach ($profiles as $profile) {
            if (is_array($profile) && isset($profile['decision_rules']) && is_array($profile['decision_rules'])) {
                return $profile['decision_rules'];
            }
        }

        return [];
    }

    private function normalize_decision_rules(array $rules) {
        $normalized = self::DEFAULT_DECISION_RULES;

        foreach (self::DEFAULT_DECISION_RULES as $key => $default_value) {
            if (array_key_exists($key, $rules) && $rules[$key] !== null) {
                $normalized[$key] = (string) $rules[$key];
            }
        }

        return $normalized;
    }

    private function normalize_mapper_status($status) {
        $normalized = strtolower(trim((string) $status));
        if ($normalized === self::MAPPER_STATUS_ENABLED || $normalized === 'habilitado') {
            return self::MAPPER_STATUS_ENABLED;
        }
        if ($normalized === self::MAPPER_STATUS_DRAFT || $normalized === 'rascunho') {
            return self::MAPPER_STATUS_DRAFT;
        }
        return self::MAPPER_STATUS_DISABLED;
    }

    private function build_unique_header_label($header_label, array &$used_headers) {
        $base_label = trim((string) $header_label);
        if ($base_label === '') {
            $base_label = 'Metadado';
        }

        $candidate = $base_label;
        $counter = 2;
        $normalized_candidate = strtolower(remove_accents($candidate));

        while (in_array($normalized_candidate, $used_headers, true)) {
            $candidate = sprintf('%s (%d)', $base_label, $counter);
            $normalized_candidate = strtolower(remove_accents($candidate));
            $counter++;
        }

        $used_headers[] = $normalized_candidate;

        return $candidate;
    }

    private function build_spreadsheet_example_value(array $mapped_field, $index = 0) {
        $field_type = strtolower((string) ($mapped_field['obatala_field_type'] ?? 'text'));
        $field_config = is_array($mapped_field['obatala_field_config'] ?? null)
            ? $mapped_field['obatala_field_config']
            : [];

        $option_value = $this->extract_first_option_value($field_config);
        $position = ((int) $index) + 1;

        switch ($field_type) {
            case 'number':
                return (string) $position;
            case 'email':
                return 'item' . $position . '@exemplo.com';
            case 'phone':
                return '8599999000' . (($position % 9) + 1);
            case 'datepicker':
                return current_time('d/m/Y');
            case 'radio':
            case 'select':
                return $option_value !== '' ? $option_value : ('Opção ' . $position);
            case 'upload':
                return 'arquivo_exemplo.pdf';
            default:
                return 'Exemplo ' . $position;
        }
    }

    private function extract_first_option_value(array $field_config) {
        $raw_options = trim((string) ($field_config['options'] ?? ''));
        if ($raw_options === '') {
            return '';
        }

        $options = array_map('trim', explode(',', $raw_options));
        foreach ($options as $option) {
            if ($option !== '') {
                return $option;
            }
        }

        return '';
    }

}
