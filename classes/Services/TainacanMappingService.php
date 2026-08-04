<?php

namespace Obatala\Services;

defined('ABSPATH') || exit;

class TainacanMappingService {
    const MAPPING_META_KEY = '_obatala_mapping_data';
    const PROCESS_MAPPING_SNAPSHOT_META_KEY = '_obatala_tainacan_mapping_snapshot';
    const DEFAULT_PROFILE_SELECTOR_FIELD_ID = 'obatala_ctrl_collection_selector';
    const MAPPER_STATUS_ENABLED = 'enabled';
    const MAPPER_STATUS_DRAFT = 'draft';
    const MAPPER_STATUS_DISABLED = 'disabled';

    private const DEFAULT_DECISION_RULES = [
        'quantity_field_id' => '',
        'quantity_fallback' => '1',
        'multi_or_single_field_id' => '',
        'data_entry_mode_field_id' => '',
        'spreadsheet_upload_field_id' => '',
        'same_values_mode_field_id' => '',
        'same_values_unique_id_field_id' => '',
        'same_values_prefix_mode_field_id' => '',
        'same_values_prefix_text_field_id' => '',
        'same_values_id_prefix' => '',
        'multi_items_value' => 'Sim',
        'single_item_value' => 'Não',
        'upload_mode_value' => 'Planilha',
        'fill_mode_value' => 'Manual',
        'same_values_enabled_value' => 'Sim',
    ];

    public function get_mapping_data($process_type_id) {
        $raw = get_post_meta((int) $process_type_id, self::MAPPING_META_KEY, true);
        return $this->decode_mapping_payload($raw);
    }

    public function get_mapping_config_for_process_type($process_type_id) {
        return $this->normalize_mapping_config(
            $this->get_mapping_data($process_type_id)
        );
    }

    public function get_mapping_config_for_process($process_id, $process_type_id) {
        $snapshot = get_post_meta((int) $process_id, self::PROCESS_MAPPING_SNAPSHOT_META_KEY, true);
        $snapshot_data = $this->decode_mapping_payload($snapshot);

        if (!empty($snapshot_data)) {
            return $this->normalize_mapping_config($snapshot_data);
        }

        return $this->get_mapping_config_for_process_type($process_type_id);
    }

    public function normalize_mapping_config(array $mapping_data) {
        $mappings = is_array($mapping_data['mappings'] ?? null) ? $mapping_data['mappings'] : [];
        $raw_status = self::MAPPER_STATUS_DISABLED;
        if (isset($mappings['status'])) {
            $raw_status = $mappings['status'];
        } elseif (isset($mapping_data['status'])) {
            $raw_status = $mapping_data['status'];
        }
        $status = $this->normalize_mapper_status($raw_status);

        $raw_profiles = [];
        if (isset($mappings['profiles']) && is_array($mappings['profiles'])) {
            $raw_profiles = $mappings['profiles'];
        }

        $raw_rules = [];
        if (isset($mappings['decision_rules']) && is_array($mappings['decision_rules'])) {
            $raw_rules = $mappings['decision_rules'];
        } elseif (isset($mapping_data['decision_rules']) && is_array($mapping_data['decision_rules'])) {
            $raw_rules = $mapping_data['decision_rules'];
        } elseif (!empty($raw_profiles)) {
            $raw_rules = $this->extract_profile_level_decision_rules($raw_profiles);
        }
        $normalized_global_rules = $this->normalize_decision_rules($raw_rules);

        $profiles = [];
        $used_keys = [];

        if (!empty($raw_profiles)) {
            foreach ($raw_profiles as $index => $profile) {
                $normalized = $this->normalize_profile($profile, $index, $used_keys);
                if (!empty($normalized)) {
                    $profiles[] = $normalized;
                    $used_keys[] = $normalized['key'];
                }
            }
        } else {
            $legacy_collection_id = (int) ($mapping_data['collection_id'] ?? 0);
            $legacy_field_mappings = $this->normalize_field_mappings(
                $this->extract_legacy_field_mappings($mapping_data)
            );

            if ($legacy_collection_id || !empty($legacy_field_mappings)) {
                $legacy_collection_name = $this->resolve_collection_name($legacy_collection_id, 'Coleção padrão');
                $profiles[] = [
                    'key' => 'perfil_padrao',
                    'label' => $legacy_collection_name,
                    'collection_id' => $legacy_collection_id,
                    'collection_name' => $legacy_collection_name,
                    'field_mappings' => $legacy_field_mappings,
                ];
            }
        }

        $raw_selector_field_id = '';
        if (isset($mappings['profile_selector_field_id'])) {
            $raw_selector_field_id = $mappings['profile_selector_field_id'];
        } elseif (isset($mapping_data['profile_selector_field_id'])) {
            $raw_selector_field_id = $mapping_data['profile_selector_field_id'];
        }
        $profile_selector_field_id = (string) $raw_selector_field_id;
        if ($status === self::MAPPER_STATUS_ENABLED && $profile_selector_field_id === '') {
            $profile_selector_field_id = self::DEFAULT_PROFILE_SELECTOR_FIELD_ID;
        }

        return [
            'status' => $status,
            'profile_selector_field_id' => $profile_selector_field_id,
            'decision_rules' => $normalized_global_rules,
            'profiles' => $profiles,
            'schema_version' => (int) ($mapping_data['schema_version'] ?? (!empty($raw_profiles) ? 2 : 1)),
        ];
    }

