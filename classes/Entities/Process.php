<?php

namespace Obatala\Entities;

defined('ABSPATH') || exit;

class Process {

    public static function get_post_type() {
        return 'process_obatala';
    }

    public static function register_post_type() {
        $labels = array(
            'name'                  => _x('Processes', 'Post type general name', 'obatala'),
            'singular_name'         => _x('Process', 'Post type singular name', 'obatala'),
            'menu_name'             => _x('Process', 'Admin Menu text', 'obatala'),
            'name_admin_bar'        => _x('Process', 'Add New on Toolbar', 'obatala'),
            'add_new'               => __('Add New', 'obatala'),
            'add_new_item'          => __('Add New Process', 'obatala'),
            'new_item'              => __('New Process', 'obatala'),
            'edit_item'             => __('Edit Process', 'obatala'),
            'view_item'             => __('View Process', 'obatala'),
            'all_items'             => __('All Processes', 'obatala'),
            'search_items'          => __('Search Processes', 'obatala'),
            'parent_item_colon'     => __('Parent Process:', 'obatala'),
            'not_found'             => __('No process found.', 'obatala'),
            'not_found_in_trash'    => __('No process found in Trash.', 'obatala')
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'obatala_processes'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'menu_position'      => 99,
            'supports'           => array('title', 'author', 'comments'),
            'show_in_rest'       => true,
            'menu_icon'          => 'dashicons-media-document'
        );

        register_post_type(self::get_post_type(), $args);
    }

    public static function register_process_meta() {
        register_meta('post', 'process_type', [
            'type' => 'integer',
            'description' => 'Process Type ID',
            'single' => true,
            'show_in_rest' => true,
        ]);
    
        register_meta('post', 'current_stage', [
            'type' => 'integer',
            'description' => 'Current Stage ID',
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_meta('post', 'current_sector', [
            'type' => 'integer',
            'description' => 'Current Sector ID',
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_meta('comment', 'stage_id', [
            'type' => 'number',
            'description' => __('Estágio do Processo', 'obatala'),
            'single' => true,
            'show_in_rest' => true
        ]);

        register_meta('post', 'status', [
            'type' => 'string',
            'description' => __('Status do Processo', 'obatala'),
            'single' => true,
            'show_in_rest' => true,
            'default' => 'Stopped'
        ]);

        register_meta('post', 'is_deleted', [
            'type' => 'string',
            'description' => __('Indica se o processo foi excluído logicamente', 'obatala'),
            'single' => true,
            'show_in_rest' => true,
            'default' => '0',
        ]);

        register_meta('post', 'deleted_at', [
            'type' => 'string',
            'description' => __('Data da exclusão lógica', 'obatala'),
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_meta('post', 'deleted_by', [
            'type' => 'integer',
            'description' => __('Usuário que excluiu o processo', 'obatala'),
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_meta('post', 'deleted_by_name', [
            'type' => 'string',
            'description' => __('Nome do usuário que excluiu o processo', 'obatala'),
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_meta('post', 'numero_processo', [
            'type' => 'string',
            'description' => __('Número único do processo (AAAA-NNNNN-DV)', 'obatala'),
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_meta('post', 'ano_processo', [
            'type' => 'integer',
            'description' => __('Ano do número do processo', 'obatala'),
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_meta('post', 'sequencial_processo', [
            'type' => 'integer',
            'description' => __('Sequencial anual do processo', 'obatala'),
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_meta('post', 'digito_verificador_processo', [
            'type' => 'integer',
            'description' => __('Dígito verificador do número do processo', 'obatala'),
            'single' => true,
            'show_in_rest' => true,
        ]);
    }

    public static function is_deleted($process_id) {
        return get_post_meta((int) $process_id, 'is_deleted', true) === '1';
    }

    /**
     * @return array<string, mixed>|\WP_Error
     */
    public static function soft_delete($process_id, $user_id = null) {
        $process_id = (int) $process_id;
        $user_id = $user_id ?? get_current_user_id();

        if ($user_id <= 0) {
            return new \WP_Error(
                'obatala_soft_delete_no_user',
                __('Unable to record process deletion without an authenticated user.', 'obatala'),
                ['status' => 401]
            );
        }

        $user = get_userdata($user_id);
        $deleted_at = current_time('mysql');
        $deleted_by_name = $user ? (string) $user->display_name : '';

        update_post_meta($process_id, 'is_deleted', '1');
        update_post_meta($process_id, 'deleted_at', $deleted_at);
        update_post_meta($process_id, 'deleted_by', (int) $user_id);
        update_post_meta($process_id, 'deleted_by_name', $deleted_by_name);

        return [
            'deleted_at' => $deleted_at,
            'deleted_by' => (int) $user_id,
            'deleted_by_name' => $deleted_by_name,
        ];
    }

    public static function get_deletion_info($process_id) {
        if (!self::is_deleted($process_id)) {
            return null;
        }

        return [
            'deleted_at' => (string) get_post_meta((int) $process_id, 'deleted_at', true),
            'deleted_by' => (int) get_post_meta((int) $process_id, 'deleted_by', true),
            'deleted_by_name' => (string) get_post_meta((int) $process_id, 'deleted_by_name', true),
        ];
    }

    public static function init() {
        self::register_post_type();
        self::register_process_meta();
    }
}
