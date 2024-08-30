<?php
namespace Obatala\Api;

defined('ABSPATH') || exit;

/**
 * Class ProcessTypeCustomFields
 * Handles custom fields for the "process_type" custom post type.
 */
class ProcessTypeApi extends ObatalaAPI {

    /**
     * Registers the custom routes for the API.
     */
    public function register_routes() {
        // Route to get all meta fields
        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [$this, 'get_meta'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update all meta fields with PUT method
        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => '__return_true',
            'args' => [
                'accept_attachments' => [
                    'required' => false,
                    'validate_callback' => function($param, $request, $key) {
                        return is_bool($param);
                    }
                ],
                'accept_tainacan_items' => [
                    'required' => false,
                    'validate_callback' => function($param, $request, $key) {
                        return is_bool($param);
                    }
                ],
                'generate_tainacan_items' => [
                    'required' => false,
                    'validate_callback' => function($param, $request, $key) {
                        return is_bool($param);
                    }
                ],
                'description' => [
                    'required' => false,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param);
                    }
                ],
                'step_order' => [
                    'required' => false,
                    'validate_callback' => function($param, $request, $key) {
                        return is_array($param);
                    }
                ]
            ]
        ]);
    }

    /**
     * Callback to get all meta fields of the process type.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The meta fields.
     */
    public function get_meta($request) {
        $post_id = (int) $request['id'];
        
        $meta = [
            'accept_attachments' => (bool) get_post_meta($post_id, 'accept_attachments', true),
            'accept_tainacan_items' => (bool) get_post_meta($post_id, 'accept_tainacan_items', true),
            'generate_tainacan_items' => (bool) get_post_meta($post_id, 'generate_tainacan_items', true),
            'description' => get_post_meta($post_id, 'description', true) ?: '',
            'step_order' => get_post_meta($post_id, 'step_order', true) ?: []
        ];
        return rest_ensure_response($meta);
    }

    /**
     * Callback to update all meta fields of the process type.
     *
     * @param WP_REST_Request $request The request object.
     * @return WP_REST_Response The result of the update operation.
     */
    public function update_meta($request) {
        $post_id = (int) $request['id'];
        $meta_keys = ['accept_attachments', 'accept_tainacan_items', 'generate_tainacan_items', 'description', 'step_order'];
        foreach ($meta_keys as $key) {
            if (isset($request[$key])) {
                update_post_meta($post_id, $key, $request[$key]);
            }
        }
        return rest_ensure_response('Meta updated successfully.');
    }
}
