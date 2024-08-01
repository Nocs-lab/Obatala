<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

class ProcessCustomFields extends ObatalaAPI {

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
                    'validate_callback' => function($param) {
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
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ]
            ]
        ]);

        // Route to update multiple meta fields
        $this->add_route('process_obatala/(?P<id>\d+)/meta', [
            'methods' => 'POST',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function get_current_stage($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'current_stage', true);
    }

    public function update_current_stage($request) {
        $post_id = (int) $request['id'];
        $current_stage = (int) $request['current_stage'];
        return update_post_meta($post_id, 'current_stage', $current_stage);
    }

    public function get_process_type($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'process_type', true);
    }

    public function update_process_type($request) {
        $post_id = (int) $request['id'];
        $process_type = (int) $request['process_type'];
        return update_post_meta($post_id, 'process_type', $process_type);
    }

    public function update_meta($request) {
        $post_id = (int) $request['id'];
        $meta = $request->get_json_params();
        foreach ($meta as $key => $value) {
            update_post_meta($post_id, $key, $value);
        }
        return true;
    }
}
