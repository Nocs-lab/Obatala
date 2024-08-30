<?php
namespace Obatala\Api;

defined('ABSPATH') || exit;

class ProcessStepApi extends ObatalaAPI {

    public function register_routes() {
        $this->add_route('process_step/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [$this, 'get_meta'],
            'permission_callback' => '__return_true',
        ]);

        $this->add_route('process_step/(?P<id>\d+)/meta', [
            'methods' => 'POST',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => '__return_true',
            'args' => [
                'meta_fields' => [
                    'required' => true,
                    'validate_callback' => function($param, $request, $key) {
                        return is_array($param);
                    }
                ]
            ]
        ]);
    }

    public function get_meta($request) {
        $post_id = (int) $request['id'];
        $meta = get_post_meta($post_id, 'meta_fields', true);
        return is_array($meta) ? $meta : [];
    }

    public function update_meta($request) {
        $post_id = (int) $request['id'];
        $meta_fields = $request['meta_fields'];
        update_post_meta($post_id, 'meta_fields', $meta_fields);
        return true;
    }

    public function register() {
        parent::register();
    }
}
