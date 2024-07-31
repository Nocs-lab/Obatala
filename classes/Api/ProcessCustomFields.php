<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

/**
 * Class ProcessCustomFields
 * Handles custom fields for the "process_obatala" custom post type.
 */
class ProcessCustomFields extends ObatalaAPI {
    
    /**
     * Registers the custom routes for the API.
     */
    public function register_routes() {
        // Route to get the current stage
        $this->add_route('process_obatala/(?P<id>\d+)/current_stage', [
            'methods' => 'GET',
            'callback' => [$this, 'get_current_stage'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the current stage
        $this->add_route('process_obatala/(?P<id>\d+)/current_stage', [
            'methods' => 'POST',
            'callback' => [$this, 'update_current_stage'],
            'permission_callback' => '__return_true',
            'args' => [
                'current_stage' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric($param);
                    }
                ]
            ]
        ]);

        // Route to get the process type
        $this->add_route('process_obatala/(?P<id>\d+)/process_type', [
            'methods' => 'GET',
            'callback' => [$this, 'get_process_type'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the process type
        $this->add_route('process_obatala/(?P<id>\d+)/process_type', [
            'methods' => 'POST',
            'callback' => [$this, 'update_process_type'],
            'permission_callback' => '__return_true',
            'args' => [
                'process_type' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_numeric($param);
                    }
                ]
            ]
        ]);
    }

    /**
     * Callback to get the current stage of the process.
     *
     * @param WP_REST_Request $request The request object.
     * @return mixed The current stage of the process.
     */
    public function get_current_stage($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'current_stage', true);
    }

    /**
     * Callback to update the current stage of the process.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|int The result of the update operation.
     */
    public function update_current_stage($request) {
        $post_id = (int) $request['id'];
        $current_stage = (int) $request['current_stage'];
        return update_post_meta($post_id, 'current_stage', $current_stage);
    }

    /**
     * Callback to get the process type of the process.
     *
     * @param WP_REST_Request $request The request object.
     * @return mixed The process type of the process.
     */
    public function get_process_type($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'process_type', true);
    }

    /**
     * Callback to update the process type of the process.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|int The result of the update operation.
     */
    public function update_process_type($request) {
        $post_id = (int) $request['id'];
        $process_type = (int) $request['process_type'];
        return update_post_meta($post_id, 'process_type', $process_type);
    }
}
