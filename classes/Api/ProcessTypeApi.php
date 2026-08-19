<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

use WP_Error;
use WP_REST_Response;
use Obatala\Entities\Sector;
use Obatala\Services\TainacanMappingService;

class ProcessTypeApi extends ObatalaAPI {

    /** @var bool */
    private static $flow_title_validation_filter_registered = false;

    public function register_routes() {
        if (!self::$flow_title_validation_filter_registered) {
            add_filter('rest_pre_insert_process_type', [self::class, 'filter_rest_validate_flow_field_titles'], 10, 2);
            self::$flow_title_validation_filter_registered = true;
        }
        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [$this, 'get_meta'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
            'args' => $this->get_meta_args(),
        ]);

        $this->add_route('process_type/(?P<id>\d+)/fields', [
            'methods' => 'GET',
            'callback' => [$this, 'get_fields'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        // Rota para associar e gerenciar histórico de setores das etapas
        $this->add_route('process_type/(?P<id>\d+)/assosiate_sector', [
            'methods' => 'POST',
            'callback' => [$this, 'assosiate_sector'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
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
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'], // Ajuste conforme necessário
        ]);

        $this->add_route('process_type/upload', [
            'methods' => 'POST',
            'callback' => [$this, 'upload'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('process_type/download', [
            'methods' => 'GET',
            'callback' => [$this, 'download'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
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
     * REST: block saving process_type when meta.flowData has fields without a valid title.
     *
     * @param \WP_Post|\WP_Error $prepared_post
     * @param \WP_REST_Request   $request
     * @return \WP_Post|\WP_Error
     */
    public static function filter_rest_validate_flow_field_titles($prepared_post, $request) {
        if (is_wp_error($prepared_post)) {
            return $prepared_post;
        }
        $meta = $request->get_param('meta');
        if (empty($meta['flowData']) || !is_array($meta['flowData'])) {
            return $prepared_post;
        }
        $err = self::validate_flow_field_titles($meta['flowData']);
        if (is_string($err) && $err !== '') {
            return new WP_Error(
                'obatala_field_without_title',
                $err,
                ['status' => 400]
            );
        }
        return $prepared_post;
    }

    /**
     * Ensures every field in custom steps has a non-empty title (not the default placeholder).
     *
     * @param array $flow_data flowData structure with nodes/edges.
     * @return string|null Error message or null if valid.
     */
    private static function validate_flow_field_titles(array $flow_data) {
        $default_untitled = 'Campo sem título';
        if (empty($flow_data['nodes']) || !is_array($flow_data['nodes'])) {
            return null;
        }
        $problems = [];
        $duplicates = [];
        foreach ($flow_data['nodes'] as $node) {
            $node_id = isset($node['id']) ? (string) $node['id'] : '';
            if ($node_id === 'Start' || $node_id === 'End' || strpos($node_id, 'Condicional') === 0) {
                continue;
            }
            $fields = $node['data']['fields'] ?? null;
            if (!is_array($fields)) {
                continue;
            }
            $stage_name = isset($node['data']['stageName']) ? (string) $node['data']['stageName'] : $node_id;
            $seen_labels = [];
            foreach ($fields as $field_index => $field) {
                if (!is_array($field)) {
                    continue;
                }
                $label = '';
                if (isset($field['config']['label']) && is_string($field['config']['label']) && trim($field['config']['label']) !== '') {
                    $label = trim($field['config']['label']);
                } else {
                    $label = isset($field['title']) ? trim((string) $field['title']) : '';
                }
                if ($label === '' || $label === $default_untitled) {
                    $problems[] = [
                        'stage' => $stage_name,
                        'position' => (int) $field_index + 1,
                    ];
                    continue;
                }

                $normalized_label = strtolower(remove_accents($label));
                if (isset($seen_labels[$normalized_label])) {
                    $duplicates[$stage_name . "\0" . $normalized_label] = [
                        'stage' => $stage_name,
                        'label' => $label,
                    ];
                }
                $seen_labels[$normalized_label] = true;
            }
        }
        if (!empty($problems)) {
            $parts = [];
            foreach ($problems as $p) {
                $parts[] = sprintf(
                    /* translators: 1: step name, 2: field position within the step */
                    __('%1$s (field %2$d)', 'obatala'),
                    $p['stage'],
                    $p['position']
                );
            }
            return sprintf(
                /* translators: %s: semicolon-separated list, e.g. "Step A (field 1); Step B (field 2)" */
                __('Some fields have an empty or default name. Check: %s', 'obatala'),
                implode('; ', $parts)
            );
        }

        if (!empty($duplicates)) {
            $parts = array_map(function ($duplicate) {
                return $duplicate['stage'] . ': ' . $duplicate['label'];
            }, array_values($duplicates));

            return sprintf(
                __('Field names must be unique within each step. Check: %s', 'obatala'),
                implode('; ', $parts)
            );
        }

        return null;
    }

    public function update_meta($request) {
        $post_id = (int) $request['id'];

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
                        $title_err = self::validate_flow_field_titles($flowData);
                        if (is_string($title_err) && $title_err !== '') {
                            return new WP_Error(
                                'obatala_field_without_title',
                                $title_err,
                                ['status' => 400]
                            );
                        }
                        update_post_meta($post_id, $key, $flowData); // Armazena como array
                    }
                } elseif ($key === 'flowData' && is_array($request[$key])) {
                    $title_err = self::validate_flow_field_titles($request[$key]);
                    if (is_string($title_err) && $title_err !== '') {
                        return new WP_Error(
                            'obatala_field_without_title',
                            $title_err,
                            ['status' => 400]
                        );
                    }
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
            return new WP_REST_Response('Processo não encontrado ou tipo de processo inválido', 404);
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

        // Verificar se a atualização foi bem-sucedida
        if ($updated) {
            return new WP_REST_Response('Setor associado com sucesso', 200);
        } else {
            return new WP_REST_Response('Erro ao associar o setor', 500);
        }
    }

    public function get_node($request) {
        $process_id = $request['id'];
        $user_id = $request->get_param('user');
        $permission = Sector::check_permission($user_id, $process_id);

        // Obter os dados do flowData do processo
        $flow_data = get_post_meta($process_id, 'flowData', true);

        $access_level = get_post_meta($process_id, 'access_level', true);

        if ($access_level === 'private') {
            if ($permission['status'] === true) {
                return new WP_REST_Response([
                    'data' => $flow_data,
                    'status' => true,
                    'data_sector' => $permission['data_sector'] ?? []
                ], 200);
            }
            return new WP_REST_Response($permission['message'], 403);
        } else {
            return new WP_REST_Response([
                'data' => $flow_data,
                'status' => $permission['status'],
                'message' => $permission['message'],
                'data_sector' => $permission['data_sector'] ?? []
            ], 200);
        }
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
        $user_id = intval($request->get_param('user'));
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
