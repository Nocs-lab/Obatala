<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

use WP_REST_Response;
use WP_Query;

class SectorApi extends ObatalaAPI {

    public function register_routes() {

        error_log('Registering routes');

        // Route to create a new sector
        $this->add_route('create_sector_obatala', [
            'methods' => 'POST',
            'callback' => [$this, 'add_sector'],
            'permission_callback' => '__return_true',
            'args' => [
                'sector_name' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ],
                'sector_description' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ],
                'sector_status' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ],
            ] 
        ]);

        // Route to get the sector by ID
        $this->add_route('get_sector_obatala/(?P<$sector_id>\d+)', [
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
        $this->add_route('update_sector_obatala/(?P<sector_id>\d+)', [
            'methods' => 'POST',
            'callback' => [$this, 'update_sector'],
            'permission_callback' => '__return_true',
            'args' => [
                'sector_name' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ],
                'sector_description' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ],
                'sector_status' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ],
            ]
        ]);
        
        //Route to delete sector
        $this->add_route('delete_sector_obatala/(?P<sector_id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'delete_sector'],
            'permission_callback' => '__return_true'
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
         $this->add_route('sector_obatala/(?P<sector_id>\d+)/users', [
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
    }

    public function add_sector($request) {

        error_log('create_sector function called');
    
        $sector_name = sanitize_text_field($request['sector_name']);
        $description = sanitize_text_field($request['sector_description']);
        $status = sanitize_text_field($request['sector_status']); // Novo campo para o status do setor
    
        // Verificações
        if (empty($sector_name)) {
            return new WP_REST_Response('Nome do setor vazio', 400); // Retorna erro se o nome estiver vazio
        }
    
        if (empty($description)) {
            return new WP_REST_Response('Descrição do setor vazia', 400); // Retorna erro se a descrição estiver vazia
        }
    
        // Recupera setores salvos no wp_options e garante que sejam decodificados corretamente
        $setores_json = get_option('obatala_setores', '{}');
        $setores = json_decode($setores_json, true); // Decodifica para array associativo
    
        // Se a decodificação falhar ou o valor não for um array, inicializa um array vazio
        if (!is_array($setores)) {
            $setores = [];
        }
    
        // Verifica se o setor já existe no array de setores
        foreach ($setores as $sector_id => $sector_data) {
            if (isset($sector_data['name']) && $sector_data['name'] === $sector_name) {
                return new WP_REST_Response('Setor já existe', 409);
            }
        }
    
        // Armazenar o setor no wp_options como JSON
        $this->cadastrar_setor($sector_name, $description, $status);
    
        return new WP_REST_Response('Setor cadastrado com sucesso', 201);
    }
    
    // Função para cadastrar o setor no wp_options
    private function cadastrar_setor($nome, $descricao, $status) {
        // Recuperar setores já existentes no formato JSON
        $setores_json = get_option('obatala_setores', '{}'); // Recupera como JSON ou inicializa como um objeto vazio
        $setores = json_decode($setores_json, true); // Decodifica para array associativo
    
        // Se a decodificação falhar ou o valor não for um array, inicializa um array vazio
        if (!is_array($setores)) {
            $setores = [];
        }

        // Cria uma chave unica baseada na data e hora 
        $sector_id = uniqid('Obatala_sector_id_', true);

        // Adicionar o novo setor
        $setores[$sector_id] = array(
            'nome' => sanitize_text_field($nome),
            'descricao' => sanitize_textarea_field($descricao),
            'status' => sanitize_text_field($status) // 'ativo' ou 'inativo'
        );
    
        // Codificar o array em JSON antes de salvar
        update_option('obatala_setores', json_encode($setores));
    } 

    // Fubnçao que consulta setor por id
    public function get_sector($request) {

        $sector_id = sanitize_text_field($request['sector_id']);

        if (empty($$sector_id)) {
            return new WP_REST_Response('Id do setor vazio', 400); // Retorna erro se o campo estiver vazio
        }

        $setores_json = get_option('obatala_setores', '{}'); // Recupera como JSON ou inicializa como um objeto vazio
        $setores = json_decode($setores_json, true);

        if (!is_array($setores)) {
            $setores = [];
        }

        // Verifica se o setor com o ID fornecido existe
        if (!array_key_exists($sector_id, $setores)) {
            return new WP_REST_Response('Setor não encontrado', 404); // Retorna erro se o setor não for encontrado
        }

        // Retorna os dados do setor encontrado
        return new WP_REST_Response($setores[$sector_id], 200); // Retorna o setor como resposta
    }

    public function get_all_sectors($request) {

        error_log('retorne sector function called');

        // Recuperar setores já existentes no formato JSON
        $setores_json = get_option('obatala_setores', '{}'); // Recupera como JSON ou inicializa como um objeto vazio
        $setores = json_decode($setores_json, true);

        return $setores;
    }

    public function update_sector($request) {

        error_log('update_sector function called');
        $sector_id = sanitize_text_field($request['sector_id']);
        $sector_name = sanitize_text_field($request['sector_name']);
        $description = sanitize_text_field($request['sector_description']);
        $status = sanitize_text_field($request['sector_status']);

        // Recuperar setores já existentes no formato JSON
        $setores_json = get_option('obatala_setores', '{}'); // Recupera como JSON ou inicializa como um objeto vazio
        $setores = json_decode($setores_json, true);

        if (!is_array($setores)) {
            $setores = [];
        }

        // Verifica se o setor existe
        foreach ($setores as $id => $sector_data) {
            if ($id !== $sector_id && isset($sector_data['name']) && $sector_data['name'] === $sector_name) {
                return new WP_REST_Response('Setor já existe', 409);
            }
        }

        //salva a copia
        $copia = $setores[$sector_id];

        //deleta o campo que existia para cadastar um novo equivalente
        unset($setores[$sector_id]);

        // cria um novo setor com os dados da copia caso as ateraçoes em certos campos não forem efetivadas
        $setores[$sector_id] = array(
            'nome' => !empty($sector_name) ? sanitize_text_field($sector_name) : $copia['nome'], // Substitui o nome se alterado
            'descricao' => !empty($description) ? sanitize_textarea_field($description) : $copia['descricao'], // Substitui a descrição se alterada
            'status' => !empty($status) ? sanitize_text_field($status) : $copia['status'], // Substitui o status se alterado
        );
    
        // Codificar o array em JSON antes de salvar
        update_option('obatala_setores', json_encode($setores));

        return new WP_REST_Response('Setor atualizado com sucesso', 201);
    }

    public function delete_sector($request) {

        error_log('delete_sector function called');

        $sector_id = sanitize_text_field($request['sector_id']);

        if (empty($sector_id)) {
            return new WP_REST_Response('Nome do setor vazio', 400); // Retorna erro se o nome estiver vazio
        }

        $user = $this->return_sector_users($sector_id);

        // verifica se não tem usuarios assocados a um setor
        if(empty($user)){
            // Recuperar setores já existentes no formato JSON
            $setores_json = get_option('obatala_setores', '{}'); // Recupera como JSON ou inicializa como um objeto vazio
            $setores = json_decode($setores_json, true);

            if (!is_array($setores)) {
                $setores = [];
            }

            // Remover o setor do array
            unset($setores[$sector_id]);

            // Salvar os setores atualizados de volta na opção do WordPress
            $updated = update_option('obatala_setores', json_encode($setores));

            if ($updated) {
                return new WP_REST_Response('Setor deletado com sucesso', 200); // Sucesso
            } else {
                return new WP_REST_Response('Erro ao deletar o setor', 500); // Falha ao salvar
            }
        }else{
            return new WP_REST_Response('Erro ao deletar o setor', 500); // ja possue um usuario associado a um setor
        }
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
        $sector_id = sanitize_text_field($request['sector_id']);

        // Verificar se o usuário existe
        if (!get_user_by('ID', $user_id)) {
            return new WP_REST_Response('Usuário não encontrado.', 404);
        }

        
        if (empty($sector_id)) {
            return new WP_REST_Response('Nome do setor vazio', 400); // Retorna erro se o nome estiver vazio
        }

        // Recuperar setores já existentes no formato JSON
        $setores_json = get_option('obatala_setores', '{}'); // Recupera como JSON ou inicializa como um objeto vazio
        $setores = json_decode($setores_json, true);

        if (!is_array($setores)) {
            $setores = [];
        }

        // Verifica se o setor existe
        if (!array_key_exists(sanitize_title($sector_id), $setores)) {
            return new WP_REST_Response('Setor não encontrado', 404); // Retorna erro se o setor não for encontrado
        }

        // Associar o setor ao usuário nos meta dados
        update_user_meta($user_id, 'associated_sector', $sector_id);

        return new WP_REST_Response('Usuário associado ao setor com sucesso.', 200);
    }

     // Função que retorna a lista de usuários associados a um setor
    public function get_sector_users($request) {

        $sector_id = sanitize_text_field($request['sector_id']);

        if (empty($sector_id)) {
            return new WP_REST_Response('Nome do setor vazio', 400); // Retorna erro se o nome estiver vazio
        }

        $users = $this->return_sector_users($sector_id);

        // Se não encontrar usuários, retorna um erro (talvez seja redundante por conta da funçao return_sector_users())
        //if (empty($users)) {
            //return new WP_REST_Response('Nenhum usuário encontrado para o setor especificado.', 404);
        //}

        return new WP_REST_Response($users, 200);
    }

    // Função que retorna lista de usuarios associados a um setor
    public function return_sector_users($sector_id){
        global $wpdb;

        // Consulta os IDs dos usuários associados ao setor
        $user_ids = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT user_id 
                FROM $wpdb->usermeta 
                WHERE meta_key = 'associated_sector' 
                AND meta_value = %s", 
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
        return $users;
    }

    public function get_all_sectors_with_users($request) {
        
        global $wpdb;
    
        // Recuperar setores já existentes no formato JSON
        $setores_json = get_option('obatala_setores', '{}'); // Recupera como JSON ou inicializa como um objeto vazio
        $setores = json_decode($setores_json, true);

        if (!is_array($setores)) {
            $setores = [];
        }
    
        $sectors_with_users = [];
    
        if (is_array($setores) && !empty($setores)) {
            foreach ($setores as $id => $sector_data) {
                $sector_id = $id;
                $sector_name = $sector_data['nome'];
                
                // Consulta os IDs dos usuários associados ao setor
                $user_ids = $wpdb->get_col(
                    $wpdb->prepare(
                        "SELECT user_id 
                         FROM $wpdb->usermeta 
                         WHERE meta_key = 'associated_sector' 
                         AND meta_value = %s", 
                         $sector_id,
                    )
                );
    
                // Obtém os dados dos usuários associados
                $users = [];
                if (!empty($user_ids)) {
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
                }
    
                // Adiciona o setor e seus usuários à lista
                $sectors_with_users[] = [
                    'sector_id' => $sector_id,
                    'sector_name' => $sector_name,
                    'users' => $users
                ];
            }
        }
    
        return new WP_REST_Response($sectors_with_users, 200);
    }

    public function remove_user_from_sector($request) {
        global $wpdb;
    
        $user_id = (int) $request['user_id'];
        $sector_id = sanitize_text_field($request['sector_id']);

        if (empty($sector_id)) {
            return new WP_REST_Response('Nome do setor vazio', 400); // Retorna erro se o nome estiver vazio
        }
        
        // Verifica se o usuário está associado ao setor
        $meta_exists = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) 
                 FROM $wpdb->usermeta 
                 WHERE meta_key = 'associated_sector' 
                 AND meta_value = %s 
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
}
