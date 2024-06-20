<?php

namespace Obatala\Entities;

defined('ABSPATH') || exit;

class ProcessCollection {

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
            'supports'           => array('title', 'editor', 'author', 'comments'),
            'show_in_rest'       => true,
            'menu_icon'               => 'dashicons-media-document'
        );

        register_post_type(self::get_post_type(), $args);
    }

    public static function register_taxonomies() {
        // Register process_type taxonomy
        register_taxonomy('process_type', self::get_post_type(), array(
            'labels' => array(
                'name' => _x('Process Types', 'taxonomy general name', 'obatala'),
                'singular_name' => _x('Process Type', 'taxonomy singular name', 'obatala'),
                'search_items' => __('Search Process Types', 'obatala'),
                'all_items' => __('All Process Types', 'obatala'),
                'parent_item' => __('Parent Process Type', 'obatala'),
                'parent_item_colon' => __('Parent Process Type:', 'obatala'),
                'edit_item' => __('Edit Process Type', 'obatala'),
                'update_item' => __('Update Process Type', 'obatala'),
                'add_new_item' => __('Add New Process Type', 'obatala'),
                'new_item_name' => __('New Process Type Name', 'obatala'),
                'menu_name' => __('Process Types', 'obatala'),
            ),
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'hierarchical' => true,
        ));
    }

    public static function register_process_meta() {
        register_meta('process_obatala', 'process_type', [
            'type' => 'integer',
            'description' => 'Process Type ID',
            'single' => true,
            'show_in_rest' => true,
        ]);
    
        register_meta('process_obatala', 'current_stage', [
            'type' => 'integer',
            'description' => 'Current Stage ID',
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_meta('comment', 'stage_id', [
            'type' => 'number',
            'description' => __('Estágio do Processo', 'obatala'),
            'single' => true,
            'show_in_rest' => true
        ]);
    }
   

    public static function init() {
        self::register_post_type();
        self::register_taxonomies();
        self::register_process_meta();
    }
}
