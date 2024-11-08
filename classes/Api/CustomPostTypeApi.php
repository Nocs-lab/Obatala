<?php

namespace Obatala\Api;

use WP_REST_Posts_Controller;
use WP_REST_Server;

class CustomPostTypeApi extends ObatalaAPI {

    /**
     * Registers the custom REST routes for various Obatala's post types.
     * WordPress will call this method when the REST API is initialized.
     * We need this method to register the routes on our own namespace.
     */
    public function register_routes() {
        // Register routes for 'process_obatala' post type
        $this->register_post_type_routes('process_obatala');

        // Register routes for 'process_type' post type
        $this->register_post_type_routes('process_type');
    }

    /**
     * Registers REST routes for a given custom post type.
     *
     * @param string $post_type The custom post type to register routes for.
     */
    protected function register_post_type_routes($post_type) {
        // Create a new WP_REST_Posts_Controller instance for the post type
        $controller = new WP_REST_Posts_Controller($post_type);

        // Register the collection route (to fetch multiple items)
        register_rest_route(self::NAMESPACE, '/' . $post_type, [
            [
                'methods' => WP_REST_Server::READABLE, // HTTP GET
                'callback' => function ($request) use ($controller, $post_type) {
                    // Retrieve the collection of items for this post type
                    $response = $controller->get_items($request);
                    if (!is_wp_error($response)) {
                        $data = $response->get_data();
                        // Add custom meta fields (like 'step_order' and 'flowData') to each item
                        foreach ($data as &$item) {
                            $meta = get_post_meta($item['id']);

                            // Deserialize 'step_order' if it exists
                            if (isset($meta['step_order'])) {
                                $meta['step_order'] = maybe_unserialize($meta['step_order'][0]);
                            }

                            // Deserialize 'flowData' if it exists
                            if (isset($meta['flowData'])) {
                                $meta['flowData'] = maybe_unserialize($meta['flowData'][0]);
                            }

                            $item['meta'] = $meta; // Attach meta data to the item
                        }
                        $response->set_data($data); // Update response with modified data
                    }
                    return $response; // Return the final response
                },
                'permission_callback' => [$controller, 'get_items_permissions_check'], // Check for permissions
                'args' => $controller->get_collection_params(), // Arguments for the collection
            ],
            [
                'methods' => WP_REST_Server::CREATABLE, // HTTP POST
                'callback' => [$controller, 'create_item'], // Callback for creating an item
                'permission_callback' => [$controller, 'create_item_permissions_check'], // Check for permissions
                'args' => $controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE), // Arguments for item creation
            ],
        ]);

        // Register single item routes (to fetch, update, or delete a single item)
        register_rest_route(self::NAMESPACE, '/' . $post_type . '/(?P<id>[\d]+)', [
            [
                'methods' => WP_REST_Server::READABLE, // HTTP GET for a single item
                'callback' => function ($request) use ($controller, $post_type) {
                    // Retrieve the single item by ID
                    $response = $controller->get_item($request);
                    if (!is_wp_error($response)) {
                        $data = $response->get_data();
                        $meta = get_post_meta($data['id']);

                        // Deserialize 'step_order' if it exists
                        if (isset($meta['step_order'])) {
                            $meta['step_order'] = maybe_unserialize($meta['step_order'][0]);
                        }

                        // Deserialize 'flowData' if it exists
                        if (isset($meta['flowData'])) {
                            $meta['flowData'] = maybe_unserialize($meta['flowData'][0]);
                        }

                        $data['meta'] = $meta; // Attach meta data to the item
                        $response->set_data($data); // Update response with modified data
                    }
                    return $response; // Return the final response
                },
                'permission_callback' => [$controller, 'get_item_permissions_check'], // Check for permissions
                'args' => [
                    'context' => [
                        'default' => 'view', // Default view context
                    ],
                ],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE, // HTTP PUT for updating an item
                'callback' => [$controller, 'update_item'], // Callback for updating an item
                'permission_callback' => [$controller, 'update_item_permissions_check'], // Check for permissions
                'args' => $controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE), // Arguments for item update
            ],
            [
                'methods' => WP_REST_Server::DELETABLE, // HTTP DELETE for deleting an item
                'callback' => [$controller, 'delete_item'], // Callback for deleting an item
                'permission_callback' => [$controller, 'delete_item_permissions_check'], // Check for permissions
                'args' => [
                    'force' => [
                        'default' => false, // Whether to force delete
                    ],
                ],
            ],
        ]);

        // Register the schema route (to fetch the schema of the post type)
        register_rest_route(self::NAMESPACE, '/' . $post_type . '/schema', [
            'methods' => WP_REST_Server::READABLE, // HTTP GET for the schema
            'callback' => [$controller, 'get_public_item_schema'], // Callback for fetching the schema
            'permission_callback' => '__return_true', // No permission check needed for schema
        ]);
    }
}
