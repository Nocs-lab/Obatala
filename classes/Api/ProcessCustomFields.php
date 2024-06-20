<?php
namespace Obatala\Api;

defined('ABSPATH') || exit;

class ProcessCustomFields {
    
    public static function register() {
        register_rest_field('process_obatala', 'current_stage', [
            'get_callback' => function($object) {
                return get_post_meta($object['id'], 'current_stage', true);
            },
            'update_callback' => function($value, $object) {
                return update_post_meta($object->ID, 'current_stage', $value);
            },
            'schema' => [
                'type' => 'integer',
                'description' => 'Current Stage ID',
                'context' => ['view', 'edit'],
            ],
        ]);

        register_rest_field('process_obatala', 'process_type', [
            'get_callback' => function($object) {
                return get_post_meta($object['id'], 'process_type', true);
            },
            'update_callback' => function($value, $object) {
                return update_post_meta($object->ID, 'process_type', $value);
            },
            'schema' => [
                'type' => 'integer',
                'description' => 'Process Type ID',
                'context' => ['view', 'edit'],
            ],
        ]);
    }
}
