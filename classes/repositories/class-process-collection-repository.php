<?php

namespace Obatala;

use Obatala\ProcessCollection;

defined('ABSPATH') or die('No script kiddies please!');

class ProcessCollectionRepository {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function register_post_type() {
        $labels = array(
            'name'                  => _x('Process Collections', 'Post type general name', 'obatala'),
            'singular_name'         => _x('Process Collection', 'Post type singular name', 'obatala'),
            'menu_name'             => _x('Process Collections', 'Admin Menu text', 'obatala'),
            'name_admin_bar'        => _x('Process Collection', 'Add New on Toolbar', 'obatala'),
            'add_new'               => __('Add New', 'obatala'),
            'add_new_item'          => __('Add New Process Collection', 'obatala'),
            'new_item'              => __('New Process Collection', 'obatala'),
            'edit_item'             => __('Edit Process Collection', 'obatala'),
            'view_item'             => __('View Process Collection', 'obatala'),
            'all_items'             => __('All Process Collections', 'obatala'),
            'search_items'          => __('Search Process Collections', 'obatala'),
            'parent_item_colon'     => __('Parent Process Collections:', 'obatala'),
            'not_found'             => __('No process collections found.', 'obatala'),
            'not_found_in_trash'    => __('No process collections found in Trash.', 'obatala')
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
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array('title', 'editor', 'author', 'thumbnail', 'excerpt', 'comments'),
            'show_in_rest'       => true
        );

        register_post_type('process_collection', $args);
    }

    public function init() {
        add_action('init', array($this, 'register_post_type'));
    }
}

// Initialize the repository
$process_collection_repository = ProcessCollectionRepository::get_instance();
$process_collection_repository->init();
