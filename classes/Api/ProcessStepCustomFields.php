<?php
namespace Obatala\Api;

defined('ABSPATH') || exit;

class ProcessStepCustomFields {
    
    public static function register() {
        register_rest_field('process_step', 'process_type', [
            'get_callback' => function($object) {
                $value = get_post_meta($object['id'], 'process_type', true);
                return is_array($value) ? $value : [];
            },

            'update_callback' => function($value, $object) {
            
                delete_post_meta($object->ID, 'process_type');

                if (!empty($value)) {
                    add_post_meta($object->ID, 'process_type', $value);
                }
                return true;
            },

            'schema' => [
                'type' => 'array',
                'description' => 'Process Type ID',
                'context' => ['view', 'edit'],
                'items' => [
                    'type' => 'integer'
                ],
            ],
        ]);
    

        register_rest_field('process_step', 'parent_process', [
            'get_callback' => function($object) {
                return get_post_meta($object['id'], 'parent_process', true);
            },
            'update_callback' => function($value, $object) {
                return update_post_meta($object->ID, 'parent_process', $value);
            },
            'schema' => [
                'type' => 'integer',
                'description' => 'Parent Process ID',
                'context' => ['view', 'edit'],
            ],
        ]);

        register_rest_field('process_step', 'step_order', [
            'get_callback' => function($object) {
                return get_post_meta($object['id'], 'step_order', true);
            },
            'update_callback' => function($value, $object) {
                return update_post_meta($object->ID, 'step_order', (int) $value);
            },
            'schema' => [
                'type' => 'integer',
                'description' => 'Order of the Step',
                'context' => ['view', 'edit'],
            ],
        ]);
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
