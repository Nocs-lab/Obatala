<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

use WP_REST_Response;
use WP_Query;

class SectorApi extends ObatalaAPI {

    public function register_routes() {

        error_log('Registering routes');

        // Route to create a new sector
        $this->add_route('sector_obatala', [
            'methods' => 'POST',
            'callback' => [$this, 'create_sector'],
            'permission_callback' => '__return_true',
            'args' => [
                'sector_name' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ],
            ] 
        ]);

        // Route to get the sector by ID
        $this->add_route('sector_obatala/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_sector'],
            'permission_callback' => '__return_true',
        ]);

        // Route to get all sectors
        $this->add_route('all_sector_obatala', [
            'methods' => 'GET',
            'callback' => [$this, 'get_all_sectors'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update sector by ID
        $this->add_route('sector_obatala/(?P<id>\d+)', [
            'methods' => 'POST',
            'callback' => [$this, 'update_sector'],
            'permission_callback' => '__return_true',
            'args' => [
                'sector_name' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ]
            ]
        ]);

        // Route to get sector meta fields
        $this->add_route('sector_obatala/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [$this, 'get_meta'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update sector meta fields
        $this->add_route('sector_obatala/(?P<id>\d+)/meta', [
            'methods' => 'POST',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => '__return_true',
            'args' => [
                'description' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return !empty($param);
                    }
                ]
            ]
        ]);
    }

    public function create_sector($request) {

        error_log('create_sector function called');
        
        $sector_name = sanitize_text_field($request['sector_name']);
        
        if (empty($sector_name)) {
            return new WP_REST_Response('Nome do setor vazio', 400); // Retorna erro se o nome estiver vazia
        }
        $post_id = wp_insert_post([
            'post_title' => $sector_name,
            'post_type' => 'sector_obatala',
            'post_status' => 'publish'
        ]);


        if ($post_id && !is_wp_error($post_id)) {
                return new WP_REST_Response('Sector created', 201);
        } else {
            return new WP_REST_Response('Error creating sector', 500);
        }
    }

    public function get_sector($request) {
        $post_id = (int) $request['id'];
        $post = get_post($post_id);

        if ($post) {
            return [
                'id' => $post->ID,
                'title' => $post->post_title,
                'content' => $post->post_content,
            ];
        } else {
            return new WP_REST_Response('Sector not found.', 404);
        }
    }

    public function get_all_sectors($request) {
        error_log('retorne sector function called');

        $query = new WP_Query([
            'post_type' => 'sector_obatala',
            'post_status' => 'publish',
            'posts_per_page' => -1, 
        ]);

        
        $sectors = [];

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $sectors[] = [
                    'id' => get_the_ID(),
                    'title' => get_the_title(),
                    'content' => get_the_content(),
                ];
            }
            wp_reset_postdata();
        }

        return $sectors;
    }

    public function update_sector($request) {
        $post_id = (int) $request['id'];
        $sector_name = sanitize_text_field($request['sector_name']);

        $result = wp_update_post([
            'ID' => $post_id,
            'post_title' => $sector_name,
        ]);

        if ($result && !is_wp_error($result)) {
            return new WP_REST_Response('Sector updated successfully', 200);
        } else {
            return new WP_REST_Response('Error updating sector', 500);
        }
    }

    public function get_meta($request) {
        $post_id = (int) $request['id'];
        $meta = get_post_meta($post_id);

        return $meta;
    }

    public function update_meta($request) {
        $post_id = (int) $request['id'];

        $description = sanitize_text_field($request['description']);

        update_post_meta($post_id, "sector_description", $description);
        

        return new WP_REST_Response('Meta fields updated successfully', 200);
    } 
}
