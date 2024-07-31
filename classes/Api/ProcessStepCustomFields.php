<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

/**
 * Class ProcessStepCustomFields
 * Handles custom fields for the "process_step" custom post type.
 */
class ProcessStepCustomFields extends ObatalaAPI {

    /**
     * Registers the custom routes for the API.
     */
    public function register_routes() {
        // Route to get the process type
        $this->add_route('process_step/(?P<id>\d+)/process_type', [
            'methods' => 'GET',
            'callback' => [$this, 'get_process_type'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the process type
        $this->add_route('process_step/(?P<id>\d+)/process_type', [
            'methods' => 'POST',
            'callback' => [$this, 'update_process_type'],
            'permission_callback' => '__return_true',
            'args' => [
                'process_type' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_array($param) && array_reduce($param, function($carry, $item) {
                            return $carry && is_int($item);
                        }, true);
                    }
                ]
            ]
        ]);

        // Route to get the parent process
        $this->add_route('process_step/(?P<id>\d+)/parent_process', [
            'methods' => 'GET',
            'callback' => [$this, 'get_parent_process'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the parent process
        $this->add_route('process_step/(?P<id>\d+)/parent_process', [
            'methods' => 'POST',
            'callback' => [$this, 'update_parent_process'],
            'permission_callback' => '__return_true',
            'args' => [
                'parent_process' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_int($param);
                    }
                ]
            ]
        ]);

        // Route to get the step order
        $this->add_route('process_step/(?P<id>\d+)/step_order', [
            'methods' => 'GET',
            'callback' => [$this, 'get_step_order'],
            'permission_callback' => '__return_true',
        ]);

        // Route to update the step order
        $this->add_route('process_step/(?P<id>\d+)/step_order', [
            'methods' => 'POST',
            'callback' => [$this, 'update_step_order'],
            'permission_callback' => '__return_true',
            'args' => [
                'step_order' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_array($param);
                    }
                ]
            ]
        ]);
    }

    /**
     * Callback to get the process type of the process step.
     *
     * @param WP_REST_Request $request The request object.
     * @return array The process type of the process step.
     */
    public function get_process_type($request) {
        $post_id = (int) $request['id'];
        $value = get_post_meta($post_id, 'process_type', true);
        return is_array($value) ? $value : [];
    }

    /**
     * Callback to update the process type of the process step.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|int The result of the update operation.
     */
    public function update_process_type($request) {
        $post_id = (int) $request['id'];
        $value = $request['process_type'];
        delete_post_meta($post_id, 'process_type');

        if (!empty($value)) {
            add_post_meta($post_id, 'process_type', $value);
        }
        return true;
    }

    /**
     * Callback to get the parent process of the process step.
     *
     * @param WP_REST_Request $request The request object.
     * @return mixed The parent process ID.
     */
    public function get_parent_process($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'parent_process', true);
    }

    /**
     * Callback to update the parent process of the process step.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|int The result of the update operation.
     */
    public function update_parent_process($request) {
        $post_id = (int) $request['id'];
        $value = $request['parent_process'];
        return update_post_meta($post_id, 'parent_process', $value);
    }

    /**
     * Callback to get the step order of the process step.
     *
     * @param WP_REST_Request $request The request object.
     * @return array The step order of the process step.
     */
    public function get_step_order($request) {
        $post_id = (int) $request['id'];
        $meta = get_post_meta($post_id, 'step_order', true);
        return is_array($meta) ? $meta : [];
    }

    /**
     * Callback to update the step order of the process step.
     *
     * @param WP_REST_Request $request The request object.
     * @return bool|int The result of the update operation.
     */
    public function update_step_order($request) {
        $post_id = (int) $request['id'];
        $value = $request['step_order'];
        if (is_array($value)) {
            return update_post_meta($post_id, 'step_order', $value);
        }
        return false;
    }

    /**
     * Registers the API and adds custom filters.
     */
    public function register() {
        parent::register();
        add_filter('rest_process_step_query', [$this, 'add_custom_filters'], 10, 2);
    }

    /**
     * Adds custom filters to the process step query.
     *
     * @param array $args The query arguments.
     * @param WP_REST_Request $request The request object.
     * @return array The modified query arguments.
     */
    public function add_custom_filters($args, $request) {
        if (isset($request['parent_process'])) {
            $args['meta_query'] = [
                [
                    'key' => 'parent_process',
                    'value' => $request['parent_process'],
                    'compare' => '='
                ]
            ];
        }
        return $args;
    }
}
