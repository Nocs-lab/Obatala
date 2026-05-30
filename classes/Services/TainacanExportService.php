<?php

namespace Obatala\Services;

defined('ABSPATH') || exit;

class TainacanExportService {
    const MANUAL_ITEMS_META_KEY = '_obatala_tainacan_manual_items';
    const EXPORT_RESULT_META_KEY = '_obatala_tainacan_export_result';
    const EXPORT_DECISION_META_KEY = '_obatala_tainacan_export_decision';
    const PROCESS_STATUS_AWAITING_EXPORT_CONFIRMATION = 'Awaiting export confirmation';
    private const MAPPER_STATUS_ENABLED = 'enabled';
    private const PROCESS_STATUS_FINISHED = 'Finished';
    private const PROCESS_REFERENCE_METADATA_SLUG = 'obatala-process-reference';
    private const PROCESS_REFERENCE_METADATA_NAME = 'Link do processo no Obatala';
    private const PROCESS_REFERENCE_METADATA_TYPE = 'Tainacan\\Metadata_Types\\URL';
    private const PROCESS_REFERENCE_METADATA_MARKER_META_KEY = '_obatala_process_reference_metadata';

    public function get_runtime_config($process_id) {
        $process_id = (int) $process_id;
        $process_type_id = $this->get_process_type_id($process_id);

        $runtime = [
            'enabled' => false,
            'mapper_status' => self::MAPPER_STATUS_ENABLED,
            'requires_export_confirmation' => false,
            'process_id' => $process_id,
            'process_type_id' => $process_type_id,
            'collection_id' => 0,
            'selected_profile' => null,
            'available_profiles' => [],
            'decision' => [
                'is_multiple' => false,
                'quantity' => 1,
                'entry_mode' => 'manual',
                'same_values_mode' => false,
                'multi_or_single_raw' => '',
                'data_entry_mode_raw' => '',
                'same_values_raw' => '',
                'same_values_prefix_mode_raw' => '',
                'same_values_prefix_text_raw' => '',
                'upload_field_id' => '',
                'same_values_unique_id_field_id' => '',
                'same_values_id_prefix' => '',
            ],
            'mapped_fields' => [],
            'manual_items' => $this->get_saved_manual_items($process_id),
            'spreadsheet_file_name' => '',
            'spreadsheet_file_exists' => false,
            'show_manual_matrix' => false,
            'existing_export_result' => $this->get_saved_export_result($process_id),
            'export_decision' => $this->build_default_export_decision('not_required', 'Confirmação de exportação não é necessária para este processo.'),
            'message' => 'Mapeamento não encontrado para este modelo de processo.',
        ];

        if (!$process_type_id) {
            $runtime['message'] = 'Tipo de processo não identificado.';
            return $runtime;
        }

        $stage_data = $this->get_stage_data($process_id);
        $stage_field_index = $this->build_stage_field_index($stage_data);
        $flow_fields_index = $this->build_flow_fields_index($process_id);
        $mapping_config = $this->get_mapping_service()->get_mapping_config_for_process($process_id, $process_type_id);
        $runtime['mapper_status'] = (string) ($mapping_config['status'] ?? self::MAPPER_STATUS_ENABLED);

        if ($runtime['mapper_status'] !== self::MAPPER_STATUS_ENABLED) {
            $runtime['message'] = 'Mapeador desabilitado para este modelo de processo.';
            return $runtime;
        }
        $runtime['requires_export_confirmation'] = true;

        if (empty($mapping_config['profiles'])) {
            return $runtime;
        }

        $runtime['available_profiles'] = array_map(function($profile) {
            $profile_label = (string) ($profile['collection_name'] ?? ($profile['label'] ?? ''));
            return [
                'key' => (string) ($profile['key'] ?? ''),
                'label' => $profile_label,
            ];
        }, $mapping_config['profiles']);

        $profile_resolution = $this->resolve_runtime_profile($mapping_config, $stage_field_index);
        $selected_profile = $profile_resolution['profile'];
        $selected_profile_raw = $profile_resolution['selected_raw'];

        if (empty($selected_profile)) {
            if (count($mapping_config['profiles']) > 1) {
                $runtime['message'] = $selected_profile_raw === ''
                    ? 'Coleção de exportação ainda não foi selecionada no processo.'
                    : 'A coleção de exportação selecionada não corresponde a nenhuma configuração cadastrada.';
            } else {
                $runtime['message'] = 'Coleção de exportação não encontrada para este processo.';
            }
            return $runtime;
        }

        $collection_id = (int) ($selected_profile['collection_id'] ?? 0);
        $field_mappings = is_array($selected_profile['field_mappings'] ?? null) ? $selected_profile['field_mappings'] : [];
        $decision_rules = is_array($selected_profile['decision_rules'] ?? null)
            ? $selected_profile['decision_rules']
            : (is_array($mapping_config['decision_rules'] ?? null) ? $mapping_config['decision_rules'] : []);

        if (!$collection_id || empty($field_mappings)) {
            $runtime['message'] = 'Mapeamento incompleto: configuração sem coleção ou sem fields configurados.';
            return $runtime;
        }

        $mapped_fields = $this->build_mapped_fields($field_mappings, $flow_fields_index);
        $decision = $this->resolve_decision_state($decision_rules, $stage_field_index);

        $spreadsheet_file_name = '';
        if (!empty($decision['upload_field_id'])) {
            $spreadsheet_file_name = $this->extract_scalar_value($stage_field_index[$decision['upload_field_id']]['value'] ?? '');
            $spreadsheet_file_name = sanitize_file_name((string) $spreadsheet_file_name);
        }

        $runtime['enabled'] = true;
        $runtime['requires_export_confirmation'] = true;
        $runtime['collection_id'] = $collection_id;
        $runtime['selected_profile'] = [
            'key' => (string) ($selected_profile['key'] ?? ''),
            'label' => (string) ($selected_profile['collection_name'] ?? ($selected_profile['label'] ?? '')),
            'selected_raw' => $selected_profile_raw,
            'selector_field_id' => (string) ($mapping_config['profile_selector_field_id'] ?? ''),
        ];
        $runtime['decision'] = $decision;
        $runtime['mapped_fields'] = $mapped_fields;
        $runtime['spreadsheet_file_name'] = $spreadsheet_file_name;
        $runtime['spreadsheet_file_exists'] = !empty($this->resolve_uploaded_file_path($spreadsheet_file_name));
        $runtime['show_manual_matrix'] = $decision['is_multiple'] && $decision['entry_mode'] === 'manual';
        $runtime['export_decision'] = $this->get_saved_export_decision($process_id);
        if (
            in_array(($runtime['existing_export_result']['status'] ?? ''), ['success', 'partial'], true)
            && ($runtime['export_decision']['status'] ?? 'pending') === 'pending'
        ) {
            $runtime['export_decision'] = $this->build_default_export_decision(
                'confirmed',
                'A exportação para o Tainacan já foi concluída.'
            );
        }
        $runtime['message'] = 'Configuração de exportação carregada.';

        return $runtime;
    }

    public function save_manual_items($process_id, $rows) {
        $process_id = (int) $process_id;
        $runtime = $this->get_runtime_config($process_id);

        if (!$runtime['enabled']) {
            return [
                'success' => false,
                'message' => 'Mapeamento não habilitado para este processo.',
                'saved_rows' => [],
            ];
        }

        $allowed_field_ids = array_map(function($field) {
            return (string) ($field['obatala_field_id'] ?? '');
        }, $runtime['mapped_fields']);
        $allowed_field_ids = array_filter($allowed_field_ids);

        $normalized_rows = [];
        if (is_array($rows)) {
            foreach ($rows as $row) {
                if (!is_array($row)) {
                    continue;
                }

                $clean_row = [];
                foreach ($allowed_field_ids as $field_id) {
                    if (array_key_exists($field_id, $row)) {
                        $clean_row[$field_id] = $this->sanitize_mixed_value($row[$field_id]);
                    }
                }

                if (!empty($clean_row)) {
                    $normalized_rows[] = $clean_row;
                }
            }
        }

        update_post_meta($process_id, self::MANUAL_ITEMS_META_KEY, $normalized_rows);

        return [
            'success' => true,
            'message' => 'Dados dinâmicos de itens salvos com sucesso.',
            'saved_rows' => $normalized_rows,
        ];
    }