    public function build_process_mapping_snapshot($process_type_id) {
        $config = $this->get_mapping_config_for_process_type($process_type_id);
        $status = $this->normalize_mapper_status($config['status'] ?? self::MAPPER_STATUS_DISABLED);

        if (empty($config['profiles']) && $status === self::MAPPER_STATUS_ENABLED) {
            return [];
        }

        return [
            'process_model_id' => (int) $process_type_id,
            'schema_version' => 3,
            'mappings' => [
                'status' => $status,
                'profile_selector_field_id' => (string) ($config['profile_selector_field_id'] ?? ''),
                'decision_rules' => $config['decision_rules'] ?? self::DEFAULT_DECISION_RULES,
                'profiles' => $config['profiles'] ?? [],
            ],
        ];
    }

    public function apply_profile_options_to_flow_data($process_type_id, array $flow_data) {
        $config = $this->get_mapping_config_for_process_type($process_type_id);
        return $this->apply_profile_options_to_flow_data_from_config($flow_data, $config);
    }

    public function apply_profile_options_to_flow_data_from_config(array $flow_data, array $mapping_config) {
        if ($this->normalize_mapper_status($mapping_config['status'] ?? self::MAPPER_STATUS_DISABLED) !== self::MAPPER_STATUS_ENABLED) {
            return $flow_data;
        }

        $selector_field_id = (string) ($mapping_config['profile_selector_field_id'] ?? '');
        $profiles = is_array($mapping_config['profiles'] ?? null) ? $mapping_config['profiles'] : [];
        $selector_field_ids = array_values(array_unique(array_filter([
            $selector_field_id,
            self::DEFAULT_PROFILE_SELECTOR_FIELD_ID,
        ])));

        if (empty($selector_field_ids) || empty($profiles) || !isset($flow_data['nodes']) || !is_array($flow_data['nodes'])) {
            return $flow_data;
        }

        $profile_labels = array_values(array_filter(array_map(function($profile) {
            return trim((string) $this->get_profile_display_name($profile));
        }, $profiles)));

        if (empty($profile_labels)) {
            return $flow_data;
        }

        foreach ($flow_data['nodes'] as $node_index => $node) {
            if (!isset($node['data']['fields']) || !is_array($node['data']['fields'])) {
                continue;
            }

            foreach ($node['data']['fields'] as $field_index => $field) {
                $field_id = isset($field['id']) ? (string) $field['id'] : '';
                $field_type = isset($field['type']) ? (string) $field['type'] : '';
                $field_config = is_array($field['config'] ?? null) ? $field['config'] : [];
                $field_label = isset($field_config['label']) ? (string) $field_config['label'] : '';
                $normalized_field_label = $this->normalize_label($field_label);

                $is_selector_by_id = in_array($field_id, $selector_field_ids, true);
                $is_selector_by_label = $field_type === 'radio' && (
                    $normalized_field_label === 'colecao de exportacao'
                    || $normalized_field_label === 'coleção de exportação'
                );

                if (!$is_selector_by_id && !$is_selector_by_label) {
                    continue;
                }

                $field_config['options'] = implode(', ', $profile_labels);
                $field_config['required'] = true;

                if (empty($field_config['helpText'])) {
                    $field_config['helpText'] = 'Selecione a coleção de exportação que será usada neste processo.';
                }

                $flow_data['nodes'][$node_index]['data']['fields'][$field_index]['config'] = $field_config;
            }
        }

        return $flow_data;
    }

    public function resolve_profile_by_selected_value(array $mapping_config, $selected_value) {
        $profiles = is_array($mapping_config['profiles'] ?? null) ? $mapping_config['profiles'] : [];
        if (empty($profiles)) {
            return null;
        }

        $selected_value = $this->extract_scalar_value($selected_value);
        if ($selected_value === '') {
            return count($profiles) === 1 ? $profiles[0] : null;
        }

        $normalized_selected_value = $this->normalize_label($selected_value);
        $selected_key = sanitize_key($selected_value);

        foreach ($profiles as $profile) {
            $profile_display_name = $this->normalize_label($this->get_profile_display_name($profile));
            $profile_label = $this->normalize_label($profile['label'] ?? '');
            $profile_key = isset($profile['key']) ? (string) $profile['key'] : '';

            if ($profile_display_name === $normalized_selected_value || $profile_label === $normalized_selected_value || $profile_key === $selected_key) {
                return $profile;
            }
        }

        return count($profiles) === 1 ? $profiles[0] : null;
    }

    private function decode_mapping_payload($raw) {
        if (empty($raw)) {
            return [];
        }

        if (is_array($raw)) {
            return $raw;
        }

        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }

