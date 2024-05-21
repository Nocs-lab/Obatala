<?php

namespace Obatala\Entities;

defined('ABSPATH') || exit;

class ProcessStepCollection {
    private static $instance = null;

    public static function get_post_type() {
        return 'step_obatala';
    }

    public static function register_post_type() {
        $labels = array(
            'name'                  => _x('Process Steps', 'Post type general name', 'obatala'),
            'singular_name'         => _x('Step', 'Post type singular name', 'obatala'),
            'menu_name'             => _x('Step', 'Admin Menu text', 'obatala'),
            'name_admin_bar'        => _x('Step', 'Add New on Toolbar', 'obatala'),
            'add_new'               => __('Add New', 'obatala'),
            'add_new_item'          => __('Add New Step', 'obatala'),
            'new_item'              => __('New Step', 'obatala'),
            'edit_item'             => __('Edit Step', 'obatala'),
            'view_item'             => __('View Step', 'obatala'),
            'all_items'             => __('All Step', 'obatala'),
            'search_items'          => __('Search Step', 'obatala'),
            'parent_item_colon'     => __('Parent Step:', 'obatala'),
            'not_found'             => __('No step found.', 'obatala'),
            'not_found_in_trash'    => __('No step found in Trash.', 'obatala')
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'processes'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => true,
            'menu_position'      => -1,
            'supports'           => array('title', 'editor', 'author', 'comments'),
            'show_in_rest'       => true,
            'menu_icon'               => 'dashicons-media-spreadsheet'
        );

        register_post_type(self::get_post_type(), $args);
    }

    public static function register_taxonomies() {
        // Register process_type taxonomy
        register_taxonomy('step_type', 'obatala_steps', array(
            'labels' => array(
                'name' => _x('Steps Types', 'taxonomy general name', 'obatala'),
                'singular_name' => _x('Step Type', 'taxonomy singular name', 'obatala'),
                'search_items' => __('Search Step Types', 'obatala'),
                'all_items' => __('All Step Types', 'obatala'),
                'parent_item' => __('Parent Step Type', 'obatala'),
                'parent_item_colon' => __('Parent Step Type:', 'obatala'),
                'edit_item' => __('Edit Step Type', 'obatala'),
                'update_item' => __('Update Step Type', 'obatala'),
                'add_new_item' => __('Add New Step Type', 'obatala'),
                'new_item_name' => __('New Step Type Name', 'obatala'),
                'menu_name' => __('Step Types', 'obatala'),
            ),
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'hierarchical' => true,
        ));
    }

    public static function init() {
        self::register_post_type();
        self::register_taxonomies();
    }
}