    public function execute_export($process_id, $force = false) {
        $process_id = (int) $process_id;
        $runtime = $this->get_runtime_config($process_id);
        $saved_result = $this->get_saved_export_result($process_id);

        if (!$runtime['enabled']) {
            $result = [
                'status' => 'skipped',
                'message' => $runtime['message'],
                'process_id' => $process_id,
                'collection_id' => 0,
                'exported_items' => [],
                'failed_items' => [],
                'warnings' => [],
                'created_at' => current_time('mysql'),
            ];
            $this->persist_export_result($process_id, $result);
            return $result;
        }

        if (!$force && isset($saved_result['status']) && $saved_result['status'] === 'success') {
            $saved_result['already_exported'] = true;
            return $saved_result;
        }

        $payload_result = $this->build_payload_rows($process_id, $runtime);
        if (!$payload_result['success']) {
            $result = [
                'status' => 'error',
                'message' => $payload_result['message'],
                'process_id' => $process_id,
                'collection_id' => (int) $runtime['collection_id'],
                'exported_items' => [],
                'failed_items' => [],
                'warnings' => $payload_result['warnings'] ?? [],
                'created_at' => current_time('mysql'),
            ];
            $this->persist_export_result($process_id, $result);
            return $result;
        }

        $export_result = $this->create_tainacan_items(
            $process_id,
            (int) $runtime['collection_id'],
            $runtime['mapped_fields'],
            $payload_result['rows']
        );

        $result = [
            'status' => $export_result['status'],
            'message' => $export_result['message'],
            'process_id' => $process_id,
            'collection_id' => (int) $runtime['collection_id'],
            'exported_items' => $export_result['exported_items'],
            'failed_items' => $export_result['failed_items'],
            'warnings' => array_merge($payload_result['warnings'] ?? [], $export_result['warnings'] ?? []),
            'created_at' => current_time('mysql'),
        ];

        $this->persist_export_result($process_id, $result);
        return $result;
    }

    public function mark_export_pending_confirmation($process_id) {
        $process_id = (int) $process_id;
        $current = $this->get_saved_export_decision($process_id);

        if (in_array(($current['status'] ?? ''), ['confirmed', 'refused'], true)) {
            return $current;
        }

        $pending = $this->build_default_export_decision(
            'pending',
            'Processo concluído. Aguardando confirmação para exportação ao Tainacan.'
        );
        $pending['decided_at'] = current_time('mysql');
        $pending['decided_by'] = (int) get_current_user_id();
        $pending['decided_by_name'] = $this->get_current_user_display_name();

        $this->persist_export_decision($process_id, $pending);
        return $pending;
    }

    public function get_export_review_data($process_id, $max_preview_rows = 20) {
        $process_id = (int) $process_id;
        $runtime = $this->get_runtime_config($process_id);
        $preview_limit = max(1, (int) $max_preview_rows);

        $base_response = [
            'success' => false,
            'process_id' => $process_id,
            'runtime' => $runtime,
            'decision' => $runtime['export_decision'] ?? $this->build_default_export_decision('not_required', ''),
            'total_rows' => 0,
            'rows_preview' => [],
            'preview_limit' => $preview_limit,
            'truncated' => false,
            'warnings' => [],
            'message' => $runtime['message'] ?? 'Não foi possível carregar o resumo da exportação.',
        ];

        if (!$runtime['enabled']) {
            return $base_response;
        }

        $payload_result = $this->build_payload_rows($process_id, $runtime);
        if (!$payload_result['success']) {
            $base_response['warnings'] = is_array($payload_result['warnings'] ?? null) ? $payload_result['warnings'] : [];
            $base_response['message'] = (string) ($payload_result['message'] ?? 'Não foi possível montar o resumo de exportação.');
            return $base_response;
        }

        $rows = is_array($payload_result['rows'] ?? null) ? $payload_result['rows'] : [];
        $total_rows = count($rows);

        return [
            'success' => true,
            'process_id' => $process_id,
            'runtime' => $runtime,
            'decision' => $runtime['export_decision'] ?? $this->build_default_export_decision('pending', ''),
            'total_rows' => $total_rows,
            'rows_preview' => array_slice($rows, 0, $preview_limit),
            'preview_limit' => $preview_limit,
            'truncated' => $total_rows > $preview_limit,
            'warnings' => is_array($payload_result['warnings'] ?? null) ? $payload_result['warnings'] : [],
            'message' => 'Resumo de exportação carregado com sucesso.',
        ];
    }

    public function decide_export($process_id, $decision_action, $force = false) {
        $process_id = (int) $process_id;
        $action = strtolower(trim((string) $decision_action));
        $runtime = $this->get_runtime_config($process_id);

        if (!$runtime['enabled']) {
            return [
                'success' => false,
                'message' => $runtime['message'] ?? 'Mapeamento não habilitado para este processo.',
                'decision' => $runtime['export_decision'] ?? $this->build_default_export_decision('not_required', ''),
                'export_result' => [],
            ];
        }

        if ($action === 'refuse') {
            $export_result = [
                'status' => 'skipped',
                'message' => 'Exportação recusada manualmente pelo usuário responsável.',
                'process_id' => $process_id,
                'collection_id' => (int) ($runtime['collection_id'] ?? 0),
                'exported_items' => [],
                'failed_items' => [],
                'warnings' => [],
                'created_at' => current_time('mysql'),
            ];

            $this->persist_export_result($process_id, $export_result);

            $decision = $this->build_default_export_decision(
                'refused',
                'A exportação para o Tainacan foi recusada.'
            );
            $decision['decided_at'] = current_time('mysql');
            $decision['decided_by'] = (int) get_current_user_id();
            $decision['decided_by_name'] = $this->get_current_user_display_name();
            $this->persist_export_decision($process_id, $decision);

            update_post_meta($process_id, 'status', self::PROCESS_STATUS_FINISHED);

            return [
                'success' => true,
                'message' => $decision['message'],
                'decision' => $decision,
                'export_result' => $export_result,
            ];
        }

        if ($action !== 'confirm') {
            return [
                'success' => false,
                'message' => 'Decisão de exportação inválida. Use confirm ou refuse.',
                'decision' => $runtime['export_decision'] ?? $this->build_default_export_decision('pending', ''),
                'export_result' => [],
            ];
        }

        $export_result = $this->execute_export($process_id, $force);
        $result_status = (string) ($export_result['status'] ?? 'error');

        if ($result_status === 'error') {
            $decision = $this->build_default_export_decision(
                'failed',
                'A exportação falhou. Revise os dados e tente confirmar novamente.'
            );
            $decision['decided_at'] = current_time('mysql');
            $decision['decided_by'] = (int) get_current_user_id();
            $decision['decided_by_name'] = $this->get_current_user_display_name();
            $this->persist_export_decision($process_id, $decision);

            update_post_meta($process_id, 'status', self::PROCESS_STATUS_AWAITING_EXPORT_CONFIRMATION);

            return [
                'success' => false,
                'message' => (string) ($export_result['message'] ?? $decision['message']),
                'decision' => $decision,
                'export_result' => $export_result,
            ];
        }

        $decision = $this->build_default_export_decision(
            'confirmed',
            'Exportação confirmada e processada no Tainacan.'
        );
        $decision['decided_at'] = current_time('mysql');
        $decision['decided_by'] = (int) get_current_user_id();
        $decision['decided_by_name'] = $this->get_current_user_display_name();
        $this->persist_export_decision($process_id, $decision);

        update_post_meta($process_id, 'status', self::PROCESS_STATUS_FINISHED);

        return [
            'success' => true,
            'message' => (string) ($export_result['message'] ?? $decision['message']),
            'decision' => $decision,
            'export_result' => $export_result,
        ];
    }

