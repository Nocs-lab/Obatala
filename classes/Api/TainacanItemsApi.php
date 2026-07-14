<?php

namespace Obatala\Api;

use Obatala\Entities\Process;
use Obatala\Services\ProcessNumberService;
use WP_Error;
use WP_REST_Response;
use WP_REST_Server;

class TainacanItemsApi extends ObatalaAPI {
    private const PROCESS_REFERENCE_METADATA_SLUG = 'obatala-process-reference';
    private const PROCESS_REFERENCE_METADATA_MARKER_META_KEY = '_obatala_process_reference_metadata';

    public function register_routes() {
        $this->add_route('tainacan/items/(?P<id>\d+)', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_item'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
            'args' => [
                'id' => [
                    'required' => true,
                    'sanitize_callback' => 'absint',
                ],
            ],
        ]);

        $this->add_route('tainacan/items', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [$this, 'get_items'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
            'args' => [
                'page' => [
                    'default' => 1,
                    'sanitize_callback' => 'absint',
                ],
                'per_page' => [
                    'default' => 10,
                    'sanitize_callback' => 'absint',
                ],
                'search' => [
                    'default' => '',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'scope' => [
                    'default' => 'all',
                    'sanitize_callback' => 'sanitize_key',
                ],
                'collection_id' => [
                    'default' => 0,
                    'sanitize_callback' => 'absint',
                ],
                'status' => [
                    'default' => '',
                    'sanitize_callback' => 'sanitize_key',
                ],
            ],
        ]);
    }

    public function get_items($request) {
        if (
            !class_exists('\\Tainacan\\Repositories\\Items')
            || !class_exists('\\Tainacan\\Repositories\\Collections')
            || !class_exists('\\Tainacan\\Repositories\\Item_Metadata')
            || !class_exists('\\Tainacan\\Entities\\Item')
        ) {
            return new WP_Error(
                'obatala_tainacan_unavailable',
                __('Tainacan is not available.', 'obatala'),
                ['status' => 503]
            );
        }

        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(50, max(1, (int) $request->get_param('per_page')));
        $search = trim((string) $request->get_param('search'));
        $scope = (string) $request->get_param('scope');
        $collection_id = (int) $request->get_param('collection_id');
        $requested_status = (string) $request->get_param('status');

        $allowed_statuses = ['publish', 'private', 'pending', 'draft'];
        $post_status = $allowed_statuses;
        if ($requested_status !== '' && in_array($requested_status, $allowed_statuses, true)) {
            $post_status = [$requested_status];
        }

        $args = [
            'posts_per_page' => $per_page,
            'paged' => $page,
            'post_status' => $post_status,
            'orderby' => 'modified',
            'order' => 'DESC',
        ];

        if ($search !== '') {
            $args['s'] = $search;
        }

        if ($scope === 'mine') {
            $args['author'] = get_current_user_id();
        }

        $collections = $collection_id > 0 ? [$collection_id] : [];
        $items_repository = \Tainacan\Repositories\Items::get_instance();
        $query = $items_repository->fetch($args, $collections, 'WP_Query');

        if (!$query instanceof \WP_Query) {
            return new WP_REST_Response([
                'items' => [],
                'total' => 0,
                'total_pages' => 0,
                'page' => $page,
                'per_page' => $per_page,
                'collections' => $this->get_available_collections(),
            ], 200);
        }

        $items = [];
        foreach ($query->posts as $post) {
            try {
                $item = new \Tainacan\Entities\Item($post);
                if (!$item->can_read()) {
                    continue;
                }
                $items[] = $this->prepare_item($item);
            } catch (\Throwable $error) {
                continue;
            }
        }

        return new WP_REST_Response([
            'items' => $items,
            'total' => (int) $query->found_posts,
            'total_pages' => (int) $query->max_num_pages,
            'page' => $page,
            'per_page' => $per_page,
            'collections' => $this->get_available_collections(),
        ], 200);
    }

