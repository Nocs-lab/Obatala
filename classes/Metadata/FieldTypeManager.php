<?php
namespace Obatala\Metadata;

defined('ABSPATH') || exit;

class FieldTypeManager {
    private $meta_key_list = '';

    // Método para salvar vários campos dinâmicos
    public function save_dynamic_fields($post_id, $fields) {
        if (empty($post_id) || empty($fields)) {
            return false;
        }

        $keys = [];

        foreach ($fields as $field) {
            if(is_string($field['type']) && is_numeric($field['id'])) {
                $meta_key = "{$field['type']}_{$field['id']}";
                $result = update_post_meta($post_id, $meta_key, json_encode($field));
                
                if(!$result) {
                    error_log("Failed to update post meta for key '$meta_key'");
                } else {
                    $keys[] = $meta_key;
                }
            }
        }
    
        if (!empty($keys)) {
            update_post_meta($post_id, $this->meta_key_list, $keys);
        }

        return true;
    }

    // Método para obter todos os campos associados a um post
    public function get_fields($post_id) {
        if (empty($post_id)) {
            return [];
        }

        $keys = get_post_meta($post_id, $this->meta_key_list, true);
        $fields = [];

        if (!empty($keys) && is_array($keys)) {
            foreach ($keys as $key) {
                $field = get_post_meta($post_id, $key, true);
                if ($field) {
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $fields[$key] = json_decode($field, true);
                    }else {
                        error_log("Error decoding JSON for key: $key in post: $post_id");
                    }
                }else {
                    error_log("Failed to get post meta for key '$key' in '$post_id'");
                }
            }
        }

        return $fields;
    }

    function get_custom_fields($post_id) {
        return $this->get_fields($post_id);
    }

    function save_custom_fields($post_id, $fields) {
        return $this->save_dynamic_fields($post_id, $fields);
    }
}