    private function persist_export_result($process_id, array $result) {
        update_post_meta((int) $process_id, self::EXPORT_RESULT_META_KEY, $result);
    }

    private function persist_export_decision($process_id, array $decision) {
        update_post_meta((int) $process_id, self::EXPORT_DECISION_META_KEY, $decision);
    }

    private function get_saved_export_decision($process_id) {
        $raw = get_post_meta((int) $process_id, self::EXPORT_DECISION_META_KEY, true);

        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $this->normalize_export_decision($decoded);
            }
        }

        if (is_array($raw)) {
            return $this->normalize_export_decision($raw);
        }

        return $this->build_default_export_decision('pending', 'Aguardando confirmação de exportação.');
    }

    private function build_default_export_decision($status, $message) {
        return [
            'status' => (string) $status,
            'message' => (string) $message,
            'decided_at' => '',
            'decided_by' => 0,
            'decided_by_name' => '',
        ];
    }

    private function normalize_export_decision(array $decision) {
        $status = strtolower(trim((string) ($decision['status'] ?? 'pending')));
        if (!in_array($status, ['not_required', 'pending', 'confirmed', 'refused', 'failed'], true)) {
            $status = 'pending';
        }

        return [
            'status' => $status,
            'message' => (string) ($decision['message'] ?? ''),
            'decided_at' => (string) ($decision['decided_at'] ?? ''),
            'decided_by' => (int) ($decision['decided_by'] ?? 0),
            'decided_by_name' => (string) ($decision['decided_by_name'] ?? ''),
        ];
    }

    private function get_current_user_display_name() {
        $user_id = (int) get_current_user_id();
        if (!$user_id) {
            return '';
        }

        $user = get_userdata($user_id);
        if (!is_object($user)) {
            return '';
        }

        return (string) $user->display_name;
    }

    private function get_saved_export_result($process_id) {
        $raw = get_post_meta((int) $process_id, self::EXPORT_RESULT_META_KEY, true);
        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        return is_array($raw) ? $raw : [];
    }

    private function get_saved_manual_items($process_id) {
        $saved = get_post_meta((int) $process_id, self::MANUAL_ITEMS_META_KEY, true);
        if (is_string($saved)) {
            $decoded = json_decode($saved, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        return is_array($saved) ? $saved : [];
    }

    private function get_process_type_id($process_id) {
        $meta = get_post_meta((int) $process_id, 'process_type', true);
        if (is_array($meta)) {
            $meta = reset($meta);
        }
        return (int) $meta;
    }

    private function get_mapping_service() {
        return new TainacanMappingService();
    }

    private function resolve_runtime_profile(array $mapping_config, array $stage_field_index) {
        $selector_field_id = (string) ($mapping_config['profile_selector_field_id'] ?? '');
        $profiles = is_array($mapping_config['profiles'] ?? null) ? $mapping_config['profiles'] : [];
        $selected_raw = '';

        if ($selector_field_id !== '' && isset($stage_field_index[$selector_field_id])) {
            $selected_raw = $this->extract_scalar_value($stage_field_index[$selector_field_id]['value'] ?? '');
        }

        $profile = $this->get_mapping_service()->resolve_profile_by_selected_value($mapping_config, $selected_raw);

        if (!$profile && count($profiles) === 1 && $selector_field_id === '') {
            $profile = $profiles[0];
        }

        return [
            'profile' => $profile,
            'selected_raw' => $selected_raw,
        ];
    }

    private function get_stage_data($process_id) {
        $stage_data = get_post_meta((int) $process_id, 'stageData', true);
        $stage_data = maybe_unserialize($stage_data);

        if (is_string($stage_data)) {
            $decoded = json_decode($stage_data, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return is_array($stage_data) ? $stage_data : [];
    }

    private function build_stage_field_index(array $stage_data) {
        $index = [];

        foreach ($stage_data as $stage_id => $stage_payload) {
            $fields = $stage_payload['fields'] ?? [];
            if (!is_array($fields)) {
                continue;
            }

            foreach ($fields as $field_entry) {
                $field_id = isset($field_entry['fieldId']) ? (string) $field_entry['fieldId'] : '';
                if ($field_id === '') {
                    continue;
                }

                $index[$field_id] = [
                    'stage_id' => (string) $stage_id,
                    'value' => $field_entry['value'] ?? '',
                ];
            }
        }

        return $index;
    }

    private function build_flow_fields_index($process_id) {
        $flow_data = get_post_meta((int) $process_id, 'flowData', true);
        $flow_data = maybe_unserialize($flow_data);

        if (is_string($flow_data)) {
            $decoded = json_decode($flow_data, true);
            if (is_array($decoded)) {
                $flow_data = $decoded;
            }
        }

        if (!is_array($flow_data) || !isset($flow_data['nodes']) || !is_array($flow_data['nodes'])) {
            return [];
        }

        $index = [];
        foreach ($flow_data['nodes'] as $node) {
            $node_id = isset($node['id']) ? (string) $node['id'] : '';
            if ($node_id === '' || $node_id === 'Start' || $node_id === 'End' || strpos($node_id, 'Condicional') === 0) {
                continue;
            }

            $fields = $node['data']['fields'] ?? [];
            if (!is_array($fields)) {
                continue;
            }

            foreach ($fields as $field) {
                $field_id = isset($field['id']) ? (string) $field['id'] : '';
                if ($field_id === '') {
                    continue;
                }

                $index[$field_id] = [
                    'id' => $field_id,
                    'stage' => $node_id,
                    'type' => isset($field['type']) ? (string) $field['type'] : '',
                    'label' => isset($field['config']['label']) ? (string) $field['config']['label'] : ($field['title'] ?? $field_id),
                    'config' => is_array($field['config'] ?? null) ? $field['config'] : [],
                ];
            }
        }

        return $index;
    }

    private function build_mapped_fields(array $field_mappings, array $flow_fields_index) {
        $mapped_fields = [];

        $metadata_repository = null;
        if (class_exists('\\Tainacan\\Repositories\\Metadata')) {
            $metadata_repository = \Tainacan\Repositories\Metadata::get_instance();
        }

        foreach ($field_mappings as $mapping) {
            if (!is_array($mapping)) {
                continue;
            }

            $obatala_field = is_array($mapping['obatala_field'] ?? null) ? $mapping['obatala_field'] : [];
            $field_id = isset($obatala_field['value']) ? (string) $obatala_field['value'] : '';
            $metadata_id = isset($mapping['tainacan_metadata_id']) ? (int) $mapping['tainacan_metadata_id'] : 0;

            if ($field_id === '' || !$metadata_id) {
                continue;
            }

            $flow_field = $flow_fields_index[$field_id] ?? [];
            $field_type = (string) ($flow_field['type'] ?? ($obatala_field['type'] ?? ''));
            $field_label = (string) ($flow_field['label'] ?? ($obatala_field['label'] ?? $field_id));
            $field_stage = (string) ($flow_field['stage'] ?? ($obatala_field['stage'] ?? ''));
            $field_config = is_array($flow_field['config'] ?? null) ? $flow_field['config'] : [];

            $metadata_name = 'Metadado ' . $metadata_id;
            if ($metadata_repository) {
                $metadatum = $metadata_repository->fetch($metadata_id);
                if (is_object($metadatum) && method_exists($metadatum, 'get_name')) {
                    $metadata_name = (string) $metadatum->get_name();
                }
            }

            $mapped_fields[] = [
                'obatala_field_id' => $field_id,
                'obatala_field_label' => $field_label,
                'obatala_field_type' => $field_type,
                'obatala_field_stage' => $field_stage,
                'obatala_field_config' => $field_config,
                'tainacan_metadata_id' => $metadata_id,
                'tainacan_metadata_name' => $metadata_name,
            ];
        }

        return $mapped_fields;
    }

    private function resolve_decision_state(array $decision_rules, array $stage_field_index) {
        $multi_raw = $this->extract_scalar_value($stage_field_index[$decision_rules['multi_or_single_field_id']]['value'] ?? '');
        $quantity_raw = $this->extract_scalar_value($stage_field_index[$decision_rules['quantity_field_id']]['value'] ?? '');
        $entry_mode_raw = $this->extract_scalar_value($stage_field_index[$decision_rules['data_entry_mode_field_id']]['value'] ?? '');
        $same_values_raw = $this->extract_scalar_value($stage_field_index[$decision_rules['same_values_mode_field_id']]['value'] ?? '');
        $same_values_prefix_mode_raw = $this->extract_scalar_value($stage_field_index[$decision_rules['same_values_prefix_mode_field_id']]['value'] ?? '');
        $same_values_prefix_text_raw = $this->extract_scalar_value($stage_field_index[$decision_rules['same_values_prefix_text_field_id']]['value'] ?? '');

        $is_multiple = false;
        if ($this->matches_choice($multi_raw, $decision_rules['multi_items_value'])) {
            $is_multiple = true;
        } elseif ($this->matches_choice($multi_raw, $decision_rules['single_item_value'])) {
            $is_multiple = false;
        }

        $fallback_quantity = (int) preg_replace('/[^0-9]/', '', (string) $decision_rules['quantity_fallback']);
        $fallback_quantity = max(1, $fallback_quantity ?: 1);

        $quantity = $fallback_quantity;
        if (is_numeric($quantity_raw)) {
            $quantity = (int) $quantity_raw;
        }
        $quantity = max(1, $quantity);

        if ($multi_raw === '' && $quantity > 1) {
            $is_multiple = true;
        }

        if (!$is_multiple) {
            $quantity = 1;
        }

        $entry_mode = 'manual';
        if ($this->matches_choice($entry_mode_raw, $decision_rules['upload_mode_value']) || $this->matches_choice($entry_mode_raw, 'upload')) {
            $entry_mode = 'upload';
        }

        $same_values_mode = false;
        if ($this->matches_choice($same_values_raw, $decision_rules['same_values_enabled_value'])) {
            $same_values_mode = true;
        }

        $same_values_id_prefix = '';
        if ($this->matches_choice($same_values_prefix_mode_raw, $decision_rules['same_values_enabled_value'])) {
            $same_values_id_prefix = sanitize_text_field((string) $same_values_prefix_text_raw);
        } elseif ($same_values_prefix_mode_raw === '') {
            $same_values_id_prefix = sanitize_text_field((string) ($decision_rules['same_values_id_prefix'] ?? ''));
        }

        return [
            'is_multiple' => $is_multiple,
            'quantity' => $quantity,
            'entry_mode' => $entry_mode,
            'same_values_mode' => $same_values_mode,
            'multi_or_single_raw' => $multi_raw,
            'data_entry_mode_raw' => $entry_mode_raw,
            'same_values_raw' => $same_values_raw,
            'same_values_prefix_mode_raw' => $same_values_prefix_mode_raw,
            'same_values_prefix_text_raw' => $same_values_prefix_text_raw,
            'upload_field_id' => (string) $decision_rules['spreadsheet_upload_field_id'],
            'same_values_unique_id_field_id' => (string) $decision_rules['same_values_unique_id_field_id'],
            'same_values_id_prefix' => $same_values_id_prefix,
        ];
    }

    private function build_payload_rows($process_id, array $runtime) {
        $warnings = [];

        $stage_data = $this->get_stage_data($process_id);
        $stage_field_index = $this->build_stage_field_index($stage_data);
        $base_row = [];
        foreach ($runtime['mapped_fields'] as $mapped_field) {
            $field_id = (string) ($mapped_field['obatala_field_id'] ?? '');
            if ($field_id === '') {
                continue;
            }
            $base_row[$field_id] = $this->normalize_obatala_value($stage_field_index[$field_id]['value'] ?? '');
        }

        $rows = [];
        $decision = $runtime['decision'];

        if ($decision['entry_mode'] === 'upload') {
            $file_name = $runtime['spreadsheet_file_name'] ?? '';
            $file_path = $this->resolve_uploaded_file_path($file_name);
            if (empty($file_path)) {
                return [
                    'success' => false,
                    'message' => 'Modo planilha ativo, mas nenhum arquivo de planilha válido foi encontrado.',
                    'warnings' => [],
                    'rows' => [],
                ];
            }

            $sheet_rows = $this->parse_spreadsheet_rows($file_path, $runtime['mapped_fields']);
            if (!$sheet_rows['success']) {
                return [
                    'success' => false,
                    'message' => $sheet_rows['message'],
                    'warnings' => is_array($sheet_rows['warnings'] ?? null) ? $sheet_rows['warnings'] : [],
                    'rows' => [],
                ];
            }

            $rows = $sheet_rows['rows'];
            $warnings = array_merge($warnings, is_array($sheet_rows['warnings'] ?? null) ? $sheet_rows['warnings'] : []);
            if (empty($rows)) {
                return [
                    'success' => false,
                    'message' => 'A planilha foi lida, mas não contém linhas válidas para exportação.',
                    'warnings' => [],
                    'rows' => [],
                ];
            }
        } else {
            if ($decision['is_multiple']) {
                $target_quantity = max(1, (int) $decision['quantity']);
                $rows = array_fill(0, $target_quantity, $base_row);

                foreach ($runtime['mapped_fields'] as $mapped_field) {
                    $field_id = (string) ($mapped_field['obatala_field_id'] ?? '');
                    if ($field_id === '') {
                        continue;
                    }

                    $raw_stage_value = $stage_field_index[$field_id]['value'] ?? ($base_row[$field_id] ?? '');
                    $should_replicate_single_value = !empty($decision['same_values_mode'])
                        && $field_id !== (string) ($decision['same_values_unique_id_field_id'] ?? '');

                    $manual_values = $this->extract_manual_item_values_from_stage(
                        $raw_stage_value,
                        $target_quantity,
                        $should_replicate_single_value
                    );

                    foreach ($rows as $row_index => $row) {
                        $rows[$row_index][$field_id] = $manual_values[$row_index] ?? '';
                    }
                }
            } else {
                $rows = [$base_row];
            }
        }

        $rows = array_map(function($row) use ($base_row) {
            if (!is_array($row)) {
                return $base_row;
            }
            return array_merge($base_row, $row);
        }, $rows);

        if (!empty($decision['same_values_mode']) && !empty($decision['same_values_unique_id_field_id']) && !empty($rows)) {
            $unique_field_id = (string) $decision['same_values_unique_id_field_id'];
            $prefix = (string) $decision['same_values_id_prefix'];

            foreach ($rows as $index => $row) {
                $current_value = $this->extract_scalar_value($row[$unique_field_id] ?? '');
                if ($current_value === '') {
                    $rows[$index][$unique_field_id] = $prefix . ($index + 1);
                }
            }
        }

        return [
            'success' => true,
            'message' => 'Payload de exportação preparado com sucesso.',
            'warnings' => $warnings,
            'rows' => $rows,
        ];
    }

    private function extract_manual_item_values_from_stage($value, $target_quantity, $replicate_single_value = false) {
        $target_quantity = max(1, (int) $target_quantity);
        $values = [];

        if (is_array($value)) {
            $entries = array_values($value);

            if ($this->looks_like_manual_item_matrix($entries, $target_quantity)) {
                $values = $entries;
            } else {
                $values = [$entries];
            }
        } else {
            $values = [$value];
        }

        $values = array_values(array_map(function($entry) {
            return $this->normalize_manual_item_entry($entry);
        }, $values));

        while (count($values) < $target_quantity) {
            if ($replicate_single_value) {
                $values[] = $values[0] ?? '';
            } else {
                $values[] = '';
            }
        }

        if (count($values) > $target_quantity) {
            $values = array_slice($values, 0, $target_quantity);
        }

        return $values;
    }

    private function looks_like_manual_item_matrix(array $values, $target_quantity) {
        if (count($values) <= 1) {
            return false;
        }

        $first_non_empty = null;
        foreach ($values as $entry) {
            if (!$this->is_empty_value($entry)) {
                $first_non_empty = $entry;
                break;
            }
        }

        if ($first_non_empty === null) {
            return false;
        }

        if (is_array($first_non_empty)) {
            return true;
        }

        return (int) $target_quantity > 1 && count($values) >= (int) $target_quantity;
    }

    private function normalize_manual_item_entry($value) {
        if (!is_array($value)) {
            return $this->normalize_obatala_value($value);
        }

        if (count($value) === 1) {
            $first = reset($value);

            if (!is_array($first) && !is_object($first)) {
                return $this->normalize_obatala_value($first);
            }
        }

        $normalized = array_map(function($entry) {
            return $this->normalize_obatala_value($entry);
        }, $value);

        return array_values(array_filter($normalized, function($entry) {
            return !$this->is_empty_value($entry);
        }));
    }

    private function create_tainacan_items($process_id, $collection_id, array $mapped_fields, array $rows) {
        if (!class_exists('\\Tainacan\\Repositories\\Items') ||
            !class_exists('\\Tainacan\\Repositories\\Item_Metadata') ||
            !class_exists('\\Tainacan\\Repositories\\Metadata') ||
            !class_exists('\\Tainacan\\Repositories\\Collections') ||
            !class_exists('\\Tainacan\\Entities\\Item') ||
            !class_exists('\\Tainacan\\Entities\\Item_Metadata_Entity')) {
            return [
                'status' => 'error',
                'message' => 'As classes do Tainacan não estão disponíveis para exportação.',
                'exported_items' => [],
                'failed_items' => [],
                'warnings' => [],
            ];
        }

        $collections_repository = \Tainacan\Repositories\Collections::get_instance();
        $items_repository = \Tainacan\Repositories\Items::get_instance();
        $metadata_repository = \Tainacan\Repositories\Metadata::get_instance();
        $item_metadata_repository = \Tainacan\Repositories\Item_Metadata::get_instance();

        $collection = $collections_repository->fetch((int) $collection_id);
        if (!$collection instanceof \Tainacan\Entities\Collection) {
            return [
                'status' => 'error',
                'message' => 'Coleção do Tainacan não encontrada para exportação.',
                'exported_items' => [],
                'failed_items' => [],
                'warnings' => [],
            ];
        }

        $warnings = [];
        $process_reference_url = $this->build_process_reference_url((int) $process_id);
        $process_reference_metadatum = $this->ensure_process_reference_metadatum($collection, $metadata_repository, $warnings);

        $metadatum_cache = [];
        foreach ($mapped_fields as $mapped_field) {
            $metadata_id = (int) ($mapped_field['tainacan_metadata_id'] ?? 0);
            if (!$metadata_id || isset($metadatum_cache[$metadata_id])) {
                continue;
            }
            $metadatum_cache[$metadata_id] = $metadata_repository->fetch($metadata_id);
        }

        $process_post = get_post((int) $process_id);
        $process_title = $process_post ? $process_post->post_title : ('Processo ' . (int) $process_id);

        $exported_items = [];
        $failed_items = [];

        foreach ($rows as $row_index => $row) {
            if (!is_array($row)) {
                continue;
            }

            $item = new \Tainacan\Entities\Item();
            $item->set_collection($collection);
            $item->set_status('draft');
            $item->set_title($this->build_item_title($process_title, $row, $mapped_fields, $row_index));

            if (!$item->validate()) {
                $failed_items[] = [
                    'row' => $row_index + 1,
                    'message' => 'Falha ao validar item no Tainacan.',
                    'errors' => $item->get_errors(),
                ];
                continue;
            }

            $item = $items_repository->insert($item);
            if (!$item instanceof \Tainacan\Entities\Item) {
                $failed_items[] = [
                    'row' => $row_index + 1,
                    'message' => 'Falha ao inserir item no Tainacan.',
                    'errors' => [],
                ];
                continue;
            }

            $row_errors = [];

            foreach ($mapped_fields as $mapped_field) {
                $field_id = (string) ($mapped_field['obatala_field_id'] ?? '');
                $metadata_id = (int) ($mapped_field['tainacan_metadata_id'] ?? 0);
                $obatala_type = (string) ($mapped_field['obatala_field_type'] ?? '');

                if ($field_id === '' || !$metadata_id) {
                    continue;
                }

                $metadatum = $metadatum_cache[$metadata_id] ?? null;
                if (!$metadatum instanceof \Tainacan\Entities\Metadatum) {
                    $row_errors[] = [
                        'field_id' => $field_id,
                        'metadata_id' => $metadata_id,
                        'message' => 'Metadado do Tainacan não encontrado.',
                    ];
                    continue;
                }

                $value = $row[$field_id] ?? '';
                if ($this->is_empty_value($value)) {
                    continue;
                }

                $normalized_value = $this->normalize_value_for_metadatum($value, $metadatum, $obatala_type);

                $item_metadata = new \Tainacan\Entities\Item_Metadata_Entity($item, $metadatum);
                $item_metadata->set_value($normalized_value);

                if (!$item_metadata->validate()) {
                    $row_errors[] = [
                        'field_id' => $field_id,
                        'metadata_id' => $metadata_id,
                        'message' => 'Valor inválido para o metadado no Tainacan.',
                        'errors' => $item_metadata->get_errors(),
                    ];
                    continue;
                }

                $item_metadata_repository->insert($item_metadata);
            }

            if (!empty($row_errors)) {
                $items_repository->trash($item);
                $failed_items[] = [
                    'row' => $row_index + 1,
                    'message' => 'Item não exportado por erro de validação de metadados.',
                    'errors' => $row_errors,
                ];
                continue;
            }

            if (
                $process_reference_metadatum instanceof \Tainacan\Entities\Metadatum
                && $this->is_process_reference_metadatum_compatible($process_reference_metadatum)
                && $process_reference_url !== ''
            ) {
                $process_reference_item_metadata = new \Tainacan\Entities\Item_Metadata_Entity($item, $process_reference_metadatum);
                $process_reference_item_metadata->set_value($process_reference_url);

                if (!$process_reference_item_metadata->validate()) {
                    $warnings[] = [
                        'row' => $row_index + 1,
                        'metadata_id' => (int) $process_reference_metadatum->get_id(),
                        'message' => 'Não foi possível salvar o link de referência do processo no Obatala.',
                        'errors' => $process_reference_item_metadata->get_errors(),
                    ];
                } else {
                    $inserted_process_reference = $item_metadata_repository->insert($process_reference_item_metadata);
                    if (!$inserted_process_reference) {
                        $warnings[] = [
                            'row' => $row_index + 1,
                            'metadata_id' => (int) $process_reference_metadatum->get_id(),
                            'message' => 'Falha ao persistir o link de referência do processo no Obatala.',
                        ];
                    }
                }
            }

            $item->set_status('publish');
            if (!$item->validate()) {
                $items_repository->trash($item);
                $failed_items[] = [
                    'row' => $row_index + 1,
                    'message' => 'Item criado, mas não pôde ser publicado.',
                    'errors' => $item->get_errors(),
                ];
                continue;
            }

            $item = $items_repository->update($item);
            $exported_items[] = [
                'row' => $row_index + 1,
                'item_id' => (int) $item->get_id(),
                'title' => (string) $item->get_title(),
                'url' => get_permalink((int) $item->get_id()),
            ];
        }

        $total_exported = count($exported_items);
        $total_failed = count($failed_items);

        if ($total_exported > 0 && $total_failed === 0) {
            $status = 'success';
            $message = sprintf('%d item(ns) exportado(s) com sucesso para o Tainacan.', $total_exported);
        } elseif ($total_exported > 0 && $total_failed > 0) {
            $status = 'partial';
            $message = sprintf(
                'Exportação parcial: %d item(ns) exportado(s) e %d item(ns) com erro.',
                $total_exported,
                $total_failed
            );
        } else {
            $status = 'error';
            $message = 'Nenhum item foi exportado para o Tainacan.';
        }

        return [
            'status' => $status,
            'message' => $message,
            'exported_items' => $exported_items,
            'failed_items' => $failed_items,
            'warnings' => $warnings,
        ];
    }

    private function build_item_title($process_title, array $row, array $mapped_fields, $row_index) {
        foreach ($mapped_fields as $mapped_field) {
            $candidate_id = (string) ($mapped_field['obatala_field_id'] ?? '');
            if ($candidate_id === '') {
                continue;
            }

            $label = strtolower((string) ($mapped_field['obatala_field_label'] ?? ''));
            if (strpos($label, 'titulo') !== false || strpos($label, 'título') !== false || strpos($label, 'title') !== false || strpos($label, 'nome') !== false) {
                $value = $this->extract_scalar_value($row[$candidate_id] ?? '');
                if ($value !== '') {
                    return $value;
                }
            }
        }

        foreach ($row as $value) {
            $scalar = $this->extract_scalar_value($value);
            if ($scalar !== '') {
                return sprintf('%s - %s', $process_title, $scalar);
            }
        }

        return sprintf('%s - Item %d', $process_title, $row_index + 1);
    }

    private function normalize_value_for_metadatum($value, $metadatum, $obatala_type = '') {
        $metadata_type_object = method_exists($metadatum, 'get_metadata_type_object')
            ? $metadatum->get_metadata_type_object()
            : null;

        $primitive_type = is_object($metadata_type_object) && method_exists($metadata_type_object, 'get_primitive_type')
            ? (string) $metadata_type_object->get_primitive_type()
            : '';

        $is_multiple = method_exists($metadatum, 'is_multiple') ? (bool) $metadatum->is_multiple() : false;

        if ($is_multiple) {
            if (!is_array($value)) {
                $value = $this->split_multi_value((string) $value);
            }

            $normalized = array_values(array_filter(array_map(function($entry) use ($primitive_type, $obatala_type) {
                return $this->normalize_scalar_by_type($entry, $primitive_type, $obatala_type);
            }, $value), function($entry) {
                return !$this->is_empty_value($entry);
            }));

            return $normalized;
        }

        if (is_array($value)) {
            $value = reset($value);
        }

        return $this->normalize_scalar_by_type($value, $primitive_type, $obatala_type);
    }

    private function normalize_scalar_by_type($value, $primitive_type, $obatala_type = '') {
        $scalar = $this->extract_scalar_value($value);

        if ($scalar === '') {
            return '';
        }

        if ($obatala_type === 'datepicker') {
            $parts = explode('/', $scalar);
            if (count($parts) === 3) {
                $scalar = sprintf('%04d-%02d-%02d', (int) $parts[2], (int) $parts[1], (int) $parts[0]);
            }
        }

        if ($primitive_type === 'numeric' && is_numeric($scalar)) {
            return (strpos((string) $scalar, '.') !== false) ? (float) $scalar : (int) $scalar;
        }

        return $scalar;
    }

    private function split_multi_value($value) {
        if (!is_string($value)) {
            return [$value];
        }

        $delimiter = null;
        if (strpos($value, '|') !== false) {
            $delimiter = '|';
        } elseif (strpos($value, ';') !== false) {
            $delimiter = ';';
        }

        if ($delimiter === null) {
            return [$value];
        }

        $parts = array_map('trim', explode($delimiter, $value));
        return array_values(array_filter($parts, function($part) {
            return $part !== '';
        }));
    }

    private function parse_spreadsheet_rows($file_path, array $mapped_fields) {
        $extension = strtolower(pathinfo($file_path, PATHINFO_EXTENSION));

        if (!file_exists($file_path)) {
            return [
                'success' => false,
                'message' => 'Arquivo de planilha não encontrado.',
                'rows' => [],
            ];
        }

        $rows = [];

        if ($extension === 'csv') {
            $rows = $this->parse_csv_file($file_path);
        } elseif (in_array($extension, ['xlsx', 'xls'], true)) {
            if (!class_exists('\\PhpOffice\\PhpSpreadsheet\\IOFactory')) {
                return [
                    'success' => false,
                    'message' => 'Leitura de arquivo XLS/XLSX indisponível no servidor.',
                    'rows' => [],
                ];
            }

            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file_path);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray(null, true, true, false);
        } else {
            return [
                'success' => false,
                'message' => 'Formato de planilha não suportado. Use CSV, XLS ou XLSX.',
                'rows' => [],
            ];
        }

        if (empty($rows)) {
            return [
                'success' => false,
                'message' => 'A planilha está vazia.',
                'rows' => [],
            ];
        }

        $first_row = array_map(function($cell) {
            return trim((string) $cell);
        }, $rows[0]);

        $header_index = [];
        foreach ($first_row as $column => $header) {
            $normalized = $this->normalize_header_key($header);
            if ($normalized !== '') {
                $header_index[$normalized] = $column;
            }
        }

        $mapped_column_by_field = [];
        $mapped_field_by_id = [];
        foreach ($mapped_fields as $mapped_field) {
            $field_id = (string) ($mapped_field['obatala_field_id'] ?? '');
            if ($field_id === '') {
                continue;
            }
            $mapped_field_by_id[$field_id] = $mapped_field;

            $aliases = array_filter([
                $this->normalize_header_key($field_id),
                $this->normalize_header_key($mapped_field['obatala_field_label'] ?? ''),
                $this->normalize_header_key((string) ($mapped_field['tainacan_metadata_id'] ?? '')),
                $this->normalize_header_key($mapped_field['tainacan_metadata_name'] ?? ''),
            ]);

            foreach ($aliases as $alias) {
                if (isset($header_index[$alias])) {
                    $mapped_column_by_field[$field_id] = $header_index[$alias];
                    break;
                }
            }
        }

        $has_header_match = !empty($mapped_column_by_field);
        if ($has_header_match && count($mapped_column_by_field) < count($mapped_field_by_id)) {
            $missing_headers = [];
            foreach ($mapped_field_by_id as $field_id => $mapped_field) {
                if (!isset($mapped_column_by_field[$field_id])) {
                    $missing_headers[] = $this->get_mapped_field_display_label($mapped_field);
                }
            }

            return [
                'success' => false,
                'message' => 'A planilha não possui todas as colunas mapeadas. Faltando: ' . implode(', ', $missing_headers) . '.',
                'rows' => [],
                'warnings' => [],
            ];
        }

        $data_rows = $has_header_match ? array_slice($rows, 1) : $rows;

        $normalized_rows = [];
        $validation_errors = [];
        foreach ($data_rows as $row_offset => $row_values) {
            if (!is_array($row_values)) {
                continue;
            }

            $row_payload = [];
            $row_number = $has_header_match ? ($row_offset + 2) : ($row_offset + 1);
            foreach ($mapped_fields as $index => $mapped_field) {
                $field_id = (string) ($mapped_field['obatala_field_id'] ?? '');
                if ($field_id === '') {
                    continue;
                }

                if ($has_header_match) {
                    if (!isset($mapped_column_by_field[$field_id])) {
                        continue;
                    }
                    $column = $mapped_column_by_field[$field_id];
                } else {
                    $column = $index;
                }

                $value = $row_values[$column] ?? '';
                $validation_error = $this->validate_spreadsheet_cell_value($value, $mapped_field);
                if ($validation_error !== '') {
                    $validation_errors[] = sprintf(
                        'Linha %d, campo "%s": %s',
                        $row_number,
                        $this->get_mapped_field_display_label($mapped_field),
                        $validation_error
                    );
                }
                $row_payload[$field_id] = $this->normalize_obatala_value($value);
            }

            $has_any_value = false;
            foreach ($row_payload as $value) {
                if (!$this->is_empty_value($value)) {
                    $has_any_value = true;
                    break;
                }
            }

            if ($has_any_value) {
                $normalized_rows[] = $row_payload;
            }
        }

        if (!empty($validation_errors)) {
            $max_errors = 12;
            $visible_errors = array_slice($validation_errors, 0, $max_errors);
            $extra_count = count($validation_errors) - count($visible_errors);

            $message = 'A planilha contém valores em formato inválido: ' . implode(' | ', $visible_errors);
            if ($extra_count > 0) {
                $message .= sprintf(' | ...e mais %d ocorrência(s).', $extra_count);
            }

            return [
                'success' => false,
                'message' => $message,
                'rows' => [],
                'warnings' => [],
            ];
        }

        return [
            'success' => true,
            'message' => 'Planilha lida com sucesso.',
            'rows' => $normalized_rows,
            'warnings' => [],
        ];
    }

    private function get_mapped_field_display_label(array $mapped_field) {
        $label = trim((string) ($mapped_field['tainacan_metadata_name'] ?? ''));
        if ($label === '') {
            $label = trim((string) ($mapped_field['obatala_field_label'] ?? ''));
        }
        if ($label === '') {
            $label = trim((string) ($mapped_field['obatala_field_id'] ?? 'Campo'));
        }

        return $label;
    }

    private function validate_spreadsheet_cell_value($value, array $mapped_field) {
        $field_type = strtolower(trim((string) ($mapped_field['obatala_field_type'] ?? 'text')));
        $field_config = is_array($mapped_field['obatala_field_config'] ?? null)
            ? $mapped_field['obatala_field_config']
            : [];

        $normalized_value = $this->normalize_obatala_value($value);
        $is_required = !empty($field_config['required']);

        if ($this->is_empty_value($normalized_value)) {
            if ($is_required) {
                return 'valor obrigatório ausente';
            }
            return '';
        }

        $values = is_array($normalized_value) ? $normalized_value : [$normalized_value];

        if (($field_type === 'radio' || $field_type === 'select') && !empty($field_config['options'])) {
            $allowed_options = array_values(array_filter(array_map(function($option) {
                return $this->normalize_header_key((string) $option);
            }, explode(',', (string) $field_config['options']))));

            foreach ($values as $entry) {
                $normalized_entry = $this->normalize_header_key((string) $entry);
                if ($normalized_entry === '' || !in_array($normalized_entry, $allowed_options, true)) {
                    return 'valor fora das opções permitidas';
                }
            }
        }

        foreach ($values as $entry) {
            $entry_string = trim((string) $entry);

            if ($field_type === 'number') {
                $numeric_candidate = str_replace(',', '.', $entry_string);
                if (!is_numeric($numeric_candidate)) {
                    return 'deve conter um número válido';
                }
            }

            if ($field_type === 'email' && !filter_var($entry_string, FILTER_VALIDATE_EMAIL)) {
                return 'deve conter um e-mail válido';
            }

            if ($field_type === 'phone' && !preg_match('/^[0-9\-\+\(\)\s]{8,20}$/', $entry_string)) {
                return 'deve conter um telefone válido';
            }

            if ($field_type === 'datepicker' && !$this->is_valid_spreadsheet_date_value($entry_string)) {
                return 'deve conter uma data válida (dd/mm/aaaa ou aaaa-mm-dd)';
            }

            $pattern = trim((string) ($field_config['pattern'] ?? ''));
            if ($pattern !== '') {
                $regex = '/' . str_replace('/', '\/', $pattern) . '/u';
                if (@preg_match($regex, '') !== false && !preg_match($regex, $entry_string)) {
                    return 'não atende ao padrão esperado';
                }
            }

            $min_length = isset($field_config['minLength']) ? (int) $field_config['minLength'] : 0;
            if ($min_length > 0 && $this->string_length($entry_string) < $min_length) {
                return sprintf('deve ter no mínimo %d caracteres', $min_length);
            }

            $max_length = isset($field_config['maxLength']) ? (int) $field_config['maxLength'] : 0;
            if ($max_length > 0 && $this->string_length($entry_string) > $max_length) {
                return sprintf('deve ter no máximo %d caracteres', $max_length);
            }
        }

        return '';
    }

    private function is_valid_spreadsheet_date_value($value) {
        $value = trim((string) $value);
        if ($value === '') {
            return false;
        }

        if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $value, $matches)) {
            return checkdate((int) $matches[2], (int) $matches[1], (int) $matches[3]);
        }

        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $value, $matches)) {
            return checkdate((int) $matches[2], (int) $matches[3], (int) $matches[1]);
        }

        return false;
    }

    private function string_length($value) {
        if (function_exists('mb_strlen')) {
            return mb_strlen((string) $value);
        }

        return strlen((string) $value);
    }

    private function parse_csv_file($file_path) {
        $rows = [];
        $handle = fopen($file_path, 'r');
        if (!$handle) {
            return [];
        }

        $sample = fgets($handle);
        rewind($handle);

        $delimiter = ',';
        if ($sample !== false) {
            $semicolon_count = substr_count($sample, ';');
            $comma_count = substr_count($sample, ',');
            $delimiter = $semicolon_count > $comma_count ? ';' : ',';
        }

        while (($data = fgetcsv($handle, 0, $delimiter)) !== false) {
            $rows[] = $data;
        }

        fclose($handle);
        return $rows;
    }

    private function resolve_uploaded_file_path($file_name) {
        $safe_file_name = sanitize_file_name((string) $file_name);
        if ($safe_file_name === '') {
            return '';
        }

        $upload_dir = wp_upload_dir();
        $path = trailingslashit($upload_dir['basedir']) . 'obatala/' . $safe_file_name;

        return file_exists($path) ? $path : '';
    }

    private function ensure_process_reference_metadatum($collection, $metadata_repository, array &$warnings) {
        if (!$collection instanceof \Tainacan\Entities\Collection || !is_object($metadata_repository) || !method_exists($metadata_repository, 'fetch')) {
            return null;
        }

        $collection_id = (int) $collection->get_id();
        $existing_metadatum = $this->find_process_reference_metadatum($collection_id, $metadata_repository);
        if ($existing_metadatum instanceof \Tainacan\Entities\Metadatum) {
            if ($this->is_process_reference_metadatum_compatible($existing_metadatum)) {
                return $existing_metadatum;
            }

            $this->maybe_warn_process_reference_metadatum_type($existing_metadatum, $warnings);
        }

        try {
            $process_reference_metadatum = new \Tainacan\Entities\Metadatum();
            $process_reference_metadatum->set_name(self::PROCESS_REFERENCE_METADATA_NAME);
            $process_reference_metadatum->set_slug(self::PROCESS_REFERENCE_METADATA_SLUG);
            $process_reference_metadatum->set_description('Link para o processo de origem no Obatala.');
            $process_reference_metadatum->set_collection($collection);
            $process_reference_metadatum->set_metadata_type(self::PROCESS_REFERENCE_METADATA_TYPE);
            $process_reference_metadatum->set_status('publish');
            $process_reference_metadatum->set_display('yes');

            $next_order = $this->get_next_collection_metadata_order($collection_id, $metadata_repository);
            if ($next_order > 0) {
                $process_reference_metadatum->set_order($next_order);
            }

            if (!$process_reference_metadatum->validate()) {
                $warnings[] = [
                    'message' => 'Não foi possível validar o metadado de referência do processo no Obatala.',
                    'errors' => $process_reference_metadatum->get_errors(),
                ];
                return null;
            }

            $inserted_metadatum = $metadata_repository->insert($process_reference_metadatum);
            if ($inserted_metadatum instanceof \Tainacan\Entities\Metadatum) {
                update_post_meta((int) $inserted_metadatum->get_id(), self::PROCESS_REFERENCE_METADATA_MARKER_META_KEY, '1');
                return $inserted_metadatum;
            }
        } catch (\Throwable $error) {
            $warnings[] = [
                'message' => 'Erro ao criar o metadado de referência do processo no Obatala.',
                'errors' => [$error->getMessage()],
            ];
            return null;
        }

        $warnings[] = [
            'message' => 'Falha ao criar o metadado de referência do processo no Obatala.',
        ];

        return null;
    }

    private function get_next_collection_metadata_order($collection_id, $metadata_repository) {
        $collection_id = (int) $collection_id;
        if ($collection_id <= 0 || !is_object($metadata_repository) || !method_exists($metadata_repository, 'fetch')) {
            return 1;
        }

        $matches = $metadata_repository->fetch([
            'posts_per_page' => -1,
            'parent' => 0,
            'post_status' => 'any',
            'meta_query' => [
                [
                    'key' => 'collection_id',
                    'value' => $collection_id,
                ],
            ],
        ], 'OBJECT');

        if (!is_array($matches) || empty($matches)) {
            return 1;
        }

        $max_order = 0;
        foreach ($matches as $candidate) {
            if (!$candidate instanceof \Tainacan\Entities\Metadatum || !method_exists($candidate, 'get_order')) {
                continue;
            }

            $candidate_order = (int) $candidate->get_order();
            if ($candidate_order > $max_order) {
                $max_order = $candidate_order;
            }
        }

        return $max_order + 1;
    }

    private function find_process_reference_metadatum($collection_id, $metadata_repository) {
        $collection_id = (int) $collection_id;
        if ($collection_id <= 0 || !is_object($metadata_repository) || !method_exists($metadata_repository, 'fetch')) {
            return null;
        }

        $matches = $metadata_repository->fetch([
            'posts_per_page' => 1,
            'parent' => 0,
            'post_status' => 'any',
            'meta_query' => [
                [
                    'key' => 'collection_id',
                    'value' => $collection_id,
                ],
                [
                    'key' => self::PROCESS_REFERENCE_METADATA_MARKER_META_KEY,
                    'value' => '1',
                ],
            ],
        ], 'OBJECT');

        if (is_array($matches) && !empty($matches)) {
            $candidate = reset($matches);
            if ($candidate instanceof \Tainacan\Entities\Metadatum) {
                return $candidate;
            }
        }

        $fallback_matches = $metadata_repository->fetch([
            'posts_per_page' => -1,
            'parent' => 0,
            'post_status' => 'any',
            'meta_query' => [
                [
                    'key' => 'collection_id',
                    'value' => $collection_id,
                ],
                [
                    'key' => 'metadata_type',
                    'value' => self::PROCESS_REFERENCE_METADATA_TYPE,
                ],
            ],
        ], 'OBJECT');

        if (!is_array($fallback_matches) || empty($fallback_matches)) {
            return null;
        }

        foreach ($fallback_matches as $candidate) {
            if (!$candidate instanceof \Tainacan\Entities\Metadatum) {
                continue;
            }

            $candidate_slug = method_exists($candidate, 'get_slug')
                ? sanitize_title((string) $candidate->get_slug())
                : '';
            $candidate_name = method_exists($candidate, 'get_name')
                ? trim((string) $candidate->get_name())
                : '';

            if (
                $candidate_slug === self::PROCESS_REFERENCE_METADATA_SLUG
                || $candidate_name === self::PROCESS_REFERENCE_METADATA_NAME
            ) {
                update_post_meta((int) $candidate->get_id(), self::PROCESS_REFERENCE_METADATA_MARKER_META_KEY, '1');
                return $candidate;
            }
        }

        return null;
    }

    private function maybe_warn_process_reference_metadatum_type($metadatum, array &$warnings) {
        if (!$metadatum instanceof \Tainacan\Entities\Metadatum || !method_exists($metadatum, 'get_metadata_type')) {
            return;
        }

        $current_type = (string) $metadatum->get_metadata_type();
        if ($current_type !== '' && strcasecmp($current_type, self::PROCESS_REFERENCE_METADATA_TYPE) !== 0) {
            $warnings[] = [
                'metadata_id' => (int) $metadatum->get_id(),
                'message' => sprintf(
                    'O metadado "%s" já existe com tipo "%s". O ideal é usar o tipo "%s" para links clicáveis.',
                    self::PROCESS_REFERENCE_METADATA_SLUG,
                    $current_type,
                    self::PROCESS_REFERENCE_METADATA_TYPE
                ),
            ];
        }
    }

    private function is_process_reference_metadatum_compatible($metadatum) {
        if (!$metadatum instanceof \Tainacan\Entities\Metadatum || !method_exists($metadatum, 'get_metadata_type')) {
            return false;
        }

        $type = (string) $metadatum->get_metadata_type();
        return $type !== '' && strcasecmp($type, self::PROCESS_REFERENCE_METADATA_TYPE) === 0;
    }

    private function build_process_reference_url($process_id) {
        $process_id = (int) $process_id;
        if ($process_id <= 0) {
            return '';
        }

        $admin_url = add_query_arg([
            'page' => 'process-viewer',
            'process_id' => $process_id,
        ], admin_url('admin.php'));

        $admin_url = esc_url_raw((string) $admin_url);
        if ($admin_url !== '') {
            return $admin_url;
        }

        $public_url = get_permalink($process_id);
        return $public_url ? esc_url_raw((string) $public_url) : '';
    }

    private function normalize_obatala_value($value) {
        if (is_array($value)) {
            $normalized = array_map(function($entry) {
                return $this->normalize_obatala_value($entry);
            }, $value);
            return array_values(array_filter($normalized, function($entry) {
                return !$this->is_empty_value($entry);
            }));
        }

        $string_value = trim((string) $value);
        if (strpos($string_value, '|') !== false) {
            return $this->split_multi_value($string_value);
        }

        return $string_value;
    }

    private function extract_scalar_value($value) {
        if (is_array($value)) {
            foreach ($value as $entry) {
                $scalar = $this->extract_scalar_value($entry);
                if ($scalar !== '') {
                    return $scalar;
                }
            }
            return '';
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if ($value === null) {
            return '';
        }

        return trim((string) $value);
    }

    private function is_empty_value($value) {
        if (is_array($value)) {
            foreach ($value as $entry) {
                if (!$this->is_empty_value($entry)) {
                    return false;
                }
            }
            return true;
        }

        return trim((string) $value) === '';
    }

    private function matches_choice($value, $expected) {
        $value_normalized = $this->normalize_header_key((string) $value);
        $expected_normalized = $this->normalize_header_key((string) $expected);

        return $value_normalized !== '' && $value_normalized === $expected_normalized;
    }

    private function normalize_header_key($value) {
        $value = strtolower(trim((string) $value));
        if ($value === '') {
            return '';
        }

        if (function_exists('remove_accents')) {
            $value = remove_accents($value);
        }

        $value = preg_replace('/\s+/', ' ', $value);
        $value = str_replace(['_', '-'], ' ', $value);

        return trim($value);
    }

    private function sanitize_mixed_value($value) {
        if (is_array($value)) {
            $clean = array_map(function($entry) {
                return $this->sanitize_mixed_value($entry);
            }, $value);

            return array_values(array_filter($clean, function($entry) {
                return !$this->is_empty_value($entry);
            }));
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        return sanitize_text_field((string) $value);
    }
}
