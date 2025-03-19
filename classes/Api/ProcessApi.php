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
    

    public function add_comment($request) {
        $post_id = (int) $request['id'];
        $user_id = (int) $request->get_param('user');
        $body = sanitize_text_field($request->get_param('text'));
    
        // Verifica se o post existe
        if (!get_post($post_id)) {
            return new WP_Error('invalid_post', 'O post especificado não existe.', ['status' => 404]);
        }
    
        // Verifica se o comentário está vazio
        if (empty($body)) {
            return new WP_Error('empty_comment', 'O comentário não pode estar vazio.', ['status' => 400]);
        }
    
        // Pega os dados do usuário, se existir
        $user = get_userdata($user_id);
        $author_name = $user ? $user->display_name : 'Anônimo';
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
            return new WP_Error('db_error', 'Erro ao inserir o comentário.', ['status' => 500]);
        }
    
        return new WP_REST_Response([
            'message' => 'Comentário adicionado com sucesso.',
            'comment_id' => $comment_id,
        ], 200);
    }

    //Retorna todos os comentarios realizados em um processo 
    public function get_comments($request) {
        $post_id = (int) $request['id'];
        $comments = get_comments(['post_id' => $post_id]); // Busca os comentários do post
    
        if (empty($comments)) {
            return new WP_REST_Response(['message' => 'Nenhum comentário encontrado'], 200);
        }
    
        $formatted_comments = array_map(function($comment) {
            return [
                'coment_ID'           => $comment->comment_ID,
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
    
        // Verifica se o comentário existe
        $comment = get_comment($comment_id);
        if (!$comment) {
            return new WP_REST_Response([
                'message' => 'O comentário especificado não existe.',
            ], 404);
        }
    
        // Verifica se o novo texto do comentário está vazio
        if (empty($body)) {
            return new WP_REST_Response([
                'message' => 'O comentário não pode estar vazio.',
            ], 400);
        }
    
        // Dados atualizados do comentário
        $comment_data = [
            'comment_ID'           => $comment_id,
            'comment_content'      => $body,
        ];
    
        // Atualiza o comentário
        $updated = wp_update_comment($comment_data);
    
        if (!$updated) {
            return new WP_REST_Response([
                'message' => 'Erro ao atualizar o comentário.',
            ], 500);
        }
    
        return new WP_REST_Response([
            'message' => 'Comentário atualizado com sucesso.',
            'comment_id' => $comment_id,
        ], 200);
    }

    //Remover um comentário específico
    public function delete_comment($request) {
        $comment_id = (int) $request['id'];
    
        // Verifica se o comentário existe
        $comment = get_comment($comment_id);
        if (!$comment) {
            return new WP_REST_Response([
                'message' => 'O comentário especificado não existe.',
            ], 404);
        }
    
        // Deleta o comentário
        $deleted = wp_delete_comment($comment_id, true); // O segundo parâmetro 'true' força a exclusão, mesmo que seja um comentário aprovado
    
        if (!$deleted) {
            return new WP_REST_Response([
                'message' => 'Erro ao deletar o comentário.',
            ], 500);
        }
    
        return new WP_REST_Response([
            'message' => 'Comentário deletado com sucesso.',
            'comment_id' => $comment_id,
        ], 200);
    }

}