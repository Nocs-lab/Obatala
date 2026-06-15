<?php

namespace Obatala\Report;

defined('ABSPATH') || exit;

/**
 * Gera relatório em PDF com dados completos do processo:
 * dados gerais, etapas em ordem e campos preenchidos por etapa.
 */
class ProcessReportPdf {

    /**
     * @var int
     */
    private $process_id;

    /**
     * @var \WP_Post|null
     */
    private $post;

    /**
     * @var array
     */
    private $flow_data;

    /**
     * @var array
     */
    private $stage_data;

    /**
     * @var array
     */
    private $submitted_stages;

    /**
     * @var array
     */
    private $sectors;

    /**
     * @var array
     */
    private $ordered_nodes;

    /**
     * @var \WP_User
     */
    private $generated_by;

    public function __construct($process_id, \WP_User $generated_by) {
        $this->process_id = (int) $process_id;
        $this->generated_by = $generated_by;
    }

    /**
     * Carrega todos os dados do processo a partir do backend.
     */
    public function loadProcessData() {
        $this->post = get_post($this->process_id);
        if (!$this->post || $this->post->post_type !== 'process_obatala') {
            return false;
        }

        $this->flow_data = maybe_unserialize(get_post_meta($this->process_id, 'flowData', true));
        $this->stage_data = maybe_unserialize(get_post_meta($this->process_id, 'stageData', true));
        $this->submitted_stages = maybe_unserialize(get_post_meta($this->process_id, 'submittedStages', true));

        if (!is_array($this->flow_data) || !isset($this->flow_data['nodes']) || !isset($this->flow_data['edges'])) {
            $this->flow_data = ['nodes' => [], 'edges' => []];
        }
        if (!is_array($this->stage_data)) {
            $this->stage_data = [];
        }
        if (!is_array($this->submitted_stages)) {
            $this->submitted_stages = [];
        }

        $this->ordered_nodes = $this->getOrderedSteps();
        $this->sectors = $this->getSectorsMap();
        return true;
    }

    /**
     * Retorna etapas em ordem sequencial (exclui Start, End e Condicional da listagem de conteúdo).
     *
     * @return array
     */
    private function getOrderedSteps() {
        $nodes = $this->flow_data['nodes'] ?? [];
        $edges = $this->flow_data['edges'] ?? [];
        $node_map = [];
        foreach ($nodes as $n) {
            $node_map[$n['id']] = $n;
        }
        $valid_nodes = array_filter($nodes, function ($node) {
            return $node['id'] !== 'Start'
                && $node['id'] !== 'End'
                && strpos($node['id'], 'Condicional') !== 0
                && (!isset($node['node_status']) || $node['node_status'] !== 'Stopped');
        });
        $valid_map = [];
        foreach ($valid_nodes as $n) {
            $valid_map[$n['id']] = $n;
        }
        $graph = [];
        foreach ($edges as $e) {
            $graph[$e['source']][] = $e['target'];
        }
        $ordered = [];
        $current = $graph['Start'][0] ?? null;
        $visited = [];
        while ($current && $current !== 'End') {
            if (isset($visited[$current])) {
                break;
            }
            $visited[$current] = true;
            if (isset($valid_map[$current])) {
                $ordered[] = $valid_map[$current];
            }
            $next = null;
            if (isset($graph[$current])) {
                foreach ($graph[$current] as $target) {
                    if (isset($valid_map[$target])) {
                        $next = $target;
                        break;
                    }
                    if (isset($node_map[$target]) && strpos($target, 'Condicional') === 0) {
                        $resolved = $this->findNextAfterConditional($target, $graph, $node_map, $valid_map);
                        if ($resolved) {
                            $next = $resolved;
                            break;
                        }
                    }
                }
            }
            $current = $next;
        }
        return $ordered;
    }

