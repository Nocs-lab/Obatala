<?php

namespace Obatala\Entities;

class Teste {

  private static $current_user;
    
  public static function get_user_id() {
    if (!isset(self::$current_user) || self::$current_user === 0) {
        self::$current_user = get_current_user_id();
    }
    return self::$current_user;
  }

  // Função para verificar a permissão
  public function check_permission($sector_id) {
    // Verifica se o usuário está autenticado
    if (self::$current_user === 0) {
      return [
        'status' => false,
        'message' => 'Usuário não autenticado.'
        ];
    }

    // Pega os setores associados ao usuário
    $user_sectors = get_user_meta(self::$current_user, 'associated_sector', false);

    // Verifica se o usuário possui setores associados
    if (!empty($user_sectors) && is_array($user_sectors)) {
      // Verifica se algum setor do usuário é igual ao setor_id fornecido
      foreach ($user_sectors as $sector) {
        if (in_array($sector_id, $sector)) {
          return [
            'status' => true,
            'message' => 'Permissão concedida.'
            ];
        }
      }
          return [
              'status' => false,
              'message' => 'Usuário não possui permissão para este setor.'
          ];
      } else {
      return [
        'status' => false,
        'message' => 'Usuário não possui setores vinculados.'
        ];
    }
  }

}