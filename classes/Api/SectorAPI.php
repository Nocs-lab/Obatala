<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

use WP_REST_Response;
use WP_Query;

class SectorApi extends ObatalaAPI {

    public function register_routes() {

        error_log('Registering routes');

        // Route to create a new sector
        $this->add_route('sector_obatala', [
            'methods' => 'POST',
            'callback' => [$this, 'create_sector'],
            'permission_callback' => '__return_true',
            'args' => [
                'sector_name' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ],
            ] 
        ]);

        // Route to get the sector by ID
        $this->add_route('sector_obatala/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_sector'],
            'permission_callback' => '__return_true',
        ]);

        // Route to get all sectors
        $this->add_route('all_sector_obatala', [
            'methods' => 'GET',
            'callback' => [$this, 'get_all_sectors'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update sector by ID
        $this->add_route('sector_obatala/(?P<id>\d+)', [
            'methods' => 'POST',
            'callback' => [$this, 'update_sector'],
            'permission_callback' => '__return_true',
            'args' => [
                'sector_name' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ]
            ]
        ]);

        // Route to get sector meta fields
        $this->add_route('sector_obatala/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [$this, 'get_meta'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update sector meta fields
        $this->add_route('sector_obatala/(?P<id>\d+)/meta', [
            'methods' => 'POST',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => '__return_true',
            'args' => [
                'description' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ]
            ]
        ]);

        // Route to get all users
        $this->add_route('sector_obatala/users_obatala', [
            'methods' => 'GET',
            'callback' => [$this, 'get_all_users'],
            'permission_callback' => '__return_true',
        ]);

         // Rota para associar um usuário a um setor
         $this->add_route('associate_user_to_sector', [
            'methods' => 'POST',
            'callback' => [$this, 'associate_user_to_sector'],
            'permission_callback' => '__return_true',
            'args' => [
                'user_id' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0;
                    }
                ],
                'sector_id' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0;
                    }
                ],
            ]
        ]);

         // Route to return users of a specific sector
         $this->add_route('sector_obatala/(?P<id>\d+)/users', [
            'methods' => 'GET',
            'callback' => [$this, 'get_sector_users'],
            'permission_callback' => '__return_true',
        ]);

        // Rota para obter todos os setores e seus usuários associados
        $this->add_route('sector_obatala/sectors_with_users', [
            'methods' => 'GET',
            'callback' => [$this, 'get_all_sectors_with_users'],
            'permission_callback' => '__return_true', // Altere se quiser aplicar regras de permissão
        ]);

        // Rota para remover um usuário de um setor
        $this->add_route('sector_obatala/(?P<sector_id>\d+)/remove_user', [
            'methods' => 'POST',
            'callback' => [$this, 'remove_user_from_sector'],
            'permission_callback' => '__return_true', // Altere se quiser aplicar regras de permissão
            'args' => [
                'user_id' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
            ]
        ]);

        // Rota para adicionar uma nova cargo
        $this->add_route('add_job_title',[
            'methods' => 'POST',
            'callback' => [$this, 'add_job_title'],
            'permission_callback' => '__return_true',
            'args' => [
                'assignment' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ],
            ]
        ]);

        // Rota para relacioanr um cargo a um usuario
        $this->add_route('sector_obatala/(?P<job_title_id>)/add_job_title_user',[
            'methods' => 'POST',
            'callback' => [$this, 'add_job_title_user_meta'],
            'permission_callback' => '__return_true',
            'args' => [
                'user_id' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ],
            ]
        ]);

    }

    public function create_sector($request) {

        error_log('create_sector function called');
        
        $sector_name = sanitize_text_field($request['sector_name']);
        
        if (empty($sector_name)) {
            return new WP_REST_Response('Nome do setor vazio', 400); // Retorna erro se o nome estiver vazia
        }
        $post_id = wp_insert_post([
            'post_title' => $sector_name,
            'post_type' => 'sector_obatala',
            'post_status' => 'publish'
        ]);


        if ($post_id && !is_wp_error($post_id)) {
                return new WP_REST_Response('Sector created', 201);
        } else {
            return new WP_REST_Response('Error creating sector', 500);
        }
    }

    public function get_sector($request) {
        $post_id = (int) $request['id'];
        $post = get_post($post_id);

        if ($post) {
            return [
                'id' => $post->ID,
                'title' => $post->post_title,
                'content' => $post->post_content,
            ];
        } else {
            return new WP_REST_Response('Sector not found.', 404);
        }
    }

    public function get_all_sectors($request) {
        error_log('retorne sector function called');

        $query = new WP_Query([
            'post_type' => 'sector_obatala',
            'post_status' => 'publish',
            'posts_per_page' => -1, 
        ]);

        
        $sectors = [];

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $sectors[] = [
                    'id' => get_the_ID(),
                    'title' => get_the_title(),
                    'content' => get_the_content(),
                ];
            }
            wp_reset_postdata();
        }

        return $sectors;
    }

    public function update_sector($request) {
        $post_id = (int) $request['id'];
        $sector_name = sanitize_text_field($request['sector_name']);

        $result = wp_update_post([
            'ID' => $post_id,
            'post_title' => $sector_name,
        ]);

        if ($result && !is_wp_error($result)) {
            return new WP_REST_Response('Sector updated successfully', 200);
        } else {
            return new WP_REST_Response('Error updating sector', 500);
        }
    }

    public function get_meta($request) {
        $post_id = (int) $request['id'];
        $meta = get_post_meta($post_id);

        return $meta;
    }

    public function update_meta($request) {
        $post_id = (int) $request['id'];

        $description = sanitize_text_field($request['description']);

        update_post_meta($post_id, "sector_description", $description);
        

        return new WP_REST_Response('Meta fields updated successfully', 200);
    } 

    public function get_all_users($request) {
        $args = array(
            'role' => '',  
            'orderby' => 'login',
            'order' => 'ASC',
        );
        
        $users = get_users($args);
        $users_data = array();

        foreach ($users as $user) {
            $users_data[] = array(
                'ID' => $user->ID,
                'username' => $user->user_login,
                'display_name' => $user->display_name,
                'email' => $user->user_email,
            );
        }

        return new WP_REST_Response($users_data, 200);
    }

    public function associate_user_to_sector($request) {
        $user_id = (int) $request['user_id'];
        $sector_id = (int) $request['sector_id'];

        // Verificar se o usuário existe
        if (!get_user_by('ID', $user_id)) {
            return new WP_REST_Response('Usuário não encontrado.', 404);
        }

        // Verificar se o setor existe
        $sector_post = get_post($sector_id);
        if (!$sector_post || $sector_post->post_type !== 'sector_obatala') {
            return new WP_REST_Response('Setor não encontrado.', 404);
        }

        // Associar o setor ao usuário nos meta dados
        update_user_meta($user_id, 'associated_sector', $sector_id);

        return new WP_REST_Response('Usuário associado ao setor com sucesso.', 200);
    }

     // Função que retorna a lista de usuários associados a um setor
    public function get_sector_users($request) {
        global $wpdb;

        $sector_id = (int) $request['id'];

        if (!$sector_id) {
            return new WP_REST_Response('Setor inválido.', 400);
        }

        // Consulta os IDs dos usuários associados ao setor
        $user_ids = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT user_id 
                FROM $wpdb->usermeta 
                WHERE meta_key = 'associated_sector' 
                AND meta_value = %d", 
                $sector_id
            )
        );

        if (empty($user_ids)) {
            return new WP_REST_Response('Nenhum usuário encontrado para o setor especificado.', 404);
        }

        // buscar os dados dos usuários com base nos IDs
        $users = [];
        foreach ($user_ids as $user_id) {
            $user_data = get_userdata($user_id);
            if ($user_data) {
                $users[] = [
                    'ID' => $user_data->ID,
                    'username' => $user_data->user_login,
                    'display_name' => $user_data->display_name,
                    'email' => $user_data->user_email,
                ];
            }
        }

        return new WP_REST_Response($users, 200);
    }

    public function get_all_sectors_with_users($request) {
        global $wpdb;
    
        // Consulta todos os setores
        $sectors_query = new WP_Query([
            'post_type' => 'sector_obatala',
            'post_status' => 'publish',
            'posts_per_page' => -1
        ]);
    
        $sectors_with_users = [];
    
        if ($sectors_query->have_posts()) {
            while ($sectors_query->have_posts()) {
                $sectors_query->the_post();
                $sector_id = get_the_ID();
                $sector_name = get_the_title();
                
                // Consulta os IDs dos usuários associados ao setor
                $user_ids = $wpdb->get_col(
                    $wpdb->prepare(
                        "SELECT user_id 
                         FROM $wpdb->usermeta 
                         WHERE meta_key = 'associated_sector' 
                         AND meta_value = %d", 
                         $sector_id
                    )
                );
    
                // Obtém os dados dos usuários associados
                $users = [];
                foreach ($user_ids as $user_id) {
                    $user_data = get_userdata($user_id);
                    if ($user_data) {
                        $users[] = [
                            'ID' => $user_data->ID,
                            'username' => $user_data->user_login,
                            'display_name' => $user_data->display_name,
                            'email' => $user_data->user_email,
                        ];
                    }
                }
    
                // Adiciona o setor e seus usuários à lista
                $sectors_with_users[] = [
                    'sector_id' => $sector_id,
                    'sector_name' => $sector_name,
                    'users' => $users
                ];
            }
    
            wp_reset_postdata();
        }
    
        return new WP_REST_Response($sectors_with_users, 200);
    }

    public function remove_user_from_sector($request) {
        global $wpdb;
    
        $sector_id = (int) $request['sector_id'];
        $user_id = (int) $request['user_id'];
    
        // Verifica se o usuário está associado ao setor
        $meta_exists = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) 
                 FROM $wpdb->usermeta 
                 WHERE meta_key = 'associated_sector' 
                 AND meta_value = %d 
                 AND user_id = %d",
                $sector_id,
                $user_id
            )
        );
    
        if ($meta_exists > 0) {
            // Remove a associação
            $deleted = $wpdb->delete(
                $wpdb->usermeta,
                [
                    'meta_key' => 'associated_sector',
                    'meta_value' => $sector_id,
                    'user_id' => $user_id
                ]
            );
    
            if ($deleted !== false) {
                return new WP_REST_Response('User removed from sector successfully', 200);
            } else {
                return new WP_REST_Response('Error removing user from sector', 500);
            }
        } else {
            return new WP_REST_Response('User not associated with the sector', 404);
        }
    } 

    // Funçao que adiciona uma nova cargo
    public function add_job_title ($request){
        $assignment = sanitize_text_field($request['assignment']);
        
        if (empty($assignment)) {
            return new WP_REST_Response('Atribuição esta vazia', 400);
        }
        $job_title_id = wp_insert_post([
            'post_title' => $assignment,
            'post_type' => 'assignment_obatala',
            'post_status' => 'publish'
        ]);

        if ($job_title_id && !is_wp_error($job_title_id)) {
            return new WP_REST_Response('Assignment created', 201);
        } else {
        return new WP_REST_Response('Error creating assignment', 500);
        } 
    }
    
    // Funçao que adiciona o cargo ao usuario 
    public function add_job_title_user_meta ($request){
        $job_title_id = sanitize_text_field($request['job_title_id']);
        $user_id = (int) $request['user_id'];

        if (!get_user_by('ID', $user_id)) {
            return new WP_REST_Response('Usuário não encontrado.', 404);
        }

        update_user_meta($user_id, 'job_title', $job_title_id);

    }
}