    private function findNextAfterConditional($cond_id, $graph, $node_map, $valid_map) {
        if (!isset($node_map[$cond_id]['data']['condition']['outputNodes'])) {
            return null;
        }
        $cond = $node_map[$cond_id];
        $input_node_id = $cond['data']['condition']['inputNode'] ?? null;
        $radio_label = $cond['data']['condition']['condition'] ?? null;
        if (!$input_node_id || !$radio_label || !isset($this->stage_data[$input_node_id])) {
            if (isset($graph[$cond_id][0])) {
                return $graph[$cond_id][0];
            }
            return null;
        }
        $input_node = $node_map[$input_node_id] ?? null;
        if (!$input_node || empty($input_node['data']['fields'])) {
            return null;
        }
        $radio_id = null;
        foreach ($input_node['data']['fields'] as $f) {
            if (isset($f['config']['label']) && $f['config']['label'] === $radio_label) {
                $radio_id = $f['id'];
                break;
            }
        }
        if (!$radio_id) {
            return null;
        }
        $input_data = $this->stage_data[$input_node_id];
        $selected = null;
        foreach ($input_data['fields'] as $f) {
            if ($f['fieldId'] === $radio_id && !empty($f['value'][0])) {
                $selected = trim($f['value'][0]);
                break;
            }
        }
        if ($selected === null) {
            return null;
        }
        foreach ($cond['data']['condition']['outputNodes'] as $out) {
            if (isset($out['conditionValue']) && trim($out['conditionValue']) === $selected && isset($out['nodeId'])) {
                return $out['nodeId'];
            }
        }
        if (isset($graph[$cond_id][0])) {
            return $graph[$cond_id][0];
        }
        return null;
    }

    private function getSectorsMap() {
        $json = get_option('obatala_setores', '{}');
        $setores = json_decode($json, true);
        return is_array($setores) ? $setores : [];
    }

