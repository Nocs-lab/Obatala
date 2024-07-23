<?php
namespace Obatala\User;

/**
 * Classe para gerenciar metas de usuário.
 */
class UserMetaManager {
    /**
     * Registra a meta `sector_ids` para os usuários.
     */
    public static function register_user_sector_meta() {
        register_meta('user', 'sector_ids', array(
            'type' => 'array',
            'description' => 'Setores vinculados ao usuário',
            'single' => true,
            'show_in_rest' => array(
                'schema' => array(
                    'type' => 'array',
                    'items' => array(
                        'type' => 'integer',
                    ),
                ),
            ),
            'auth_callback' => function() {
                return current_user_can('edit_user', get_current_user_id());
            },
            'sanitize_callback' => function($meta_value) {
                // Garanta que cada item no array é um inteiro
                if (is_array($meta_value)) {
                    return array_map('intval', $meta_value);
                }
                return $meta_value;
            },
        ));
    }
}