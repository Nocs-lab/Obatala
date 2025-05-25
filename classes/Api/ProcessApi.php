<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

use WP_REST_Response; // Certifique-se de importar a classe WP_REST_Response
use Obatala\Entities\Sector;

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

        // Route to get meta fields
        $this->add_route('process_obatala/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [$this, 'get_meta'],
            'permission_callback' => '__return_true',
        ]);
        
        // Route to update multiple meta fields
        $this->add_route('process_obatala/(?P<id>\d+)/meta', [
            'methods' => 'POST',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => '__return_true',
        ]);

        // Rota para obter todos os comentários associados a um processo
        $this->add_route('process_obatala/users', [
            'methods' => 'GET',
            'callback' => [$this, 'get_user_processes'],
            'permission_callback' => '__return_true',
        ]);

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
        ]);

        //Rota para editar um comentario de um processo
        $this->add_route('/process_obatala/comment/(?P<id>\d+)', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_comment'],
            'permission_callback' => '__return_true',
        ]);

        //Rota para deletar um comentario de um processo
        $this->add_route('/process_obatala/comment/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'delete_comment'],
            'permission_callback' => '__return_true',
        ]);

        //Rota para editar uma etapa de um processo(mudar node_status e parametros gerais)
        $this->add_route('/process_obatala/(?P<id>\d+)/node', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_node'],
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
    public function get_meta($request) {
        $post_id = (int) $request['id'];
    
        $stageData = maybe_unserialize(get_post_meta($post_id, 'stageData', true));
        $submittedStages = maybe_unserialize(get_post_meta($post_id, 'submittedStages', true));

        $response = array(
            'stageData' => $stageData,
            'submittedStages' => $submittedStages,
        );
    
        return rest_ensure_response($response);
    }
    public function update_meta($request) {
        $post_id = (int) $request['id'];
        $meta = $request->get_json_params();
        foreach ($meta as $key => $value) {
            update_post_meta($post_id, $key, $value);
        }
        return true;
    }
    
    public function get_user_processes($request) {
        $user_id = (int) $request->get_param('user_id'); 
        $processes = get_posts([
            'post_type'   => 'process_obatala', 
            'numberposts' => -1,
        ]);
    
        $user_processes = [];
    
        foreach ($processes as $process) {
            $process_id = (int) $process->ID;
    

            $permission = Sector::check_permission($user_id, $process_id);
    
            if ($permission['status']) {
                $user_processes[] = $process_id;
            }
        }
    
        if (empty($user_processes)) {
            return new WP_REST_Response(['message' => 'No processes found.'], 200);
        }
    
        return new WP_REST_Response($user_processes, 200);
    }
    
    public function add_comment($request) {
        $post_id = (int) $request['id'];
        $user_id = (int) $request->get_param('user_id'); // ID do usuário autenticado
        $body = sanitize_text_field($request->get_param('text'));
    
        // Verifica se o post existe
        if (!get_post($post_id)) {
            return new WP_REST_Response([
                'message' => 'The specified post does not exist.',
            ], 404);
        }
        
        // Verificar permissão
        $permission = Sector::check_permission($user_id, $post_id);
    
        if (!$permission['status']) {
            return new WP_REST_Response(
                [
                    'error' => 'Permission denied',
                    'status' => $permission['message']
                ],
                403
            );
        }
    
        // Verifica se o comentário está vazio
        if (empty($body)) {
            return new WP_REST_Response([
                'message' => 'The comment cannot be empty.',
            ], 400);
        }
    
        // Pega os dados do usuário, se existir
        $user = get_userdata($user_id);
        $author_name = $user ? $user->display_name : 'Anonymous';
        $author_email = $user ? $user->user_email : '';
    
        // Dados do novo comentário
        $comment_data = [
            'comment_post_ID'      => $post_id,
            'comment_author'       => $author_name,
            'comment_author_email' => $author_email,
            'comment_content'      => $body,
            'user_id'              => $user_id,
            'comment_date'         => current_time('mysql'),
            'comment_approved'     => 1, // Define como aprovado automaticamente
        ];
    
        // Insere o comentário
        $comment_id = wp_insert_comment($comment_data);
    
        if (!$comment_id) {
            return new WP_REST_Response([
                'message' => 'Error while inserting the comment.',
            ], 500);
        }
    
        return new WP_REST_Response([
            'message' => 'Comment added successfully.',
            'comment_id' => $comment_id,
        ], 200);
    }

    //Retorna todos os comentarios realizados em um processo 
    public function get_comments($request) {
        $post_id = (int) $request['id'];
        $comments = get_comments(['post_id' => $post_id]); // Busca os comentários do post
        $user_id = (int) $request->get_param('user_id'); // ID do usuário autenticado
        
        // Verificar permissão
        $permission = Sector::check_permission($user_id, $post_id);
    
        if (!$permission['status']) {
            return new WP_REST_Response(
                [
                    'error' => 'Permission denied',
                    'status' => $permission['message']
                ],
                403
            );
        }
    
        if (empty($comments)) {
            return new WP_REST_Response(['message' => 'No comments found.'], 200);
        }
    
        $formatted_comments = array_map(function($comment) {
            return [
                'comment_ID'          => (int) $comment->comment_ID,
                'comment_author'      => $comment->comment_author,
                'comment_author_email'=> $comment->comment_author_email,
                'comment_content'     => $comment->comment_content,
                'user_id'             => (int) $comment->user_id,
                'comment_date'        => $comment->comment_date,
            ];
        }, $comments);
    
        return new WP_REST_Response($formatted_comments, 200);
    }

    //Atualiza um comentario especifico
    public function update_comment($request) {
        $comment_id = (int) $request['id'];
        $body = sanitize_text_field($request->get_param('text'));
        $user_id = (int) $request->get_param('user_id'); // ID do usuário autenticado
    
        // Verifica se o comentário existe
        $comment = get_comment($comment_id);
        if (!$comment) {
            return new WP_REST_Response([
                'message' => 'The specified comment does not exist.',
            ], 404);
        }
    
        // Verifica se o usuário autenticado é o dono do comentário
        if ((int) $comment->user_id !== $user_id) {
            return new WP_REST_Response([
                'message' => 'You do not have permission to edit this comment.',
            ], 403); // 403 = Forbidden
        }
    
        // Verifica se o novo texto do comentário está vazio
        if (empty($body)) {
            return new WP_REST_Response([
                'message' => 'The comment cannot be empty.',
            ], 400);
        }
    
        // Dados atualizados do comentário
        $comment_data = [
            'comment_ID'           => $comment_id,
            'comment_content'      => $body,
            'comment_date'         => current_time('mysql'),
        ];
    
        // Atualiza o comentário
        $updated = wp_update_comment($comment_data);
    
        if (!$updated) {
            return new WP_REST_Response([
                'message' => 'Error while updating the comment.',
            ], 500);
        }
    
        return new WP_REST_Response([
            'message' => 'Comment updated successfully.',
            'comment_id' => $comment_id,
        ], 200);
    }

    //Remover um comentário específico
    public function delete_comment($request) {
        $comment_id = (int) $request['id'];
        $user_id = (int) $request->get_param('user_id'); // ID do usuário autenticado
    
        // Verifica se o comentário existe
        $comment = get_comment($comment_id);
        if (!$comment) {
            return new WP_REST_Response([
                'message' => 'The specified comment does not exist.',
            ], 404);
        }
    
        // Verifica se o usuário autenticado é o dono do comentário
        if ((int) $comment->user_id !== $user_id) {
            return new WP_REST_Response([
                'message' => 'You do not have permission to delete this comment.',
            ], 403); // 403 = Forbidden
        }
    
        // Deleta o comentário
        $deleted = wp_delete_comment($comment_id, true); // O segundo parâmetro 'true' força a exclusão, mesmo que seja um comentário aprovado
    
        if (!$deleted) {
            return new WP_REST_Response([
                'message' => 'Error while deleting the comment.',
            ], 500);
        }
    
        return new WP_REST_Response([
            'message' => 'Comment deleted successfully.',
            'comment_id' => $comment_id,
        ], 200);
    }

    public function update_node($request) {
        $post_id = (int) $request['id'];
        $node_id = $request['node_id'] ?? null;

        $flowData = get_post_meta($post_id, 'flowData', true);
        $flowData = maybe_unserialize($flowData);
        $nodes = $flowData['nodes'];
        $edges = $flowData['edges'];
        
        // Se node_id é nulo, inicializa o primeiro nó
        if ($node_id === null) {
            return $this->init_node($flowData, $post_id);
        }

        // Filtra nós que NÃO são Start, End ou Condicional
        $filtered_nodes = array_filter($nodes, function($node) {
            return $node['id'] !== 'Start' && 
                $node['id'] !== 'End' && 
                strpos($node['id'], 'Condicional') !== 0;
        });

        // Encontra o nó a ser atualizado
        $node_to_update = null;
        foreach ($filtered_nodes as $node) {
            if ($node['id'] === $node_id) {
                $node_to_update = $node;
                break;
            }
        }

        if (!$node_to_update) {
            return new WP_REST_Response(['message' => 'Node not found.'], 404);
        }

        // Atualiza apenas o status do nó (sem usar params)
        $updated_node = $node_to_update;
        $updated_node['node_status'] = 'Finished';

        // Encontra a próxima conexão
        $next_edge = null;
        foreach ($edges as $edge) {
            if ($edge['source'] === $node_id) {
                $next_edge = $edge;
                break;
            }
        }

        if ($next_edge) {
            $next_node_id = $next_edge['target'];
            
            // Verifica se o próximo nó é uma condicional
            if (strpos($next_node_id, 'Condicional') === 0) {
                $conditional_node = null;
                foreach ($nodes as $node) {
                    if ($node['id'] === $next_node_id) {
                        $conditional_node = $node;
                        break;
                    }
                }

                if ($conditional_node) {
                    $input_node_id = $conditional_node['data']['condition']['inputNode']; // Ex: "Etapa 1"
                    $radio_name = $conditional_node['data']['condition']['condition']; // Ex: "radio"
                    //pegar o node onde o id dele é igual ao input_node_id
                    $input_node = null;
                    foreach ($nodes as $node) {
                        if ($node['id'] === $input_node_id) {
                            $input_node = $node;
                            break;
                        }
                    }
                    // pegar o valor que esta no data fields e procurar no array de fields o id do radio e ver la dentro de config onde o valor do label for igual ao valor de $radio_name
                    $radio_id = null;
                    foreach ($input_node['data']['fields'] as $field) {
                        if ($field['config']['label'] === $radio_name) {
                            $radio_id = $field['id'];
                            break;
                        }
                    }
                    // Obtém os dados dos estágios submetidos
                    $stageData = get_post_meta($post_id, 'stageData', true);
                    
                    // Verifica se existe dados para o nó de input
                    if (isset($stageData[$input_node_id])) {
                        $input_node_data = $stageData[$input_node_id];
                        
                        // Procura o campo radio correspondente
                        foreach ($input_node_data['fields'] as $field) {
                            if ($field['fieldId'] === $radio_id && isset($field['value'][0])) {
                                $selected_value = trim($field['value'][0]); // Ex: "B"
                                
                                // Encontra o próximo nó baseado no valor selecionado
                                foreach ($conditional_node['data']['condition']['outputNodes'] as $output) {
                                    if (trim($output['conditionValue']) === $selected_value) {
                                        $next_node_id = $output['nodeId'];
                                        break 2; // Sai dos dois loops
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Atualiza o próximo nó
            foreach ($nodes as &$node) {
                if ($node['id'] === $next_node_id && $node['node_status'] === 'Stopped') {
                    $node['node_status'] = 'Started';
                    break;
                }
            }
        }

        // Atualiza o nó atual
        foreach ($nodes as &$node) {
            if ($node['id'] === $node_id) {
                $node = $updated_node;
                break;
            }
        }

        // Salva as alterações
        $newFlowData = $flowData;
        $newFlowData['nodes'] = $nodes;
        
        update_post_meta($post_id, 'flowData', $newFlowData);
        
        return new WP_REST_Response([
            'message' => 'Node updated successfully.',
            'node_id' => $node_id,
            'next_node_id' => $next_node_id ?? null,
            'status' => 'Finished'
        ], 200);
    }

    public function init_node($flowData, $post_id) {
        $nodes = $flowData['nodes'];
        $edges = $flowData['edges'];
        
        // Encontra a primeira conexão após o Start
        $first_edge = null;
        foreach ($edges as $edge) {
            if ($edge['source'] === 'Start') {
                $first_edge = $edge;
                break;
            }
        }

        if ($first_edge) {
            $first_node_id = $first_edge['target'];
            
            // Atualiza o status do primeiro nó
            foreach ($nodes as &$node) {
                if ($node['id'] === $first_node_id && $node['node_status'] === 'Stopped') {
                    $node['node_status'] = 'started';
                    
                    // Salva as alterações
                    $newFlowData = $flowData;
                    $newFlowData['nodes'] = $nodes;
                    update_post_meta($post_id, 'flowData', $newFlowData);
                    
                    return new WP_REST_Response([
                        'message' => 'First node initialized successfully.',
                        'node_id' => $first_node_id,
                        'status' => $newFlowData['nodes']
                    ], 200);
                }
            }
        }

        return new WP_REST_Response([
            'message' => 'Could not initialize first node.'
        ], 400);
    }
}