    /**
     * Monta o HTML do relatório.
     *
     * @return string
     */
    public function buildHtml() {
        $title = $this->post->post_title;
        $process_title_meta = get_post_meta($this->process_id, 'process_title', true);
        $model_name = is_string($process_title_meta) ? $process_title_meta : $title;
        $status = get_post_meta($this->process_id, 'status', true);
        $current_stage = get_post_meta($this->process_id, 'current_stage', true);
        $group_responsible = get_post_meta($this->process_id, 'groupResponsible', true);
        $access_level = get_post_meta($this->process_id, 'access_level', true);
        if (is_array($access_level)) {
            $access_level = reset($access_level);
        }
        $created = $this->post->post_date;
        $modified = $this->post->post_modified;
        $process_number = get_post_meta($this->process_id, 'numero_processo', true);
        if (is_array($process_number)) {
            $process_number = reset($process_number);
        }
        $process_number_display = (is_string($process_number) && $process_number !== '')
            ? $process_number
            : '—';
        $generated_at = current_time('Y-m-d H:i:s');
        $generated_by_name = $this->generated_by->display_name ?: $this->generated_by->user_login;

        $html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
            body { font-family: DejaVu Sans, sans-serif; font-size: 10pt; margin: 20px; color: #333; }
            h1 { font-size: 16pt; margin-bottom: 4px; }
            h2 { font-size: 12pt; margin-top: 16px; margin-bottom: 8px; border-bottom: 1px solid #ccc; }
            .report-header { margin-bottom: 20px; }
            .meta { color: #666; font-size: 9pt; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
            th { background: #f5f5f5; font-weight: bold; }
            .step-block { margin-bottom: 20px; page-break-inside: avoid; }
            .field-row { margin: 4px 0; }
            .field-label { font-weight: bold; color: #555; }
            .field-value { margin-left: 12px; white-space: pre-wrap; word-break: break-word; }
            .footer { margin-top: 24px; font-size: 8pt; color: #888; }
            .not-informed { font-style: italic; color: #999; }
        </style></head><body>';

        $html .= '<div class="report-header">';
        $html .= '<h1>' . esc_html__('Process Report', 'obatala') . '</h1>';
        $html .= '<p class="meta"><strong>' . esc_html__('Process', 'obatala') . ':</strong> ' . esc_html($title) . '</p>';
        $html .= '<p class="meta"><strong>' . esc_html__('Generated at', 'obatala') . ':</strong> ' . esc_html($generated_at) . '</p>';
        $html .= '<p class="meta"><strong>' . esc_html__('Generated by', 'obatala') . ':</strong> ' . esc_html($generated_by_name) . '</p>';
        $html .= '</div>';

        $html .= '<h2>' . esc_html__('General data', 'obatala') . '</h2>';
        $html .= '<table><tr><th>' . esc_html__('Field', 'obatala') . '</th><th>' . esc_html__('Value', 'obatala') . '</th></tr>';
        $html .= '<tr><td>' . esc_html__('Process ID', 'obatala') . '</td><td>' . esc_html((string) $this->process_id) . '</td></tr>';
        $html .= '<tr><td>' . esc_html__('Process number', 'obatala') . '</td><td>' . esc_html($process_number_display) . '</td></tr>';
        $html .= '<tr><td>' . esc_html__('Process name', 'obatala') . '</td><td>' . esc_html($title) . '</td></tr>';
        $html .= '<tr><td>' . esc_html__('Model (type)', 'obatala') . '</td><td>' . esc_html($model_name) . '</td></tr>';
        $html .= '<tr><td>' . esc_html__('Status', 'obatala') . '</td><td>' . esc_html($status ?: '—') . '</td></tr>';
        $html .= '<tr><td>' . esc_html__('Current stage', 'obatala') . '</td><td>' . esc_html($current_stage ?: '—') . '</td></tr>';
        $html .= '<tr><td>' . esc_html__('Created', 'obatala') . '</td><td>' . esc_html($created) . '</td></tr>';
        $html .= '<tr><td>' . esc_html__('Last updated', 'obatala') . '</td><td>' . esc_html($modified) . '</td></tr>';
        $html .= '<tr><td>' . esc_html__('Current responsible', 'obatala') . '</td><td>' . esc_html($group_responsible ?: '—') . '</td></tr>';
        $html .= '<tr><td>' . esc_html__('Access level', 'obatala') . '</td><td>' . esc_html($access_level ?: '—') . '</td></tr>';
        if ($this->post->post_content) {
            $html .= '<tr><td>' . esc_html__('Description', 'obatala') . '</td><td>' . nl2br(esc_html($this->post->post_content)) . '</td></tr>';
        }
        $html .= '</table>';

        $step_index = 0;
        foreach ($this->ordered_nodes as $node) {
            $step_index++;
            $node_id = $node['id'];
            $stage_name = isset($node['data']['stageName']) ? $node['data']['stageName'] : $node_id;
            $node_status = isset($node['node_status']) ? $node['node_status'] : '—';
            $sector_id = isset($node['sector_obatala']) ? $node['sector_obatala'] : null;
            $responsible = '';
            if ($sector_id && isset($this->sectors[$sector_id]['nome'])) {
                $responsible = $this->sectors[$sector_id]['nome'];
            }
            $step_meta = isset($this->stage_data[$node_id]) ? $this->stage_data[$node_id] : null;
            $update_at = $step_meta && !empty($step_meta['updateAt']) ? $step_meta['updateAt'] : '—';
            $update_user = $step_meta && !empty($step_meta['user']) ? $step_meta['user'] : '—';

            $html .= '<div class="step-block">';
            $html .= '<h2>' . esc_html__('Step', 'obatala') . ' ' . $step_index . ': ' . esc_html($stage_name) . '</h2>';
            $html .= '<table><tr><th>' . esc_html__('Field', 'obatala') . '</th><th>' . esc_html__('Value', 'obatala') . '</th></tr>';
            $html .= '<tr><td>' . esc_html__('Step name', 'obatala') . '</td><td>' . esc_html($stage_name) . '</td></tr>';
            $html .= '<tr><td>' . esc_html__('Order', 'obatala') . '</td><td>' . $step_index . '</td></tr>';
            $html .= '<tr><td>' . esc_html__('Status', 'obatala') . '</td><td>' . esc_html($node_status) . '</td></tr>';
            $html .= '<tr><td>' . esc_html__('Responsible', 'obatala') . '</td><td>' . esc_html($responsible ?: '—') . '</td></tr>';
            $html .= '<tr><td>' . esc_html__('Last update', 'obatala') . '</td><td>' . esc_html($update_at) . '</td></tr>';
            $html .= '<tr><td>' . esc_html__('Updated by', 'obatala') . '</td><td>' . esc_html($update_user) . '</td></tr>';
            $html .= '</table>';

            $html .= '<p><strong>' . esc_html__('Filled fields', 'obatala') . '</strong></p>';
            $fields_def = isset($node['data']['fields']) && is_array($node['data']['fields']) ? $node['data']['fields'] : [];
            $filled = $step_meta && !empty($step_meta['fields']) ? $step_meta['fields'] : [];
            $field_map = [];
            foreach ($filled as $f) {
                if (empty($f['fieldId'])) {
                    continue;
                }
                $field_map[$f['fieldId']] = $f['value'] ?? '';
            }
            if (empty($fields_def) && empty($field_map)) {
                $html .= '<p class="not-informed">' . esc_html__('No fields or no data filled.', 'obatala') . '</p>';
            } else {
                foreach ($fields_def as $def) {
                    $fid = $def['id'];
                    $label = isset($def['config']['label']) ? $def['config']['label'] : (isset($def['title']) ? $def['title'] : $fid);
                    $ftype = isset($def['type']) ? $def['type'] : '';
                    $val = $this->resolveFieldValue($field_map, $node_id, $fid);
                    $display = $this->formatFieldValue($val, $ftype, $def);
                    $html .= '<div class="field-row"><span class="field-label">' . esc_html($label) . '</span>';
                    $html .= '<div class="field-value">' . $display . '</div></div>';
                }
            }
            $html .= '</div>';
        }

        if (empty($this->ordered_nodes)) {
            $html .= '<p class="not-informed">' . esc_html__('No steps found for this process.', 'obatala') . '</p>';
        }

        $html .= '<div class="footer">';
        $html .= '<p>' . esc_html__('Report generated by Obatala - Curatorial Process Management', 'obatala') . ' | ';
        $html .= esc_html__('Generated at', 'obatala') . ': ' . esc_html($generated_at) . '</p>';
        $html .= '</div>';
        $html .= '</body></html>';
        return $html;
    }

    /**
     * Resolve submitted field value by id (supports legacy keys like "Etapa 1_text-1").
     *
     * @param array  $field_map
     * @param string $node_id
     * @param string $field_id
     * @return mixed|null
     */
    private function resolveFieldValue(array $field_map, $node_id, $field_id) {
        if (isset($field_map[$field_id])) {
            return $field_map[$field_id];
        }

        $composite_id = $node_id . '_' . $field_id;
        if (isset($field_map[$composite_id])) {
            return $field_map[$composite_id];
        }

        return null;
    }

    /**
     * Formata valor do campo para exibição no relatório.
     *
     * @param mixed $value
     * @param string $type
     * @param array $field_def
     * @return string HTML-safe string
     */
    private function formatFieldValue($value, $type, $field_def) {
        if ($value === null || $value === '') {
            return '<span class="not-informed">' . esc_html__('Not informed', 'obatala') . '</span>';
        }
        if (is_array($value)) {
            $value = array_map(function ($v) {
                return is_string($v) ? $v : json_encode($v);
            }, $value);
            $value = implode(', ', $value);
        }
        $value = trim((string) $value);
        if ($value === '') {
            return '<span class="not-informed">' . esc_html__('Not informed', 'obatala') . '</span>';
        }
        if ($type === 'datepicker' && preg_match('/^\d{4}-\d{2}-\d{2}/', $value)) {
            $value = date_i18n(get_option('date_format'), strtotime($value));
        }
        if ($type === 'upload' || $type === 'file') {
            return esc_html__('File attached', 'obatala') . ': ' . esc_html($value);
        }
        if ($type === 'stage_document') {
            $document = json_decode($value, true);
            if (is_array($document)) {
                $content = $document['content'] ?? '';
                $signed = $document['signedFile']['name'] ?? '';
                $output = $content ? wp_kses_post($content) : '<span class="not-informed">' . esc_html__('Not informed', 'obatala') . '</span>';
                if ($signed) {
                    $output .= '<br><strong>' . esc_html__('Signed PDF', 'obatala') . ':</strong> ' . esc_html($signed);
                }
                return $output;
            }
        }
        return nl2br(esc_html($value));
    }

    /**
     * Gera o PDF e retorna o binário.
     *
     * @return string|null Conteúdo binário do PDF ou null em caso de erro.
     */
    public function generatePdfBinary() {
        if (!class_exists('\Dompdf\Dompdf')) {
            return null;
        }
        $html = $this->buildHtml();
        $dompdf = new \Dompdf\Dompdf(['isRemoteEnabled' => false]);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        return $dompdf->output();
    }
}
