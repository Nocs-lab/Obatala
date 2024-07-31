<?php

namespace Obatala\Api;

use WP_REST_Posts_Controller;
use WP_REST_Server;

class CustomPostTypeApi extends ObatalaAPI {

    public function register_routes() {
        // Register routes for process_obatala
        $this->register_post_type_routes('process_obatala');
        
        // Register routes for process_step
        $this->register_post_type_routes('process_step');
        
        // Register routes for process_type
        $this->register_post_type_routes('process_type');
    }

    /**
     * Registers routes for a custom post type
     *
     * @param string $post_type
     */
    protected function register_post_type_routes($post_type) {
        $controller = new WP_REST_Posts_Controller($post_type);

        // Register collection route
        register_rest_route(self::NAMESPACE, '/' . $post_type, [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$controller, 'get_items'],
                'permission_callback' => [$controller, 'get_items_permissions_check'],
                'args' => $controller->get_collection_params(),
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [$controller, 'create_item'],
                'permission_callback' => [$controller, 'create_item_permissions_check'],
                'args' => $controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
            ],
        ]);

        // Register single item routes
        register_rest_route(self::NAMESPACE, '/' . $post_type . '/(?P<id>[\d]+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$controller, 'get_item'],
                'permission_callback' => [$controller, 'get_item_permissions_check'],
                'args' => [
                    'context' => [
                        'default' => 'view',
                    ],
                ],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [$controller, 'update_item'],
                'permission_callback' => [$controller, 'update_item_permissions_check'],
                'args' => $controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [$controller, 'delete_item'],
                'permission_callback' => [$controller, 'delete_item_permissions_check'],
                'args' => [
                    'force' => [
                        'default' => false,
                    ],
                ],
            ],
        ]);

        // Register schema route
        register_rest_route(self::NAMESPACE, '/' . $post_type . '/schema', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$controller, 'get_public_item_schema'],
            'permission_callback' => '__return_true',
        ]);
    }
}
