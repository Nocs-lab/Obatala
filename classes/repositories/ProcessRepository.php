<?php

namespace Obatala;

defined('ABSPATH') || exit;

class ProcessCollection {
    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function register_post_type() {
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
            'all_items'             => __('All Process', 'obatala'),
            'search_items'          => __('Search Process', 'obatala'),
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
            'rewrite'            => array('slug' => 'process_collection'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'author', 'comments'),
            'show_in_rest'       => true
        );

        register_post_type('process_collection', $args);
        $this->register_taxonomies();
    }

    private function register_taxonomies() {
        // Register process_type taxonomy
        register_taxonomy('process_type', 'process_collection', array(
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

        // Register process_step taxonomy
        register_taxonomy('process_step', 'process_collection', array(
            'labels' => array(
                'name' => _x('Process Steps', 'taxonomy general name', 'obatala'),
                'singular_name' => _x('Process Step', 'taxonomy singular name', 'obatala'),
                'search_items' => __('Search Process Steps', 'obatala'),
                'all_items' => __('All Process Steps', 'obatala'),
                'parent_item' => __('Parent Process Step', 'obatala'),
                'parent_item_colon' => __('Parent Process Step:', 'obatala'),
                'edit_item' => __('Edit Process Step', 'obatala'),
                'update_item' => __('Update Process Step', 'obatala'),
                'add_new_item' => __('Add New Process Step', 'obatala'),
                'new_item_name' => __('New Process Step Name', 'obatala'),
                'menu_name' => __('Process Steps', 'obatala'),
            ),
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'hierarchical' => false,
        ));
    }

    public function init() {
        add_action('init', [$this, 'register_post_type']);
    }
}