            $decoded = maybe_unserialize($raw);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return [];
    }

    private function extract_legacy_field_mappings(array $mapping_data) {
        $mappings = $mapping_data['mappings'] ?? [];

        if (is_array($mappings) && isset($mappings['field_mappings']) && is_array($mappings['field_mappings'])) {
            return $mappings['field_mappings'];
        }

        if (is_array($mappings) && isset($mappings[0]['obatala_field'])) {
            return $mappings;
        }

        return [];
    }

    private function normalize_profile($profile, $index, array $used_keys) {
        if (!is_array($profile)) {
            return [];
        }

        $collection_id = (int) ($profile['collection_id'] ?? 0);
        $legacy_label = sanitize_text_field($profile['label'] ?? '');
        $collection_name = sanitize_text_field($profile['collection_name'] ?? '');
        $collection_name = $this->resolve_collection_name($collection_id, $collection_name !== '' ? $collection_name : $legacy_label);
        if ($collection_name === '') {
            $collection_name = 'Coleção ' . max(1, $index + 1);
        }

        $key_source = $profile['key'] ?? $collection_name ?? ('perfil_' . ($index + 1));
        $key = $this->build_unique_profile_key($key_source, $used_keys);

        return [
            'key' => $key,
            'label' => $collection_name,
            'collection_id' => $collection_id,
            'collection_name' => $collection_name,
            'field_mappings' => $this->normalize_field_mappings($profile['field_mappings'] ?? []),
        ];
    }

    private function extract_profile_level_decision_rules(array $profiles) {
        foreach ($profiles as $profile) {
            if (is_array($profile) && isset($profile['decision_rules']) && is_array($profile['decision_rules'])) {
                return $profile['decision_rules'];
            }
        }

        return [];
    }

    private function normalize_field_mappings($field_mappings) {
        if (!is_array($field_mappings)) {
            return [];
        }

        $normalized = [];

        foreach ($field_mappings as $mapping) {
            if (!is_array($mapping)) {
                continue;
            }

            $obatala_field = is_array($mapping['obatala_field'] ?? null) ? $mapping['obatala_field'] : [];
            $field_id = isset($obatala_field['value']) ? (string) $obatala_field['value'] : '';
            $metadata_id = isset($mapping['tainacan_metadata_id']) ? (int) $mapping['tainacan_metadata_id'] : 0;

            if ($field_id === '') {
                continue;
            }

            $normalized[] = [
                'obatala_field' => $obatala_field,
                'tainacan_metadata_id' => $metadata_id,
            ];
        }

        return $normalized;
    }

    private function normalize_decision_rules(array $rules) {
        $normalized = self::DEFAULT_DECISION_RULES;
        foreach (self::DEFAULT_DECISION_RULES as $key => $default_value) {
            if (array_key_exists($key, $rules) && $rules[$key] !== null) {
                $normalized[$key] = (string) $rules[$key];
            }
        }
        return $normalized;
    }

    private function build_unique_profile_key($value, array $used_keys) {
        $key = sanitize_key(remove_accents((string) $value));
        $key = $key !== '' ? $key : 'perfil';

        if (!in_array($key, $used_keys, true)) {
            return $key;
        }

        $suffix = 2;
        while (in_array($key . '_' . $suffix, $used_keys, true)) {
            $suffix++;
        }

        return $key . '_' . $suffix;
    }

    private function extract_scalar_value($value) {
        if (is_array($value)) {
            $first = reset($value);
            if (is_scalar($first)) {
                return trim((string) $first);
            }
            return '';
        }

        if (is_scalar($value)) {
            return trim((string) $value);
        }

        return '';
    }

    private function normalize_label($value) {
        $value = remove_accents((string) $value);
        return strtolower(trim($value));
    }

    private function get_profile_display_name($profile) {
        if (!is_array($profile)) {
            return '';
        }

        $collection_name = trim((string) ($profile['collection_name'] ?? ''));
        if ($collection_name !== '') {
            return $collection_name;
        }

        $label = trim((string) ($profile['label'] ?? ''));
        if ($label !== '') {
            return $label;
        }

        $collection_id = (int) ($profile['collection_id'] ?? 0);
        return $this->resolve_collection_name($collection_id, '');
    }

    private function resolve_collection_name($collection_id, $fallback = '') {
        $collection_id = (int) $collection_id;
        if ($collection_id > 0) {
            $post = get_post($collection_id);
            if ($post) {
                $post_title = sanitize_text_field(get_the_title($post));
                if ($post_title !== '') {
                    return $post_title;
                }
            }
        }

        return sanitize_text_field((string) $fallback);
    }

    private function normalize_mapper_status($status) {
        $normalized = strtolower(trim((string) $status));
        if ($normalized === self::MAPPER_STATUS_ENABLED || $normalized === 'habilitado') {
            return self::MAPPER_STATUS_ENABLED;
        }
        if ($normalized === self::MAPPER_STATUS_DRAFT || $normalized === 'rascunho') {
            return self::MAPPER_STATUS_DRAFT;
        }
        return self::MAPPER_STATUS_DISABLED;
    }
}