    public function get_item($request) {
        if (
            !class_exists('\\Tainacan\\Repositories\\Item_Metadata')
            || !class_exists('\\Tainacan\\Entities\\Item')
        ) {
            return new WP_Error(
                'obatala_tainacan_unavailable',
                __('Tainacan is not available.', 'obatala'),
                ['status' => 503]
            );
        }

        $item_id = (int) $request->get_param('id');
        $post = $item_id > 0 ? get_post($item_id) : null;

        if (!$post instanceof \WP_Post) {
            return new WP_Error(
                'obatala_tainacan_item_not_found',
                __('Item not found.', 'obatala'),
                ['status' => 404]
            );
        }

        try {
            $item = new \Tainacan\Entities\Item($post);
        } catch (\Throwable $error) {
            return new WP_Error(
                'obatala_tainacan_item_invalid',
                __('Unable to load item data.', 'obatala'),
                ['status' => 500]
            );
        }

        if (!$item->can_read()) {
            return new WP_Error(
                'obatala_tainacan_item_forbidden',
                __('You do not have permission to view this item.', 'obatala'),
                ['status' => 403]
            );
        }

        return new WP_REST_Response($this->prepare_item($item, true), 200);
    }

    private function prepare_item($item, $include_details = false) {
        $item_id = (int) $item->get_id();
        $collection = $item->get_collection();
        $collection_id = $collection instanceof \Tainacan\Entities\Collection
            ? (int) $collection->get_id()
            : (int) $item->get_collection_id();
        $collection_name = $collection instanceof \Tainacan\Entities\Collection
            ? (string) $collection->get_name()
            : '';

        $metadata = $this->extract_item_metadata($item, $include_details);
        $thumbnail = $this->get_thumbnail_url($item);
        $last_editor_id = (int) get_post_meta($item_id, '_edit_last', true);
        $last_editor = $last_editor_id > 0 ? get_userdata($last_editor_id) : null;
        $modified_by = $last_editor instanceof \WP_User
            ? $last_editor->display_name
            : (string) $item->get_author_name();

        return [
            'id' => $item_id,
            'title' => $this->decode_text((string) $item->get_title()),
            'url' => (string) get_permalink($item_id),
            'thumbnail' => $thumbnail,
            'thumbnail_alt' => (string) get_post_meta((int) $item->get__thumbnail_id(), '_wp_attachment_image_alt', true),
            'registration_number' => $metadata['registration_number'],
            'description' => $include_details ? $this->decode_text((string) $item->get_description()) : '',
            'collection_id' => $collection_id,
            'collection_name' => $this->decode_text($collection_name),
            'status' => (string) $item->get_status(),
            'author_id' => (int) $item->get_author_id(),
            'author_name' => (string) $item->get_author_name(),
            'created' => (string) get_post_time('c', false, $item_id),
            'modified' => (string) get_post_modified_time('c', false, $item_id),
            'modified_by' => (string) $modified_by,
            'processes' => $metadata['processes'],
            'process_summary' => $this->summarize_processes($metadata['processes']),
            'metadata' => $include_details ? $metadata['fields'] : [],
            'can_edit' => (bool) $item->can_edit(),
            'can_delete' => (bool) $item->can_delete(),
        ];
    }

    private function extract_item_metadata($item, $include_fields = false) {
        $registration_number = '';
        $registration_score = 0;
        $processes = [];
        $fields = [];
        $item_metadata_repository = \Tainacan\Repositories\Item_Metadata::get_instance();

        try {
            $item_metadata_list = $item_metadata_repository->fetch($item);
        } catch (\Throwable $error) {
            $item_metadata_list = [];
        }

        foreach ($item_metadata_list as $item_metadata) {
            try {
                $metadatum = $item_metadata->get_metadatum();
                if (!$metadatum instanceof \Tainacan\Entities\Metadatum) {
                    continue;
                }

                $value = trim((string) $item_metadata->get_value_as_string());

                if ($this->is_process_reference_metadatum($metadatum)) {
                    $processes = array_merge(
                        $processes,
                        $this->normalize_process_references($item_metadata->get_value())
                    );
                    continue;
                }

                if ($include_fields && $value !== '') {
                    $fields[] = [
                        'id' => (int) $metadatum->get_id(),
                        'name' => $this->decode_text((string) $metadatum->get_name()),
                        'slug' => sanitize_title((string) $metadatum->get_slug()),
                        'value' => $this->decode_text($value),
                    ];
                }

                $score = $this->get_registration_metadatum_score($metadatum);
                if ($score <= $registration_score) {
                    continue;
                }

                if ($value !== '') {
                    $registration_number = $this->decode_text($value);
                    $registration_score = $score;
                }
            } catch (\Throwable $error) {
                continue;
            }
        }

        $processes_by_key = [];
        foreach ($processes as $process) {
            $key = !empty($process['id'])
                ? 'id:' . (int) $process['id']
                : 'url:' . (string) ($process['url'] ?? '');

            if ($key === 'url:') {
                continue;
            }

            $processes_by_key[$key] = $process;
        }

        $processes = array_values($processes_by_key);
        usort($processes, function($left, $right) {
            return strcmp((string) ($left['date'] ?? ''), (string) ($right['date'] ?? ''));
        });

        return [
            'registration_number' => $registration_number,
            'processes' => $processes,
            'fields' => $fields,
        ];
    }

