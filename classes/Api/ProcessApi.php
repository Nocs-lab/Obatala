<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

use WP_REST_Response; // Certifique-se de importar a classe WP_REST_Response

class ProcessApi extends ObatalaAPI {

    public function register_routes() {
        // Route to get the current stage
        $this->add_route('process_obatala/(?P<id>\d+)/current_stage', [
            'methods' => 'GET',
            'callback' => [$this, 'get_current_stage'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the current stage
        $this->add_route('process_obatala/(?P<id>\d+)/current_stage', [
            'methods' => 'POST',
            'callback' => [$this, 'update_current_stage'],
            'permission_callback' => '__return_true',
            'args' => [
                'current_stage' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ]
            ]
        ]);

        // Route to get the process type
        $this->add_route('process_obatala/(?P<id>\d+)/process_type', [
            'methods' => 'GET',
            'callback' => [$this, 'get_process_type'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the process type
        $this->add_route('process_obatala/(?P<id>\d+)/process_type', [
            'methods' => 'POST',
            'callback' => [$this, 'update_process_type'],
            'permission_callback' => '__return_true',
            'args' => [
                'process_type' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ]
            ]
        ]);

        // Route to update multiple meta fields
        $this->add_route('process_obatala/(?P<id>\d+)/meta', [
            'methods' => 'POST',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => '__return_true',
        ]);
        // Rota para obter todos os comentários associados a um step
        $this->add_route('process_obatala/(?P<id>\d+)/comments', [
            'methods' => 'GET',
            'callback' => [$this, 'get_comments'],
            'permission_callback' => '__return_true',
        ]);

       
        // Route to add a comment to the process
        $this->add_route('process_obatala/(?P<id>\d+)/comment', [
            'methods' => 'POST',
            'callback' => [$this, 'add_comment'],
            'permission_callback' => '__return_true',
            'args' => [
                'content' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ],
                'author' => [
                    'required' => false,
                ]
            ]
        ]);

        // Rota para associar e gerensiar historico de setores das etapas
        $this->add_route('process_obatala/(?P<id>\d+)/assosiate_sector', [
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

        // Rota para verificar as permisoes
        $this->add_route('process_obatala/(?P<id>\d+)/check_permision', [
            'methods' => 'GET',
            'callback' => [$this, 'check_permision'],
            'permission_callback' => '__return_true',
        ]);
    }
    
    public function get_current_stage($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'current_stage', true);
    }

    public function update_current_stage($request) {
        $post_id = (int) $request['id'];
        $current_stage = (int) $request['current_stage'];
        return update_post_meta($post_id, 'current_stage', $current_stage);
    }

    public function get_process_type($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'process_type', true);
    }

    public function update_process_type($request) {
        $post_id = (int) $request['id'];
        $process_type = (int) $request['process_type'];
        return update_post_meta($post_id, 'process_type', $process_type);
    }

    public function update_meta($request) {
        $post_id = (int) $request['id'];
        $meta = $request->get_json_params();
        foreach ($meta as $key => $value) {
            update_post_meta($post_id, $key, $value);
        }
        return true;
    }
    public function get_comments($request) {
        $post_id = (int) $request['id'];
        
        // Obtém todos os comentários associados ao post
        $comments = get_comments(['post_id' => $post_id]);
        
        if ($comments) {
            // Se necessário, formatar os comentários para incluir apenas campos relevantes
            $formatted_comments = array_map(function($comment) {
                return [
                    'id' => $comment->comment_ID,
                    'content' => $comment->comment_content,
                    'author' => $comment->comment_author,
                    'date' => $comment->comment_date,
                ];
            }, $comments);
            
            return $formatted_comments;
        } else {
            return new WP_REST_Response('No comments found.', 404);
        }
    }
    

    public function add_comment($request) {
        $post_id = (int) $request['id'];
        $content = sanitize_text_field($request['content']);
        $author = isset($request['author']) ? sanitize_text_field($request['author']) : '';

        $commentdata = [
            'comment_post_ID' => $post_id,
            'comment_content' => $content,
            'comment_author' => $author,
            'comment_approved' => 1,
        ];

        $comment_id = wp_insert_comment($commentdata);

        if ($comment_id) {
            return new WP_REST_Response('Comment added successfully', 200);
        } else {
            return new WP_REST_Response('Error adding comment', 500);
        }
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

    // Funçao informar se o usuario tem permisao permisao
    public function check_permision($request){
        $process_id = (int) $request['id'];
        // Pega o setor atual da etapa
        $curent_sector = get_post_meta($process_id, 'current_sector', true);

        // Pega as informações do usuário atual
        $current_user = wp_get_current_user();
        $id_user = $current_user->ID;
        
        // Pega os setores que estão associados ao usuário
        //$user_sector = get_user_meta(1, 'associated_sector', false);
        $user_sector = get_user_meta($id_user, 'associated_sector', false);

        // Pega a permisao do usuario
        //$permision = get_user_meta(1, 'wp_capabilities');
        $permision = get_user_meta($id_user, 'wp_capabilities');

        // Verifica se este usuário possui algum setor associado e percorre o array
        if(!empty($user_sector) && is_array($user_sector)){
            foreach ($user_sector as $sector) {
                // Verifica se algum setor do usuário é igual ao current_sector
                if (in_array($curent_sector, $sector)) {
                    return new WP_REST_Response($permision, 200);
                    //return new WP_REST_Response($current_user->allcaps, 200); 
                }else{
                    return new WP_REST_Response('Usuário não possui permissão para este setor.', 403);
                }
            }
        }else{
            return new WP_REST_Response('Usuário não possui permissão para este setor.', 403);
        }
    }

}