<?php
namespace Obatala\Api;

defined('ABSPATH') || exit;

class ProcessTypeCustomFields {
    
    public static function register() {
        register_rest_field('process_type', 'accept_attachments', [
            'get_callback' => function($object) {
                return get_post_meta($object['id'], 'accept_attachments', true);
            },
            'update_callback' => function($value, $object) {
                return update_post_meta($object->ID, 'accept_attachments', $value);
            },
            'schema' => [
                'type' => 'boolean',
                'description' => 'Accept attachments',
                'context' => ['view', 'edit'],
            ],
        ]);
    
        register_rest_field('process_type', 'accept_tainacan_items', [
            'get_callback' => function($object) {
                return get_post_meta($object['id'], 'accept_tainacan_items', true);
            },
            'update_callback' => function($value, $object) {
                return update_post_meta($object->ID, 'accept_tainacan_items', $value);
            },
            'schema' => [
                'type' => 'boolean',
                'description' => 'Accept Tainacan items',
                'context' => ['view', 'edit'],
            ],
        ]);
    
        register_rest_field('process_type', 'generate_tainacan_items', [
            'get_callback' => function($object) {
                return get_post_meta($object['id'], 'generate_tainacan_items', true);
            },
            'update_callback' => function($value, $object) {
                return update_post_meta($object->ID, 'generate_tainacan_items', $value);
            },
            'schema' => [
                'type' => 'boolean',
                'description' => 'Generate Tainacan items',
                'context' => ['view', 'edit'],
            ],
        ]);

        register_rest_field('process_type', 'description', [
            'get_callback' => function($object) {
                return get_post_meta($object['id'], 'description', true);
            },
            'update_callback' => function($value, $object) {
                return update_post_meta($object->ID, 'description', $value);
            },
            'schema' => [
                'type' => 'string',
                'description' => 'Process Type Description',
                'context' => ['view', 'edit'],
            ],
        ]);
    }
}