    private function is_process_reference_metadatum($metadatum) {
        $metadatum_id = (int) $metadatum->get_id();
        if (get_post_meta($metadatum_id, self::PROCESS_REFERENCE_METADATA_MARKER_META_KEY, true) === '1') {
            return true;
        }

        $slug = sanitize_title(remove_accents((string) $metadatum->get_slug()));
        return strpos($slug, self::PROCESS_REFERENCE_METADATA_SLUG) === 0;
    }

    private function get_registration_metadatum_score($metadatum) {
        $slug = sanitize_title(remove_accents((string) $metadatum->get_slug()));
        $name = sanitize_title(remove_accents((string) $metadatum->get_name()));
        $candidates = [$slug, $name];
        $exact_names = [
            'numero-de-registro',
            'numero-do-registro',
            'numero-registro',
            'n-de-registro',
            'no-de-registro',
            'registration-number',
            'record-number',
            'numero-de-inventario',
        ];

        foreach ($candidates as $candidate) {
            if (in_array($candidate, $exact_names, true)) {
                return 100;
            }
            if (strpos($candidate, 'numero') !== false && strpos($candidate, 'registro') !== false) {
                return 90;
            }
            if (strpos($candidate, 'inventario') !== false) {
                return 70;
            }
        }

        return 0;
    }

    private function normalize_process_references($value) {
        $values = $this->flatten_values($value);
        $processes = [];

        foreach ($values as $raw_url) {
            $decoded_url = html_entity_decode(trim((string) $raw_url), ENT_QUOTES, 'UTF-8');
            $url = esc_url_raw($decoded_url);
            if ($url === '') {
                continue;
            }

            $process_id = 0;
            $query = wp_parse_url($url, PHP_URL_QUERY);
            if (is_string($query)) {
                parse_str($query, $query_args);
                $process_id = isset($query_args['process_id']) ? (int) $query_args['process_id'] : 0;
            }

            $process_post = $process_id > 0 ? get_post($process_id) : null;
            $process_number_data = $process_id > 0
                ? ProcessNumberService::getProcessNumberData($process_id)
                : null;
            $process_number = is_array($process_number_data)
                ? (string) ($process_number_data['numero_processo'] ?? '')
                : '';
            $title = $process_post instanceof \WP_Post && $process_post->post_type === 'process_obatala'
                ? $this->decode_text((string) get_the_title($process_id))
                : '';
            if ($title === '') {
                $title = $process_id > 0
                    ? sprintf(__('Process #%d', 'obatala'), $process_id)
                    : __('Obatala process', 'obatala');
            }

            $processes[] = array_merge([
                'id' => $process_id,
                'number' => $process_number,
                'title' => $title,
                'url' => $url,
            ], $this->get_process_timeline_data($process_id));
        }

        return $processes;
    }

