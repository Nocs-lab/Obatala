<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

class ProcessStepCustomFields extends ObatalaAPI {

    public function register_routes() {
        $this->add_route('process_step/(?P<id>\d+)/process_type', [
            'methods' => 'GET',
            'callback' => [$this, 'get_process_type'],
            'permission_callback' => '__return_true',
        ]);

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

        $this->add_route('process_step/(?P<id>\d+)/parent_process', [
            'methods' => 'GET',
            'callback' => [$this, 'get_parent_process'],
            'permission_callback' => '__return_true',
        ]);

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

        $this->add_route('process_step/(?P<id>\d+)/step_order', [
            'methods' => 'GET',
            'callback' => [$this, 'get_step_order'],
            'permission_callback' => '__return_true',
        ]);

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

    public function get_process_type($request) {
        $post_id = (int) $request['id'];
        $value = get_post_meta($post_id, 'process_type', true);
        return is_array($value) ? $value : [];
    }

    public function update_process_type($request) {
        $post_id = (int) $request['id'];
        $value = $request['process_type'];
        delete_post_meta($post_id, 'process_type');

        if (!empty($value)) {
            add_post_meta($post_id, 'process_type', $value);
        }
        return true;
    }

    public function get_parent_process($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'parent_process', true);
    }

    public function update_parent_process($request) {
        $post_id = (int) $request['id'];
        $value = $request['parent_process'];
        return update_post_meta($post_id, 'parent_process', $value);
    }

    public function get_step_order($request) {
        $post_id = (int) $request['id'];
        $meta = get_post_meta($post_id, 'step_order', true);
        return is_array($meta) ? $meta : [];
    }

    public function update_step_order($request) {
        $post_id = (int) $request['id'];
        $value = $request['step_order'];
        if (is_array($value)) {
            return update_post_meta($post_id, 'step_order', $value);
        }
        return false;
    }

    public function register() {
        parent::register();
        add_filter('rest_process_step_query', [self::class, 'add_custom_filters'], 10, 2);
    }

    public static function add_custom_filters($args, $request) {
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
