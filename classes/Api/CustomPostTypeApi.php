<?php

namespace Obatala\Api;

use Obatala\Entities\Process;
use Obatala\Services\TainacanMappingService;
use WP_Error;
use WP_REST_Posts_Controller;
use WP_REST_Response;
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
                        $mapping_service = new TainacanMappingService();
                        // Add custom meta fields (like 'step_order' and 'flowData') to each item
                        if ($post_type === 'process_obatala') {
                            $data = array_values(array_filter($data, function ($item) {
                                return !Process::is_deleted($item['id']);
                            }));
                        }

                        foreach ($data as &$item) {
                            $meta = get_post_meta($item['id']);

                            // Deserialize 'step_order' if it exists
                            if (isset($meta['step_order'])) {
                                $meta['step_order'] = maybe_unserialize($meta['step_order'][0]);
                            }

                            // Deserialize 'flowData' if it exists
                            if (isset($meta['flowData'])) {
                                $flow_data = maybe_unserialize($meta['flowData'][0]);

                                if (is_array($flow_data) && isset($flow_data['nodes']) && is_array($flow_data['nodes'])) {
                                    if ($post_type === 'process_type') {
                                        $flow_data = $mapping_service->apply_profile_options_to_flow_data((int) $item['id'], $flow_data);
                                    } elseif ($post_type === 'process_obatala') {
                                        $process_type_id = isset($meta['process_type'][0]) ? (int) $meta['process_type'][0] : 0;
                                        if ($process_type_id > 0) {
                                            $mapping_config = $mapping_service->get_mapping_config_for_process((int) $item['id'], $process_type_id);
                                            $flow_data = $mapping_service->apply_profile_options_to_flow_data_from_config($flow_data, $mapping_config);
                                        }
                                    }
                                }

                                $meta['flowData'] = $flow_data;
                            }

                            $item['meta'] = $meta; // Attach meta data to the item
                        }
                        $response->set_data($data); // Update response with modified data
                    }
                    return $response; // Return the final response
                },
                'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'], // Check for permissions
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

                        if ($post_type === 'process_obatala' && Process::is_deleted($data['id'])) {
                            return new WP_Error(
                                'rest_post_invalid_id',
                                __('Process not found.', 'obatala'),
                                ['status' => 404]
                            );
                        }

                        $meta = get_post_meta($data['id']);
                        $mapping_service = new TainacanMappingService();

                        // Deserialize 'step_order' if it exists
                        if (isset($meta['step_order'])) {
                            $meta['step_order'] = maybe_unserialize($meta['step_order'][0]);
                        }

                        // Deserialize 'flowData' if it exists
                        if (isset($meta['flowData'])) {
                            $flow_data = maybe_unserialize($meta['flowData'][0]);

                            if (is_array($flow_data) && isset($flow_data['nodes']) && is_array($flow_data['nodes'])) {
                                if ($post_type === 'process_type') {
                                    $flow_data = $mapping_service->apply_profile_options_to_flow_data((int) $data['id'], $flow_data);
                                } elseif ($post_type === 'process_obatala') {
                                    $process_type_id = isset($meta['process_type'][0]) ? (int) $meta['process_type'][0] : 0;
                                    if ($process_type_id > 0) {
                                        $mapping_config = $mapping_service->get_mapping_config_for_process((int) $data['id'], $process_type_id);
                                        $flow_data = $mapping_service->apply_profile_options_to_flow_data_from_config($flow_data, $mapping_config);
                                    }
                                }
                            }

                            $meta['flowData'] = $flow_data;
                        }

                        $data['meta'] = $meta; // Attach meta data to the item
                        $response->set_data($data); // Update response with modified data
                    }
                    return $response; // Return the final response
                },
                'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'], // Check for permissions
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
                'callback' => $post_type === 'process_obatala'
                    ? [$this, 'soft_delete_process']
                    : [$controller, 'delete_item'],
                'permission_callback' => [$controller, 'delete_item_permissions_check'],
                'args' => [
                    'force' => [
                        'default' => false,
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

    /**
     * Exclusão lógica de um processo (marca meta is_deleted em vez de remover o post).
     */
    public function soft_delete_process($request) {
        $process_id = (int) $request['id'];
        $post = get_post($process_id);

        if (!$post || $post->post_type !== Process::get_post_type()) {
            return new WP_Error(
                'rest_post_invalid_id',
                __('Process not found.', 'obatala'),
                ['status' => 404]
            );
        }

        if (Process::is_deleted($process_id)) {
            return new WP_Error(
                'rest_post_already_deleted',
                __('Process already deleted.', 'obatala'),
                ['status' => 410]
            );
        }

        $deletion = Process::soft_delete($process_id);
        if (is_wp_error($deletion)) {
            return $deletion;
        }

        return new WP_REST_Response([
            'deleted' => true,
            'id' => $process_id,
            'message' => __('Process deleted successfully.', 'obatala'),
            'deleted_at' => $deletion['deleted_at'],
            'deleted_by' => $deletion['deleted_by'],
            'deleted_by_name' => $deletion['deleted_by_name'],
        ], 200);
    }
}
