<?php

namespace Obatala\Services;

defined('ABSPATH') || exit;

use WP_Error;

class ProcessTypeValidationService
{
    /**
     * Validates whether a process model is complete enough to be activated.
     * Drafts deliberately bypass this validation so partial work can be saved.
     *
     * @param mixed $flow_data Process model flow data.
     * @return true|WP_Error
     */
    public static function validate_for_activation($flow_data)
    {
        if (is_string($flow_data)) {
            $flow_data = json_decode($flow_data, true);
        }

        if (!is_array($flow_data)) {
            return self::incomplete_error();
        }

        $nodes = isset($flow_data['nodes']) && is_array($flow_data['nodes'])
            ? $flow_data['nodes']
            : [];
        $edges = isset($flow_data['edges']) && is_array($flow_data['edges'])
            ? $flow_data['edges']
            : [];
        $nodes_by_id = [];

        foreach ($nodes as $node) {
            if (!is_array($node)) {
                continue;
            }
            $node_id = isset($node['id']) ? (string) $node['id'] : '';
            if ($node_id !== '') {
                $nodes_by_id[$node_id] = $node;
            }
        }

        $regular_nodes = array_filter($nodes_by_id, function ($node, $node_id) {
            return $node_id !== 'Start'
                && $node_id !== 'End'
                && strpos($node_id, 'Condicional') !== 0;
        }, ARRAY_FILTER_USE_BOTH);

        if (!isset($nodes_by_id['Start'], $nodes_by_id['End']) || empty($regular_nodes)) {
            return self::incomplete_error();
        }

        $sectors = json_decode((string) get_option('obatala_setores', '{}'), true);
        $sectors = is_array($sectors) ? $sectors : [];

        foreach ($regular_nodes as $node) {
            $fields = isset($node['data']['fields']) && is_array($node['data']['fields'])
                ? $node['data']['fields']
                : [];
            $sector_id = (string) ($node['tempSector'] ?? $node['sector_obatala'] ?? '');
            if (empty($fields) || $sector_id === '' || !isset($sectors[$sector_id])) {
                return self::incomplete_error();
            }

            $seen_labels = [];
            foreach ($fields as $field) {
                if (!is_array($field)) {
                    return self::incomplete_error();
                }
                $label = isset($field['config']['label']) && trim((string) $field['config']['label']) !== ''
                    ? trim((string) $field['config']['label'])
                    : trim((string) ($field['title'] ?? ''));
                if ($label === '' || $label === 'Campo sem título') {
                    return self::incomplete_error();
                }
                $normalized_label = strtolower(remove_accents($label));
                if (isset($seen_labels[$normalized_label])) {
                    return self::incomplete_error();
                }
                $seen_labels[$normalized_label] = true;
            }
        }

        foreach ($nodes_by_id as $node_id => $node) {
            if (strpos($node_id, 'Condicional') !== 0) {
                continue;
            }
            $data = isset($node['data']) && is_array($node['data']) ? $node['data'] : [];
            $condition = isset($data['condition']) && is_array($data['condition'])
                ? $data['condition']
                : [];
            $input_node = (string) ($condition['inputNode'] ?? $data['inputNode'] ?? '');
            $outputs = $condition['outputNodes'] ?? $data['outputNodes'] ?? [];
            $outputs = is_array($outputs) ? $outputs : [];
            if ($input_node === '' || count($outputs) < 2) {
                return self::incomplete_error();
            }
            foreach ($outputs as $output) {
                $value = is_array($output) ? trim((string) ($output['conditionValue'] ?? '')) : '';
                $target = is_array($output) ? (string) ($output['nodeId'] ?? '') : '';
                if ($value === '' || $target === '' || !isset($nodes_by_id[$target])) {
                    return self::incomplete_error();
                }
            }
        }

        $incoming = array_fill_keys(array_keys($nodes_by_id), 0);
        $outgoing = array_fill_keys(array_keys($nodes_by_id), 0);
        $graph = array_fill_keys(array_keys($nodes_by_id), []);

        foreach ($edges as $edge) {
            $source = is_array($edge) ? (string) ($edge['source'] ?? '') : '';
            $target = is_array($edge) ? (string) ($edge['target'] ?? '') : '';
            if (!isset($nodes_by_id[$source], $nodes_by_id[$target])) {
                continue;
            }
            $outgoing[$source]++;
            $incoming[$target]++;
            $graph[$source][] = $target;
        }

        foreach ($nodes_by_id as $node_id => $node) {
            if (
                ($node_id !== 'Start' && $incoming[$node_id] === 0)
                || ($node_id !== 'End' && $outgoing[$node_id] === 0)
            ) {
                return self::incomplete_error();
            }
        }

        $visited = [];
        $queue = ['Start'];
        while (!empty($queue)) {
            $node_id = array_shift($queue);
            if (isset($visited[$node_id])) {
                continue;
            }
            $visited[$node_id] = true;
            foreach ($graph[$node_id] as $target) {
                if (!isset($visited[$target])) {
                    $queue[] = $target;
                }
            }
        }

        if (count($visited) !== count($nodes_by_id) || !isset($visited['End'])) {
            return self::incomplete_error();
        }

        return true;
    }

    private static function incomplete_error()
    {
        return new WP_Error(
            'obatala_incomplete_process_type',
            __('The selected process model is incomplete. Connect all steps and define at least one field and a valid group for each step.', 'obatala'),
            ['status' => 400]
        );
    }
}
