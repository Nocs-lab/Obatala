<?php
namespace Obatala\Api;
use Obatala\Entities\Sector;

defined('ABSPATH') || exit;

class ProcessTypeApi extends ObatalaAPI {
  


    public function register_routes() {
        $this->add_route('process_type/teste', [
            'methods' => 'GET',
            'callback' => [$this, 'teste'],
            'permission_callback' => function(){
                print_r(Sector::check_permission(180));
                return Sector::check_permission(180);
            },
        ]);

        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => '__return_true',
            'args' => $this->get_meta_args(),
        ]);

        // Rota para associar e gerenciar historico de setores das etapas e current sector
        $this->add_route('process_type/(?P<id>\d+)/assosiate_sector', [
            'methods' => 'POST',
            'callback' => [$this, 'assosiate_sector'],
            'permission_callback' => '__return_true',
            'args' => [
                'sector_id' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_string($param);
                    }
                ],
                'node_id' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param) && is_string($param);
                    }
                ]
            ]
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
    
        // Atualizar o current_sector
        update_post_meta($process_id, 'current_sector', $sector_id);
    
        // Adicionar o setor ao histórico da etapa (node)
        if (!isset($flow_data['nodes'][$node_key]['sector_history'])) {
            $flow_data['nodes'][$node_key]['sector_history'] = [];
        }
    
        // Adicionar o novo setor ao histórico
        $flow_data['nodes'][$node_key]['sector_history'][] = $sector_id;
    
        // Atualizar o flowData com o novo histórico
        $updated = update_post_meta($process_id, 'flowData', $flow_data);
    
        // Verificar se a atualização foi bem-sucedida
        if ($updated) {
            return new WP_REST_Response('Setor associado com sucesso', 200);
        } else {
            return new WP_REST_Response('Erro ao associar o setor', 500);
        }
    }

    public function teste($request){  
        
    }
}
