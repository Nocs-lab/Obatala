<?php

class FieldTypeManager {
    private $meta_key_list = '';

    // Método para salvar vários campos dinâmicos
    public function save_dynamic_fields($post_id, $fields) {
        if (empty($post_id) || empty($fields)) {
            return false;
        }

        $keys = [];

        foreach ($fields as $field) {
            $meta_key = "{$field['type']}_{$field['id']}";
            update_post_meta($post_id, $meta_key, json_encode($field));
            $keys[] = $meta_key;
        }

        update_post_meta($post_id, $this->meta_key_list, $keys);

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
                    $fields[$key] = json_decode($field, true);
                }
            }
        }

        return $fields;
    }

    function get_custom_fields($post_id) {
        $field_manager = new FieldTypeManager();
        return $field_manager->get_fields($post_id);
    }

    function save_custom_fields($post_id, $fields) {
        $field_manager = new FieldTypeManager();
        return $field_manager->save_dynamic_fields($post_id, $fields);
    }
}