<?php

namespace Obatala\Entities;

defined('ABSPATH') || exit;

class ProcessTypeCollection {

    public static function get_post_type() {
        return 'process_type';
    }

    public static function register_post_type() {
        $labels = array(
            'name'                  => _x('Process Types', 'Post type general name', 'obatala'),
            'singular_name'         => _x('Process Type', 'Post type singular name', 'obatala'),
            'menu_name'             => _x('Process Types', 'Admin Menu text', 'obatala'),
            'name_admin_bar'        => _x('Process Type', 'Add New on Toolbar', 'obatala'),
            'add_new'               => __('Add New', 'obatala'),
            'add_new_item'          => __('Add New Process Type', 'obatala'),
            'new_item'              => __('New Process Type', 'obatala'),
            'edit_item'             => __('Edit Process Type', 'obatala'),
            'view_item'             => __('View Process Type', 'obatala'),
            'all_items'             => __('All Process Types', 'obatala'),
            'search_items'          => __('Search Process Types', 'obatala'),
            'parent_item_colon'     => __('Parent Process Type:', 'obatala'),
            'not_found'             => __('No process types found.', 'obatala'),
            'not_found_in_trash'    => __('No process types found in Trash.', 'obatala')
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'process_types'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => 99,
            'supports'           => array('title'),
            'show_in_rest'       => true,
            'menu_icon'          => 'dashicons-media-document'
        );

        register_post_type(self::get_post_type(), $args);
    }

    public static function register_process_type_meta() {
        register_post_meta('process_type', 'accept_attachments', [
            'type' => 'boolean',
            'description' => 'Accept attachments',
            'single' => true,
            'show_in_rest' => true,
        ]);
    
        register_post_meta('process_type', 'accept_tainacan_items', [
            'type' => 'boolean',
            'description' => 'Accept Tainacan items',
            'single' => true,
            'show_in_rest' => true,
        ]);
    
        register_post_meta('process_type', 'generate_tainacan_items', [
            'type' => 'boolean',
            'description' => 'Generate Tainacan items',
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_post_meta('process_type', 'description', [
            'type' => 'string',
            'description' => 'Process Type Description',
            'single' => true,
            'show_in_rest' => true,
        ]);
    }

    public static function init() {
        self::register_post_type();
        self::register_process_type_meta();
    }
}

add_action('init', ['Obatala\Entities\ProcessTypeCollection', 'init']);
