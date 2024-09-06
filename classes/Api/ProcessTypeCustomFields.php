<?php
namespace Obatala\Api;

defined('ABSPATH') || exit;

class ProcessTypeCustomFields extends ObatalaAPI {

    public function register_routes() {
        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [$this, 'get_meta'],
            'permission_callback' => '__return_true',
        ]);

        $this->add_route('process_type/(?P<id>\d+)/meta', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => '__return_true',
            'args' => $this->get_meta_args(),
        ]);
    }

    protected function get_meta_args() {
        return [
            'accept_attachments' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_bool($param);
                },
                'sanitize_callback' => 'rest_sanitize_boolean',
            ],
            'accept_tainacan_items' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_bool($param);
                },
                'sanitize_callback' => 'rest_sanitize_boolean',
            ],
            'generate_tainacan_items' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_bool($param);
                },
                'sanitize_callback' => 'rest_sanitize_boolean',
            ],
            'description' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_string($param);
                },
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'step_order' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_array($param);
                },
                'sanitize_callback' => function ($param) {
                    return array_map('sanitize_text_field', $param);
                },
            ],
            'flowData' => [
                'required' => false,
                'validate_callback' => function ($param) {
                    return is_array($param['nodes']) && is_array($param['edges']);
                },
                'sanitize_callback' => function ($param) {
                    return json_encode($param);  // Salvando como JSON
                },
            ],
        ];
    }

    public function get_meta($request) {
        $post_id = (int) $request['id'];
    
        $flowData = get_post_meta($post_id, 'flowData', true);
    
        // Decodificar JSON se for uma string
        if (is_string($flowData)) {
            $flowData = json_decode($flowData, true);
        }
    
        $meta = [
            'accept_attachments' => (bool) get_post_meta($post_id, 'accept_attachments', true),
            'accept_tainacan_items' => (bool) get_post_meta($post_id, 'accept_tainacan_items', true),
            'generate_tainacan_items' => (bool) get_post_meta($post_id, 'generate_tainacan_items', true),
            'description' => get_post_meta($post_id, 'description', true) ?: '',
            'step_order' => get_post_meta($post_id, 'step_order', true) ?: [],
            'flowData' => $flowData ?: [],
        ];
        return rest_ensure_response($meta);
    }
    

    public function update_meta($request) {
        $post_id = (int) $request['id'];
    
        $meta_keys = [
            'accept_attachments', 
            'accept_tainacan_items', 
            'generate_tainacan_items', 
            'description', 
            'step_order',
            'flowData',
        ];
    
        foreach ($meta_keys as $key) {
            if (isset($request[$key])) {
                // Verificar se o campo flowData está vindo como string e decodificá-lo
                if ($key === 'flowData' && is_string($request[$key])) {
                    $flowData = json_decode($request[$key], true);
                    if ($flowData) {
                        update_post_meta($post_id, $key, $flowData); // Armazena como array
                    }
                } else {
                    update_post_meta($post_id, $key, $request[$key]);
                }
            }
        }
    
        return rest_ensure_response('Meta updated successfully.');
    }
    
}
