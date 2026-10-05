<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

use WP_Error;
use WP_REST_Response;
use Obatala\Entities\Sector;
use Obatala\Services\TainacanMappingService;
use Obatala\Services\ProcessTypeValidationService;

class ProcessTypeApi extends ObatalaAPI {

    /** @var bool */
    private static $flow_title_validation_filter_registered = false;

    public function register_routes() {
        if (!self::$flow_title_validation_filter_registered) {
            add_filter('rest_pre_insert_process_type', [self::class, 'filter_rest_validate_activation'], 10, 2);
            self::$flow_title_validation_filter_registered = true;
        }
        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [$this, 'get_meta'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_access'],
        ]);

        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_manage_models'],
            'args' => $this->get_meta_args(),
        ]);

        $this->add_route('process_type/(?P<id>\d+)/fields', [
            'methods' => 'GET',
            'callback' => [$this, 'get_fields'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_access'],
        ]);

        // Rota para associar e gerenciar histórico de setores das etapas
        $this->add_route('process_type/(?P<id>\d+)/assosiate_sector', [
            'methods' => 'POST',
            'callback' => [$this, 'assosiate_sector'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_manage_models'],
            'args' => [
                'sector_id' => [
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return is_string($param);
                    }
                ],
                'node_id' => [
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return !empty($param) && is_string($param);
                    }
                ]
            ]
        ]);

        $this->add_route('process_type/(?P<id>\d+)/get_node', [
            'methods' => 'GET',
            'callback' => [$this, 'get_node'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_process_access'],
        ]);

        $this->add_route('process_type/upload', [
            'methods' => 'POST',
            'callback' => [$this, 'upload'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_stage_action'],
        ]);

        $this->add_route('process_type/download', [
            'methods' => 'GET',
            'callback' => [$this, 'download'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_process_access'],
        ]);
    }

    protected function get_meta_args() {
        return [
            'accept_attachments' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_bool($param);
                },
                'sanitize_callback' => 'rest_sanitize_boolean',
            ],
            'accept_tainacan_items' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_bool($param);
                },
                'sanitize_callback' => 'rest_sanitize_boolean',
            ],
            'generate_tainacan_items' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_bool($param);
                },
                'sanitize_callback' => 'rest_sanitize_boolean',
            ],
            'description' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_string($param);
                },
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'status' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return in_array($param, ['Draft', 'Active', 'Inactive'], true);
                },
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'step_order' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_array($param);
                },
                'sanitize_callback' => function ($param) {
                    return array_map('sanitize_text_field', $param);
                },
            ],
            'flowData' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_array($param['nodes']) && is_array($param['edges']);
                },
                'sanitize_callback' => function ($param) {
                    return json_encode($param);  // Salvando como JSON
                },
            ],
        ];
    }

    public function get_meta($request) {
        $post_id = (int) $request['id'];

        $flowData = get_post_meta($post_id, 'flowData', true);

        // Decodificar JSON se for uma string
        if (is_string($flowData)) {
            $flowData = json_decode($flowData, true);
        }

        $mapping_service = new TainacanMappingService();
        $flowData = is_array($flowData)
            ? $mapping_service->apply_profile_options_to_flow_data($post_id, $flowData)
            : [];

        $meta = [
            'accept_attachments' => (bool) get_post_meta($post_id, 'accept_attachments', true),
            'accept_tainacan_items' => (bool) get_post_meta($post_id, 'accept_tainacan_items', true),
            'generate_tainacan_items' => (bool) get_post_meta($post_id, 'generate_tainacan_items', true),
            'description' => get_post_meta($post_id, 'description', true) ?: '',
            'status' => get_post_meta($post_id, 'status', true) ?: '',
            'step_order' => get_post_meta($post_id, 'step_order', true) ?: [],
            'flowData' => $flowData ?: [],
            'tainacan_export_mapping' => $mapping_service->build_process_mapping_snapshot($post_id),
        ];
        return rest_ensure_response($meta);
    }

    public function get_fields($request) {
        $post_id = (int) $request['id'];

        $flowData = get_post_meta($post_id, 'flowData', true);

        // Decodificar JSON se for uma string
        if (is_string($flowData)) {
            $flowData = json_decode($flowData, true);
        }

        // Verifica se existe o índice 'nodes' e se é um array
        if (is_array($flowData) && isset($flowData['nodes']) && is_array($flowData['nodes'])) {
            // Filtra os nodes que não possuem 'Start', 'End' ou 'Condicional' no id
            $filteredNodes = array_filter($flowData['nodes'], function ($node) {
                if (!isset($node['id']) || !is_string($node['id'])) {
                    return true;
                }

                return !(
                    str_contains($node['id'], 'Start') ||
                    str_contains($node['id'], 'End') ||
                    str_contains($node['id'], 'Condicional')
                );
            });

            // Array final para armazenar todos os fields
            $allFields = [];

            // Percorre os nodes filtrados e extrai os fields
            foreach ($filteredNodes as $node) {
                if (
                    isset($node['data']) &&
                    is_array($node['data']) &&
                    isset($node['data']['fields']) &&
                    is_array($node['data']['fields'])
                ) {
                     foreach ($node['data']['fields'] as $field) {
                        // Adiciona o campo 'stage' com o id do node
                        $field['stage'] = $node['id'];
                        $allFields[] = $field;
                    }
                }
            }

            return rest_ensure_response($allFields);
        }

        // Retorna vazio se não houver nodes válidos
        return rest_ensure_response([]);
}

    /**
     * Prevents a process model from becoming active while its flow is incomplete.
     *
     * @param \WP_Post|\WP_Error $prepared_post
     * @param \WP_REST_Request   $request
     * @return \WP_Post|\WP_Error
     */
    public static function filter_rest_validate_activation($prepared_post, $request) {
        if (is_wp_error($prepared_post)) {
            return $prepared_post;
        }

        $is_creation = strtoupper((string) $request->get_method()) === 'POST'
            && empty($prepared_post->ID);
        if ($is_creation && !self::has_registered_sectors()) {
            return new WP_Error(
                'obatala_process_model_requires_sector',
                __('Não é possível criar um modelo de processo sem existir grupos cadastrados.', 'obatala'),
                ['status' => 400]
            );
        }

        $meta = $request->get_param('meta');
        $meta = is_array($meta) ? $meta : [];
        $post_id = isset($prepared_post->ID) ? (int) $prepared_post->ID : 0;
        $status = isset($meta['status'])
            ? (string) $meta['status']
            : ($post_id > 0 ? (string) get_post_meta($post_id, 'status', true) : 'Draft');
        if ($status === 'Active') {
            $flow_data = isset($meta['flowData'])
                ? $meta['flowData']
                : get_post_meta($post_id, 'flowData', true);
            $validation = ProcessTypeValidationService::validate_for_activation($flow_data);
            if (is_wp_error($validation)) {
                return $validation;
            }
        }
        return $prepared_post;
    }

    private static function has_registered_sectors() {
        $sectors = json_decode((string) get_option('obatala_setores', '{}'), true);

        return is_array($sectors) && !empty($sectors);
    }

    public function update_meta($request) {
        $post_id = (int) $request['id'];

        $requested_status = isset($request['status'])
            ? sanitize_text_field((string) $request['status'])
            : (string) get_post_meta($post_id, 'status', true);
        $candidate_flow_data = isset($request['flowData'])
            ? $request['flowData']
            : get_post_meta($post_id, 'flowData', true);

        if ($requested_status === 'Active') {
            $validation = ProcessTypeValidationService::validate_for_activation($candidate_flow_data);
            if (is_wp_error($validation)) {
                return $validation;
            }
        }

        $meta_keys = [
            'accept_attachments',
            'accept_tainacan_items',
            'generate_tainacan_items',
            'description',
            'status',
            'updateAt',
            'user',
            'step_order',
            'flowData',
        ];

        foreach ($meta_keys as $key) {
            if (isset($request[$key])) {
                // Verificar se o campo flowData está vindo como string e decodificá-lo
                if ($key === 'flowData' && is_string($request[$key])) {
                    $flowData = json_decode($request[$key], true);
                    if ($flowData) {
                        update_post_meta($post_id, $key, $flowData); // Armazena como array
                    }
                } elseif ($key === 'flowData' && is_array($request[$key])) {
                    update_post_meta($post_id, $key, $request[$key]);
                } else {
                    update_post_meta($post_id, $key, $request[$key]);
                }
            }
        }

        return rest_ensure_response([
            'success' => true,
        ]);
    }

    public function assosiate_sector($request) {
        // Obter os parâmetros do request
        $process_id = (int) $request['id'];
        $sector_id = sanitize_text_field($request['sector_id']);
        $node_id = sanitize_text_field($request['node_id']);

        // Verificar se o processo existe
        $process = get_post($process_id);
        if (!$process || $process->post_type !== 'process_type') {
            return new WP_Error(
                'obatala_invalid_process_type',
                __('Process not found.', 'obatala'),
                ['status' => 404]
            );
        }

        // Obter os dados do flowData do processo
        $flow_data = get_post_meta($process_id, 'flowData', true);

        // Verificar se o flowData está configurado corretamente
        if (!isset($flow_data['nodes']) || !is_array($flow_data['nodes'])) {
            return new WP_Error(
                'obatala_invalid_flow_data',
                __('Error saving process model.', 'obatala'),
                ['status' => 400]
            );
        }

        // Procurar o nó correspondente ao node_id fornecido
        $node_key = array_search($node_id, array_column($flow_data['nodes'], 'id'));
        if ($node_key === false) {
            return new WP_Error(
                'obatala_node_not_found',
                __('Step not found.', 'obatala'),
                ['status' => 404]
            );
        }

        // Adicionar o setor ao histórico da etapa (node)
        if (!isset($flow_data['nodes'][$node_key]['sector_history'])) {
            $flow_data['nodes'][$node_key]['sector_history'] = [];
        }

        // Atualizar o sector_obatala associado etapa
        $flow_data['nodes'][$node_key]['sector_obatala'] = $sector_id;

        // Adicionar o novo setor ao histórico sem deixar duplicatas
        if (!in_array($sector_id, $flow_data['nodes'][$node_key]['sector_history'])) {
            $flow_data['nodes'][$node_key]['sector_history'][] = $sector_id;
        }

        // Atualizar o flowData com o novo histórico
        $updated = update_post_meta($process_id, 'flowData', $flow_data);

        // update_post_meta() also returns false when the stored value is unchanged.
        if (!$updated && get_post_meta($process_id, 'flowData', true) !== $flow_data) {
            return new WP_Error(
                'obatala_sector_association_failed',
                __('Error saving process model.', 'obatala'),
                ['status' => 500]
            );
        }

        return rest_ensure_response([
            'success' => true,
            'node_id' => $node_id,
            'sector_id' => $sector_id,
        ]);
    }

    public function get_node($request) {
        $process_id = $request['id'];
        $user_id = get_current_user_id();
        $permission = Sector::check_permission($user_id, $process_id);

        // Obter os dados do flowData do processo
        $flow_data = get_post_meta($process_id, 'flowData', true);
        $sector_names = $this->get_process_sector_names($flow_data);

        $access_level = get_post_meta($process_id, 'access_level', true);

        if ($access_level === 'private') {
            if ($permission['status'] === true) {
                return new WP_REST_Response([
                    'data' => $flow_data,
                    'status' => true,
                    'data_sector' => $permission['data_sector'] ?? [],
                    'sector_names' => $sector_names,
                ], 200);
            }
            return new WP_REST_Response($permission['message'], 403);
        } else {
            return new WP_REST_Response([
                'data' => $flow_data,
                'status' => $permission['status'],
                'message' => $permission['message'],
                'data_sector' => $permission['data_sector'] ?? [],
                'sector_names' => $sector_names,
            ], 200);
        }
    }

    private function get_process_sector_names($flow_data) {
        if (!is_array($flow_data)) {
            return [];
        }

        $configured_sectors = json_decode((string) get_option('obatala_setores', '{}'), true);
        $configured_sectors = is_array($configured_sectors) ? $configured_sectors : [];
        $sector_names = [];

        foreach (($flow_data['nodes'] ?? []) as $node) {
            $sector_id = (string) ($node['sector_obatala'] ?? $node['tempSector'] ?? '');
            if ($sector_id === '' || !isset($configured_sectors[$sector_id])) {
                continue;
            }
            $sector_names[$sector_id] = sanitize_text_field(
                (string) ($configured_sectors[$sector_id]['nome'] ?? '')
            );
        }

        return $sector_names;
    }

    public function upload($request) {
        if ( ! isset( $_SERVER['HTTP_X_WP_NONCE'] ) 
            || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_WP_NONCE'] ) ), 'wp_rest' ) ) {
            return new WP_REST_Response( [
                'error' => 'Nonce inválido ou ausente',
            ], 403 );
        }

        $process_id = $request['id'];
        $node_id = sanitize_text_field($request['node_id']);
        
        // Carregar a função wp_handle_upload, se necessário
        if (!function_exists('wp_handle_upload')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }

        // Verificar se o arquivo foi enviado
        if (empty($_FILES['file'])) {
            return new WP_REST_Response([
                'error' => 'Nenhum arquivo enviado',
            ], 400);
        }

        $overrides = [
            'test_form' => false,
            'mimes' => [
                'doc' => 'application/msword',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'pdf' => 'application/pdf',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'csv' => 'text/csv',
                'xls' => 'application/vnd.ms-excel',
                'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
        ];

        // Diretório de upload personalizado
        $upload_dir = wp_upload_dir();
        $custom_dir = trailingslashit($upload_dir['basedir']) . 'obatala';

        // Criar o diretório, se necessário
        if (!wp_mkdir_p($custom_dir)) {
            return new WP_REST_Response([
                'error' => 'Não foi possível criar o diretório de upload personalizado.',
            ], 500);
        }

        // Configurar o arquivo .htaccess para proteção
        $htaccess_path = $custom_dir . '/.htaccess';
        if (!file_exists($htaccess_path)) {
            $htaccess_content  = "<IfModule mod_rewrite.c>\n";
            $htaccess_content .= "    RewriteEngine On\n\n";
            $htaccess_content .= "    # Bloquear acesso direto ao diretório e redirecionar ao WordPress\n";
            $htaccess_content .= "    RewriteCond %{REQUEST_FILENAME} -f\n";
            $htaccess_content .= "    RewriteRule ^ - [F]\n";
            $htaccess_content .= "</IfModule>\n";

            if (file_put_contents($htaccess_path, $htaccess_content) === false) {
                return new WP_REST_Response([
                    'error' => 'Erro ao criar o arquivo .htaccess no diretório de upload.',
                ], 500);
            }
        }

        // Fazer upload do arquivo
        $uploaded_file = wp_handle_upload($_FILES['file'], $overrides);

        if (isset($uploaded_file['error'])) {
            return new WP_REST_Response([
                'error' => $uploaded_file['error'],
            ], 500);
        }

        // Inicializar o WP_Filesystem
        if ( ! function_exists( 'request_filesystem_credentials' ) ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }

        WP_Filesystem();
        global $wp_filesystem;

        if ( ! $wp_filesystem ) {
            return new WP_REST_Response([
                'error' => 'Não foi possível inicializar o sistema de arquivos.',
            ], 500);
        }

        if ( ! isset( $_FILES['file']['name'] ) ) {
            return new WP_REST_Response( [
                'error' => 'Nome do arquivo não encontrado.',
            ], 400 );
        }

        $filename       = sanitize_file_name( $_FILES['file']['name'] );
        $new_file_path  = trailingslashit( $custom_dir ) . $filename;
        $upload_path    = $uploaded_file['file'];

        // Verificar se o arquivo existe antes de mover
        if ( ! $wp_filesystem->exists( $upload_path ) ) {
            return new WP_REST_Response([
                'error' => 'Arquivo de upload não encontrado.',
            ], 500);
        }

        // Tentar mover o arquivo para o diretório personalizado
        if ( ! $wp_filesystem->move( $upload_path, $new_file_path, true ) ) {
            return new WP_REST_Response([
                'error' => 'Erro ao salvar o arquivo no diretório personalizado.',
            ], 500);
        }

        // Obter os dados do flowData do processo
        $flow_data = get_post_meta($process_id, 'flowData', true);

        // Verificar se o flowData está configurado corretamente
        if (!isset($flow_data['nodes']) || !is_array($flow_data['nodes'])) {
            return new WP_REST_Response('Os dados do fluxo não estão configurados corretamente', 400);
        }

        // Procurar o nó correspondente ao node_id fornecido
        $node_key = array_search($node_id, array_column($flow_data['nodes'], 'id'));
        if ($node_key === false) {
            return new WP_REST_Response('Nó não encontrado nos dados do fluxo', 404);
        }

        // Adicionar o file
        if (!isset($flow_data['nodes'][$node_key]['file'])) {
            $flow_data['nodes'][$node_key]['file'] = [];
        }

        // Adicionar o novo setor ao histórico sem deixar duplicatas
        if (!in_array(basename($new_file_path), $flow_data['nodes'][$node_key]['file'])) {
            $flow_data['nodes'][$node_key]['file'][] = basename($new_file_path);
        }

        // Atualizar o flowData com o novo histórico
        update_post_meta($process_id, 'flowData', $flow_data);

        // Retornar sucesso com o caminho do arquivo
        return new WP_REST_Response([
            'success' => true,
            'message' => 'Arquivo enviado com sucesso.',
            'file_path' => $new_file_path,
            'file_name' => $filename
        ], 200);
    }

    public function download($request) {
        $process_id = intval($request['id']);
        $user_id = get_current_user_id();
        $file_name = sanitize_file_name($request->get_param('file'));
    
        // Verificar permissão
        $permission = Sector::check_permission($user_id, $process_id);

        if (!$permission['status']) {
            return new WP_REST_Response(
                [
                    'error' => 'Permissao negada',
                    'status' => $permission['message']
                ],
                403
            );
        }

        $flow_data = maybe_unserialize(get_post_meta($process_id, 'flowData', true));
        $process_files = [];
        foreach ((array) ($flow_data['nodes'] ?? []) as $node) {
            if (!empty($node['file']) && is_array($node['file'])) {
                $process_files = array_merge($process_files, array_map('sanitize_file_name', $node['file']));
            }
        }
        if (!in_array($file_name, $process_files, true)) {
            return new WP_REST_Response(['error' => 'Arquivo não encontrado'], 404);
        }
    
        // Caminho do arquivo
        $upload_dir = wp_upload_dir();
        $custom_dir = trailingslashit($upload_dir['basedir']) . 'obatala';
        $file_path = trailingslashit($custom_dir) . $file_name;
    
        if (!file_exists($file_path)) {
            return new WP_REST_Response(
                ['error' => 'Arquivo não encontrado'],
                404
            );
        }    
        // Usar a função wp_send_file para forçar o download
        return $this->wp_send_file($file_path);
    }
    
    private function wp_send_file($file_path) {
        // Inicializa o sistema de arquivos do WordPress
        global $wp_filesystem;
        
        if (!function_exists('WP_Filesystem')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }
        
        $initialized = WP_Filesystem();
        
        if (!$initialized || !is_object($wp_filesystem)) {
            wp_die(esc_html__('Falha ao inicializar o sistema de arquivos do WordPress', 'obatala'));
        }
        
        // Verifica se o arquivo existe
        if (!$wp_filesystem->exists($file_path)) {
            wp_die(esc_html__('Arquivo não encontrado', 'obatala'));
        }
        
        // Obtém o nome do arquivo seguro para saída
        $filename = basename($file_path);
        $filename = sanitize_file_name($filename);
        $disposition = sprintf('attachment; filename="%s"', esc_attr($filename));
        
        // Força o download do arquivo com saída escapada
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: ' . $disposition);
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . absint($wp_filesystem->size($file_path)));
        
        // Limpar buffers de saída antes de enviar o arquivo
        ob_clean();
        flush();
        
        // Ler e enviar o arquivo com verificação
        $file_contents = $wp_filesystem->get_contents($file_path);
        if ($file_contents !== false) {
            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
            echo $file_contents; // Binário não deve ser escapado
        }
        exit;
    }
}
