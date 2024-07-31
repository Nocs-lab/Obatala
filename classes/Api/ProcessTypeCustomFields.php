<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

/**
 * Class ProcessTypeCustomFields
 * Handles custom fields for the "process_type" custom post type.
 */
class ProcessTypeCustomFields extends ObatalaAPI {

    /**
     * Registers the custom routes for the API.
     */
    public function register_routes() {
        // Route to get the accept_attachments field
        $this->add_route('process_type/(?P<id>\d+)/accept_attachments', [
            'methods' => 'GET',
            'callback' => [$this, 'get_accept_attachments'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the accept_attachments field
        $this->add_route('process_type/(?P<id>\d+)/accept_attachments', [
            'methods' => 'POST',
            'callback' => [$this, 'update_accept_attachments'],
            'permission_callback' => '__return_true',
            'args' => [
                'accept_attachments' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_bool($param);
                    }
                ]
            ]
        ]);

        // Route to get the accept_tainacan_items field
        $this->add_route('process_type/(?P<id>\d+)/accept_tainacan_items', [
            'methods' => 'GET',
            'callback' => [$this, 'get_accept_tainacan_items'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the accept_tainacan_items field
        $this->add_route('process_type/(?P<id>\d+)/accept_tainacan_items', [
            'methods' => 'POST',
            'callback' => [$this, 'update_accept_tainacan_items'],
            'permission_callback' => '__return_true',
            'args' => [
                'accept_tainacan_items' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_bool($param);
                    }
                ]
            ]
        ]);

        // Route to get the generate_tainacan_items field
        $this->add_route('process_type/(?P<id>\d+)/generate_tainacan_items', [
            'methods' => 'GET',
            'callback' => [$this, 'get_generate_tainacan_items'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the generate_tainacan_items field
        $this->add_route('process_type/(?P<id>\d+)/generate_tainacan_items', [
            'methods' => 'POST',
            'callback' => [$this, 'update_generate_tainacan_items'],
            'permission_callback' => '__return_true',
            'args' => [
                'generate_tainacan_items' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_bool($param);
                    }
                ]
            ]
        ]);

        // Route to get the description field
        $this->add_route('process_type/(?P<id>\d+)/description', [
            'methods' => 'GET',
            'callback' => [$this, 'get_description'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the description field
        $this->add_route('process_type/(?P<id>\d+)/description', [
            'methods' => 'POST',
            'callback' => [$this, 'update_description'],
            'permission_callback' => '__return_true',
            'args' => [
                'description' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_string($param);
                    }
                ]
            ]
        ]);
    }

    /**
     * Callback to get the accept_attachments field of the process type.
     *
     * @param WP_REST_Request $request The request object.
     * @return mixed The value of the accept_attachments field.
     */
    public function get_accept_attachments($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'accept_attachments', true);
    }

    /**
     * Callback to update the accept_attachments field of the process type.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|int The result of the update operation.
     */
    public function update_accept_attachments($request) {
        $post_id = (int) $request['id'];
        $value = $request['accept_attachments'];
        return update_post_meta($post_id, 'accept_attachments', $value);
    }

    /**
     * Callback to get the accept_tainacan_items field of the process type.
     *
     * @param WP_REST_Request $request The request object.
     * @return mixed The value of the accept_tainacan_items field.
     */
    public function get_accept_tainacan_items($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'accept_tainacan_items', true);
    }

    /**
     * Callback to update the accept_tainacan_items field of the process type.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|int The result of the update operation.
     */
    public function update_accept_tainacan_items($request) {
        $post_id = (int) $request['id'];
        $value = $request['accept_tainacan_items'];
        return update_post_meta($post_id, 'accept_tainacan_items', $value);
    }

    /**
     * Callback to get the generate_tainacan_items field of the process type.
     *
     * @param WP_REST_Request $request The request object.
     * @return mixed The value of the generate_tainacan_items field.
     */
    public function get_generate_tainacan_items($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'generate_tainacan_items', true);
    }

    /**
     * Callback to update the generate_tainacan_items field of the process type.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|int The result of the update operation.
     */
    public function update_generate_tainacan_items($request) {
        $post_id = (int) $request['id'];
        $value = $request['generate_tainacan_items'];
        return update_post_meta($post_id, 'generate_tainacan_items', $value);
    }

    /**
     * Callback to get the description field of the process type.
     *
     * @param WP_REST_Request $request The request object.
     * @return mixed The value of the description field.
     */
    public function get_description($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'description', true);
    }

    /**
     * Callback to update the description field of the process type.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|int The result of the update operation.
     */
    public function update_description($request) {
        $post_id = (int) $request['id'];
        $value = $request['description'];
        return update_post_meta($post_id, 'description', $value);
    }
}