    private function get_process_timeline_data($process_id) {
        $process_id = (int) $process_id;
        $post = $process_id > 0 ? get_post($process_id) : null;

        if (!$post instanceof \WP_Post || $post->post_type !== 'process_obatala') {
            return [
                'status' => '',
                'status_group' => 'pending',
                'created_at' => '',
                'modified_at' => '',
                'date' => '',
                'responsible' => '',
                'current_stage' => '',
                'current_stage_label' => '',
                'current_stage_updated_at' => '',
                'current_stage_user' => '',
                'progress' => null,
                'is_deleted' => false,
                'summary' => '',
                'process_type' => '',
            ];
        }

        $status = (string) get_post_meta($process_id, 'status', true);
        $status = $status !== '' ? $status : 'Stopped';
        $created_at = (string) get_post_time('c', false, $process_id);
        $modified_at = (string) get_post_modified_time('c', false, $process_id);
        $author = get_userdata((int) $post->post_author);
        $stage_context = $this->get_process_stage_context($process_id);
        $progress = $this->calculate_process_progress($process_id);
        $process_type = (string) get_post_meta($process_id, 'process_title', true);
        $date = $stage_context['current_stage_updated_at'] ?: $modified_at ?: $created_at;
        $status_group = $this->get_process_status_group($status, $progress);

        return [
            'status' => $status,
            'status_group' => $status_group,
            'created_at' => $created_at,
            'modified_at' => $modified_at,
            'date' => $date,
            'responsible' => $stage_context['current_stage_user'] ?: ($author instanceof \WP_User ? $author->display_name : ''),
            'current_stage' => $stage_context['current_stage'],
            'current_stage_label' => $stage_context['current_stage_label'],
            'current_stage_updated_at' => $stage_context['current_stage_updated_at'],
            'current_stage_user' => $stage_context['current_stage_user'],
            'progress' => $progress,
            'is_deleted' => class_exists(Process::class) ? Process::is_deleted($process_id) : false,
            'summary' => $this->build_process_summary($status, $stage_context, $progress),
            'process_type' => $this->decode_text($process_type),
        ];
    }

    private function get_process_stage_context($process_id) {
        $flow_data = maybe_unserialize(get_post_meta((int) $process_id, 'flowData', true));
        $stage_data = maybe_unserialize(get_post_meta((int) $process_id, 'stageData', true));
        $current_stage = (string) get_post_meta((int) $process_id, 'current_stage', true);
        $nodes = is_array($flow_data) && isset($flow_data['nodes']) && is_array($flow_data['nodes'])
            ? $flow_data['nodes']
            : [];
        $current_node = null;

        foreach ($nodes as $node) {
            if ((string) ($node['id'] ?? '') === $current_stage) {
                $current_node = $node;
                break;
            }
        }

        if (!$current_node) {
            foreach ($nodes as $node) {
                if (($node['node_status'] ?? '') === 'Started') {
                    $current_node = $node;
                    break;
                }
            }
        }

        if (!$current_node) {
            foreach ($nodes as $node) {
                if ($this->is_process_stage_node($node)) {
                    $current_node = $node;
                    break;
                }
            }
        }

        $current_stage_id = $current_node ? (string) ($current_node['id'] ?? '') : $current_stage;
        $current_stage_label = $current_node
            ? $this->decode_text((string) ($current_node['data']['stageName'] ?? $current_stage_id))
            : $this->decode_text($current_stage_id);
        $stage_update = $this->find_latest_stage_update(is_array($stage_data) ? $stage_data : [], $current_stage_id);

        return [
            'current_stage' => $current_stage_id,
            'current_stage_label' => $current_stage_label,
            'current_stage_updated_at' => $stage_update['date'],
            'current_stage_user' => $stage_update['user'],
        ];
    }

    private function find_latest_stage_update($stage_data, $preferred_stage_id = '') {
        $latest = [
            'date' => '',
            'user' => '',
        ];

        foreach ($stage_data as $stage_id => $stage) {
            if (!is_array($stage)) {
                continue;
            }

            $candidates = [
                ['date' => $stage['updateAt'] ?? '', 'user' => $stage['user'] ?? ''],
                ['date' => $stage['draftUpdateAt'] ?? '', 'user' => $stage['draftUser'] ?? ''],
                ['date' => $stage['correctedSpreadsheetUpdateAt'] ?? '', 'user' => $stage['correctedSpreadsheetUser'] ?? ''],
            ];

            foreach ($candidates as $candidate) {
                $date = $this->normalize_datetime((string) ($candidate['date'] ?? ''));
                if ($date === '') {
                    continue;
                }

                if ((string) $stage_id === (string) $preferred_stage_id) {
                    return [
                        'date' => $date,
                        'user' => $this->decode_text((string) ($candidate['user'] ?? '')),
                    ];
                }

                if ($latest['date'] === '' || strtotime($date) > strtotime($latest['date'])) {
                    $latest = [
                        'date' => $date,
                        'user' => $this->decode_text((string) ($candidate['user'] ?? '')),
                    ];
                }
            }
        }

        return $latest;
    }

