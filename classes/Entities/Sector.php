<?php

namespace Obatala\Entities;

class Sector {

  // inplementar metodo init
  
  // Função para verificar a permissão
  public static function check_permission($process_id) {
    
    // Verifica se o usuário está autenticado
    $user = wp_get_current_user();
    //print_r($user);
    if ($user->ID === 0) {
      return [
        'status' => false,
        'message' => 'Usuário não autenticado.',
        'data' => $user
        ];
    }

    // Pega os setores associados ao usuário
    $user_sectors = get_user_meta($user->ID, 'associated_sector', false);

    // Pega o sector_id atual do precess
    $sector_id = get_post_meta($process_id,'current_sector', true);

    // Verifica se o usuário possui setores associados
    if (!empty($user_sectors) && is_array($user_sectors)) {
      // Verifica se algum setor do usuário é igual ao setor_id fornecido
      foreach ($user_sectors as $sector) {
        if (in_array($sector_id, $sector)) {
          return [
            'status' => true,
            'message' => 'Permissão concedida.',
            'Cargo:' => $user->roles
            ];
        }
      }
          return [
              'status' => false,
              'message' => 'Usuário não possui permissão.'
          ];
      } else {
      return [
        'status' => false,
        'message' => 'Usuário não possui setores vinculados.'
        ];
    }
  }

  // Função que retorna lista de usuarios associados a um setor
  public static function return_sector_users($sector_id) {
    // Consulta os IDs dos usuários que possuem 'associated_sector' nos metadados
    $user_query = get_users(array(
        'meta_key'   => 'associated_sector', // Chave do meta valor associado ao setor
        'fields'     => 'ID'                 // Retorna apenas os IDs dos usuários
    ));

    if (empty($user_query)) {
        return null; // Se não encontrar nenhum usuário, retorna null
    }

    // Buscar os dados dos usuários com base nos IDs e verificar se o setor está associado
    $users = [];
    foreach ($user_query as $user_id) {
        $sectors = get_user_meta($user_id, 'associated_sector', true);

        // Verifica se o setor realmente está associado ao usuário (em caso de array serializado)
        if (is_array($sectors) && in_array($sector_id, $sectors)) {
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
    return $users; // Retorna a lista de usuários associados ao setor
  }

}