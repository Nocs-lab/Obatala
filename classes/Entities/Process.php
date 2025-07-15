<?php

namespace Obatala\Entities;

defined('ABSPATH') || exit;

class Process {

    public static function get_post_type() {
        return 'process_obatala';
    }

    public static function register_post_type() {
        $labels = array(
            'name'                  => _x('Processes', 'Post type general name', 'Obatala'),
            'singular_name'         => _x('Process', 'Post type singular name', 'Obatala'),
            'menu_name'             => _x('Process', 'Admin Menu text', 'Obatala'),
            'name_admin_bar'        => _x('Process', 'Add New on Toolbar', 'Obatala'),
            'add_new'               => __('Add New', 'Obatala'),
            'add_new_item'          => __('Add New Process', 'Obatala'),
            'new_item'              => __('New Process', 'Obatala'),
            'edit_item'             => __('Edit Process', 'Obatala'),
            'view_item'             => __('View Process', 'Obatala'),
            'all_items'             => __('All Processes', 'Obatala'),
            'search_items'          => __('Search Processes', 'Obatala'),
            'parent_item_colon'     => __('Parent Process:', 'Obatala'),
            'not_found'             => __('No process found.', 'Obatala'),
            'not_found_in_trash'    => __('No process found in Trash.', 'Obatala')
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
            'description' => __('Estágio do Processo', 'Obatala'),
            'single' => true,
            'show_in_rest' => true
        ]);

        register_meta('post', 'status', [
            'type' => 'string',
            'description' => __('Status do Processo', 'Obatala'),
            'single' => true,
            'show_in_rest' => true,
            'default' => 'Stopped'
        ]);
    }

    public static function init() {
        self::register_post_type();
        self::register_process_meta();
    }
}
