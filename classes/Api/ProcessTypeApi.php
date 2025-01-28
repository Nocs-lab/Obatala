<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

use WP_REST_Response;
use Obatala\Entities\Sector;

class ProcessTypeApi extends ObatalaAPI {



    public function register_routes() {
        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [$this, 'get_meta'],
            'permission_callback' => '__return_true',
        ]);

        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => '__return_true',
            'args' => $this->get_meta_args(),
        ]);

        // Rota para associar e gerenciar histórico de setores das etapas
        $this->add_route('process_type/(?P<id>\d+)/assosiate_sector', [
            'methods' => 'POST',
            'callback' => [$this, 'assosiate_sector'],
            'permission_callback' => '__return_true',
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
            'permission_callback' => '__return_true', // Ajuste conforme necessário
        ]);

        $this->add_route('process_type/upload', [
            'methods' => 'POST',
            'callback' => [$this, 'upload'],
            'permission_callback' => '__return_true',
        ]);

        $this->add_route('process_type/download', [
            'methods' => 'GET',
            'callback' => [$this, 'download'],
            'permission_callback' => '__return_true',
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

        $meta = [
            'accept_attachments' => (bool) get_post_meta($post_id, 'accept_attachments', true),
            'accept_tainacan_items' => (bool) get_post_meta($post_id, 'accept_tainacan_items', true),
            'generate_tainacan_items' => (bool) get_post_meta($post_id, 'generate_tainacan_items', true),
            'description' => get_post_meta($post_id, 'description', true) ?: '',
            'status' => get_post_meta($post_id, 'status', true) ?: '',
            'step_order' => get_post_meta($post_id, 'step_order', true) ?: [],
            'flowData' => $flowData ?: [],
        ];
        return rest_ensure_response($meta);
    }

    public function update_meta($request) {
        $post_id = (int) $request['id'];

        $meta_keys = [
            'accept_attachments',
            'accept_tainacan_items',
            'generate_tainacan_items',
            'description',
            'status',
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
                } else {
                    update_post_meta($post_id, $key, $request[$key]);
                }
            }
        }

        return rest_ensure_response('Meta updated successfully.');
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
                    'data_sector' => $permission['data_sector']
                ], 200);
            }
            return new WP_REST_Response($permission['message'], 403);
        } else {
            return new WP_REST_Response([
                'data' => $flow_data,
                'status' => $permission['status'],
                'message' => $permission['message'],
                'data_sector' => $permission['data_sector']
            ], 200);
        }
    }

    public function upload($request) {
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

        $file = $_FILES['file'];
        $overrides = [
            'test_form' => false,
            'mimes' => [
                'doc' => 'application/msword',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'pdf' => 'application/pdf',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
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
            $htaccess_content = <<<EOT
                    <IfModule mod_rewrite.c>
                        RewriteEngine On

                        # Bloquear acesso direto ao diretório e redirecionar ao WordPress
                        RewriteCond %{REQUEST_FILENAME} -f
                        RewriteRule ^ - [F]
                    </IfModule>
                EOT;
            if (file_put_contents($htaccess_path, $htaccess_content) === false) {
                return new WP_REST_Response([
                    'error' => 'Erro ao criar o arquivo .htaccess no diretório de upload.',
                ], 500);
            }
        }

        // Fazer upload do arquivo
        $uploaded_file = wp_handle_upload($file, $overrides);

        if (isset($uploaded_file['error'])) {
            return new WP_REST_Response([
                'error' => $uploaded_file['error'],
            ], 500);
        }

        $filename = sanitize_file_name($file['name']);
        $new_file_path = trailingslashit($custom_dir) . $filename;
        if (!rename($uploaded_file['file'], $new_file_path)) {
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
        // Força o download do arquivo
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . basename($file_path) . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file_path));
        
        // Limpar buffers de saída antes de enviar o arquivo
        ob_clean();
        flush();
        
        // Ler e enviar o arquivo
        readfile($file_path);
        exit;
    }
}