    private function calculate_process_progress($process_id) {
        $flow_data = maybe_unserialize(get_post_meta((int) $process_id, 'flowData', true));
        $submitted_stages = maybe_unserialize(get_post_meta((int) $process_id, 'submittedStages', true));
        $nodes = is_array($flow_data) && isset($flow_data['nodes']) && is_array($flow_data['nodes'])
            ? array_filter($flow_data['nodes'], [$this, 'is_process_stage_node'])
            : [];
        $total = count($nodes);

        if ($total === 0) {
            $status = (string) get_post_meta((int) $process_id, 'status', true);
            return $status === 'Finished' ? 100 : 0;
        }

        $finished = 0;
        foreach ($nodes as $node) {
            $node_id = (string) ($node['id'] ?? '');
            $is_submitted = is_array($submitted_stages)
                && array_key_exists($node_id, $submitted_stages)
                && $this->is_truthy($submitted_stages[$node_id]);

            if (($node['node_status'] ?? '') === 'Finished' || $is_submitted) {
                $finished++;
            }
        }

        return (int) round(($finished / $total) * 100);
    }

    private function is_process_stage_node($node) {
        $node_id = (string) ($node['id'] ?? '');

        return $node_id !== ''
            && $node_id !== 'Start'
            && $node_id !== 'End'
            && strpos($node_id, 'Condicional') !== 0;
    }

    private function is_truthy($value) {
        return $value === true || $value === 1 || $value === '1' || $value === 'true';
    }

    private function get_process_status_group($status, $progress) {
        if ($status === 'Finished' || (int) $progress >= 100) {
            return 'finished';
        }

        if ($status === 'Started' || (int) $progress > 0) {
            return 'in_progress';
        }

        return 'pending';
    }

    private function build_process_summary($status, $stage_context, $progress) {
        if ($status === 'Finished' || (int) $progress >= 100) {
            return __('Process completed.', 'obatala');
        }

        if (!empty($stage_context['current_stage_label'])) {
            return sprintf(
                __('Current step: %s.', 'obatala'),
                $stage_context['current_stage_label']
            );
        }

        return __('Process linked to this item.', 'obatala');
    }

    private function summarize_processes($processes) {
        $summary = [
            'total' => 0,
            'finished' => 0,
            'in_progress' => 0,
            'pending' => 0,
        ];

        foreach ((array) $processes as $process) {
            $summary['total']++;
            $group = (string) ($process['status_group'] ?? 'pending');
            if (!isset($summary[$group])) {
                $group = 'pending';
            }
            $summary[$group]++;
        }

        return $summary;
    }

    private function flatten_values($value) {
        if (!is_array($value)) {
            return [$value];
        }

        $values = [];
        foreach ($value as $entry) {
            $values = array_merge($values, $this->flatten_values($entry));
        }
        return $values;
    }

    private function decode_text($value) {
        return html_entity_decode(wp_strip_all_tags((string) $value), ENT_QUOTES, 'UTF-8');
    }

    private function normalize_datetime($value) {
        $value = trim((string) $value);
        if ($value === '') {
            return '';
        }

        $timestamp = strtotime($value);
        if (!$timestamp) {
            return $value;
        }

        return wp_date('c', $timestamp);
    }

    private function get_thumbnail_url($item) {
        $thumbnails = $item->get_thumbnail();
        if (!is_array($thumbnails)) {
            return '';
        }

        foreach (['tainacan-small', 'thumbnail', 'medium', 'full'] as $size) {
            if (isset($thumbnails[$size][0]) && is_string($thumbnails[$size][0])) {
                return esc_url_raw($thumbnails[$size][0]);
            }
        }

        return '';
    }

    private function get_available_collections() {
        $collections_repository = \Tainacan\Repositories\Collections::get_instance();
        $collections = $collections_repository->fetch([
            'posts_per_page' => -1,
            'post_status' => ['publish', 'private'],
            'orderby' => 'title',
            'order' => 'ASC',
        ], 'OBJECT');
        $response = [];

        if (!is_array($collections)) {
            return $response;
        }

        foreach ($collections as $collection) {
            if (!$collection instanceof \Tainacan\Entities\Collection || !$collection->can_read()) {
                continue;
            }
            $response[] = [
                'id' => (int) $collection->get_id(),
                'name' => $this->decode_text((string) $collection->get_name()),
            ];
        }

        usort($response, function($left, $right) {
            return strcasecmp($left['name'], $right['name']);
        });

        return $response;
    }
}