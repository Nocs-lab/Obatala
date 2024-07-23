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
            'type' => 'integer',
            'description' => 'Process Type ID',
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_post_meta('process_step', 'parent_process', [
            'type' => 'integer',
            'description' => 'Parent Process ID',
            'single' => true,
            'show_in_rest' => true,
        ]);

        register_post_meta('process_step', 'sector', [
            'type' => 'integer',
            'description' => 'Sector ID',
            'single' => true,
            'show_in_rest' => true,
        ]);
    }

    public static function register_taxonomy() {
        $labels = array(
            'name'              => _x('Sectors', 'taxonomy general name', 'obatala'),
            'singular_name'     => _x('Sector', 'taxonomy singular name', 'obatala'),
            'search_items'      => __('Search Sectors', 'obatala'),
            'all_items'         => __('All Sectors', 'obatala'),
            'parent_item'       => __('Parent Sector', 'obatala'),
            'parent_item_colon' => __('Parent Sector:', 'obatala'),
            'edit_item'         => __('Edit Sector', 'obatala'),
            'update_item'       => __('Update Sector', 'obatala'),
            'add_new_item'      => __('Add New Sector', 'obatala'),
            'new_item_name'     => __('New Sector Name', 'obatala'),
            'menu_name'         => __('Sectors', 'obatala'),
        );

        $args = array(
            'hierarchical'      => true,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'rewrite'           => array('slug' => 'sector'),
            'show_in_rest'      => true,
        );

        register_taxonomy('sector', array('process_step'), $args);
    }

    public static function init() {
        self::register_post_type();
        self::register_process_step_meta();
        self::register_taxonomy();
    }
}

add_action('init', ['Obatala\Entities\ProcessStepCollection', 'init']);