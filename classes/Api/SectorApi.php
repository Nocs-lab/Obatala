<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;


class SectorApi extends ObatalaAPI {

    public function register_routes() {

        error_log('Registering routes');

        // Route to create a new sector
        $this->add_route('create_sector_obatala', [
            'methods' => 'POST',
            'callback' => ['Obatala\Entities\Sector', 'add_sector'],
            'permission_callback' => '__return_true',
            'args' => [
                'sector_name' => [
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return !empty($param);
                    }
                ],
                'sector_description' => [
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return !empty($param);
                    }
                ],
                'sector_status' => [
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return !empty($param);
                    }
                ],
            ]
        ]);

        // Route to get the sector by ID
        $this->add_route('get_sector_obatala/(?P<sector_id>[a-zA-Z0-9_\-.]+)', [
            'methods' => 'GET',
            'callback' => ['Obatala\Entities\Sector', 'get_sector'],
            'permission_callback' => '__return_true',
        ]);

        // Route to get all sectors
        $this->add_route('all_sector_obatala', [
            'methods' => 'GET',
            'callback' => ['Obatala\Entities\Sector', 'get_all_sectors'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update sector by ID
        $this->add_route('update_sector_obatala/(?P<sector_id>[a-zA-Z0-9_\-.]+)', [
            'methods' => 'POST',
            'callback' => ['Obatala\Entities\Sector', 'update_sector'],
            'permission_callback' => '__return_true',
        ]);

        //Route to delete sector
        $this->add_route('delete_sector_obatala/(?P<sector_id>[a-zA-Z0-9_\-.]+)', [
            'methods' => 'DELETE',
            'callback' => ['Obatala\Entities\Sector', 'delete_sector'],
            'permission_callback' => '__return_true'
        ]);

        // Route to get all users
        $this->add_route('sector_obatala/users_obatala', [
            'methods' => 'GET',
            'callback' => ['Obatala\Entities\Sector', 'get_all_users'],
            'permission_callback' => '__return_true',
        ]);

        // Rota para associar um usuário a um setor
        $this->add_route('associate_user_to_sector', [
            'methods' => 'POST',
            'callback' => ['Obatala\Entities\Sector', 'associate_user_to_sector'],
            'permission_callback' => '__return_true',
            'args' => [
                'user_id' => [
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return is_numeric($param) && $param > 0;
                    }
                ],
                'sector_id' => [
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return is_string($param) && $param > 0;
                    }
                ],
            ]
        ]);

        // Route to return users of a specific sector
        $this->add_route('sector_obatala/(?P<sector_id>[a-zA-Z0-9_\-.]+)/users', [
            'methods' => 'GET',
            'callback' => ['Obatala\Entities\Sector', 'get_sector_users'],
            'permission_callback' => '__return_true',
        ]);

        // Rota para obter todos os setores e seus usuários associados
        $this->add_route('sector_obatala/sectors_with_users', [
            'methods' => 'GET',
            'callback' => ['Obatala\Entities\Sector', 'get_all_sectors_with_users'],
            'permission_callback' => '__return_true', // Altere se quiser aplicar regras de permissão
        ]);

        // Rota para remover um usuário de um setor
        $this->add_route('sector_obatala/(?P<sector_id>[a-zA-Z0-9_\-.]+)/remove_user', [
            'methods' => 'POST',
            'callback' => ['Obatala\Entities\Sector', 'remove_user_from_sector'],
            'permission_callback' => '__return_true', // Altere se quiser aplicar regras de permissão
            'args' => [
                'user_id' => [
                    'required' => true,
                    'validate_callback' => function ($param) {
                        return is_numeric($param);
                    }
                ],
            ]
        ]);
    }
}
