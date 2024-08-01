<?php

namespace Obatala\Entities;

defined('ABSPATH') || exit;

class ProcessStepCollection {

    public static function get_post_type() {
        return 'process_step';
    }

    public static function register_post_type() {
        $labels = array(
            'name'                  => _x('Process Steps', 'Post type general name', 'obatala'),
            'singular_name'         => _x('Process Step', 'Post type singular name', 'obatala'),
            'menu_name'             => _x('Process Steps', 'Admin Menu text', 'obatala'),
            'name_admin_bar'        => _x('Process Step', 'Add New on Toolbar', 'obatala'),
            'add_new'               => __('Add New', 'obatala'),
            'add_new_item'          => __('Add New Process Step', 'obatala'),
            'new_item'              => __('New Process Step', 'obatala'),
            'edit_item'             => __('Edit Process Step', 'obatala'),
            'view_item'             => __('View Process Step', 'obatala'),
            'all_items'             => __('All Process Steps', 'obatala'),
            'search_items'          => __('Search Process Steps', 'obatala'),
            'parent_item_colon'     => __('Parent Process Step:', 'obatala'),
            'not_found'             => __('No process steps found.', 'obatala'),
            'not_found_in_trash'    => __('No process steps found in Trash.', 'obatala')
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'process_steps'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => 99,
            'supports'           => array('title', 'comments'),
            'show_in_rest'       => true,
            'menu_icon'          => 'dashicons-media-document'
        );

        register_post_type(self::get_post_type(), $args);
    }

    public static function register_process_step_meta() {
        register_post_meta('process_step', 'process_type', [
            'type' => 'array',
            'description' => 'Process Type ID',
            'single' => false,
            'show_in_rest' => [
                'schema' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'integer'
                    ],
                ],
            ],
        ]);

        register_post_meta('process_step', 'parent_process', [
            'type' => 'integer',
            'description' => 'Parent Process ID',
            'single' => true,
            'show_in_rest' => true,
        ]);

    }

    public static function init() {
        self::register_post_type();
        self::register_process_step_meta();
    }
}

add_action('init', ['Obatala\Entities\ProcessStepCollection', 'init']);
