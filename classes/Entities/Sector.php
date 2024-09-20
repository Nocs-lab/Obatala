<?php

namespace Obatala\Entities;

defined('ABSPATH') || exit;

class Sector {

    public static function get_post_type() {
        return 'sector_obatala';
    }

    public static function register_post_type() {
        $labels = array(
            'name'                  => _x('Setores', 'Post type general name', 'obatala'),
            'singular_name'         => _x('Setor', 'Post type singular name', 'obatala'),
            'menu_name'             => _x('Setor', 'Admin Menu text', 'obatala'),
            'name_admin_bar'        => _x('Setor', 'Add New on Toolbar', 'obatala'),
            'add_new'               => __('Adicionar Novo', 'obatala'),
            'add_new_item'          => __('Adicionar Novo Setor', 'obatala'),
            'new_item'              => __('Novo Setor', 'obatala'),
            'edit_item'             => __('Editar Setor', 'obatala'),
            'view_item'             => __('Ver Setor', 'obatala'),
            'all_items'             => __('Todos os Setores', 'obatala'),
            'search_items'          => __('Procurar Setores', 'obatala'),
            'not_found'             => __('Nenhum setor encontrado.', 'obatala'),
            'not_found_in_trash'    => __('Nenhum setor encontrado na lixeira.', 'obatala')
        );

        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'obatala_sectors'),
            'capability_type'    => 'post',
            'capabilities'       => array(
                'edit_post'          => 'edit_post',
                'read_post'          => 'read_post',
                'delete_post'        => 'delete_post',
                'edit_posts'         => 'edit_posts',
                'edit_others_posts'  => 'edit_others_posts',
                'publish_posts'      => 'publish_posts',
                'read_private_posts' => 'read_private_posts'
            ),
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => 100,
            'supports'           => array('title', 'editor'),
            'show_in_rest'       => true,
            'menu_icon'          => 'dashicons-building'
        );

        error_log('Post type registered: ' . self::get_post_type()); // Log para depuração

        register_post_type(self::get_post_type(), $args);
    }

    public static function register_sector_meta() {
        // Registrando o metadado para a descrição do setor
        register_post_meta(self::get_post_type(), 'sector_description', [
            'type' => 'string',
            'description' => 'Descrição do Setor',
            'single' => true,
            'show_in_rest' => true, // Isso garante que o metadado será acessível via API REST
        ]);
    }

    public static function init() {
        self::register_post_type();
        self::register_sector_meta();
    }
}