<?php

namespace Obatala\Api;

use Obatala\Services\ProcessNumberService;
use WP_Error;
use WP_REST_Response;
use WP_REST_Server;

class TainacanItemsApi extends ObatalaAPI {
    private const PROCESS_REFERENCE_METADATA_SLUG = 'obatala-process-reference';
    private const PROCESS_REFERENCE_METADATA_MARKER_META_KEY = '_obatala_process_reference_metadata';

    public function register_routes() {
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

    private function prepare_item($item) {
        $item_id = (int) $item->get_id();
        $collection = $item->get_collection();
        $collection_id = $collection instanceof \Tainacan\Entities\Collection
            ? (int) $collection->get_id()
            : (int) $item->get_collection_id();
        $collection_name = $collection instanceof \Tainacan\Entities\Collection
            ? (string) $collection->get_name()
            : '';

        $metadata = $this->extract_item_metadata($item);
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
            'collection_id' => $collection_id,
            'collection_name' => $this->decode_text($collection_name),
            'status' => (string) $item->get_status(),
            'author_id' => (int) $item->get_author_id(),
            'author_name' => (string) $item->get_author_name(),
            'modified' => (string) get_post_modified_time('c', false, $item_id),
            'modified_by' => (string) $modified_by,
            'processes' => $metadata['processes'],
            'can_edit' => (bool) $item->can_edit(),
            'can_delete' => (bool) $item->can_delete(),
        ];
    }

    private function extract_item_metadata($item) {
        $registration_number = '';
        $registration_score = 0;
        $processes = [];
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

                if ($this->is_process_reference_metadatum($metadatum)) {
                    $processes = array_merge(
                        $processes,
                        $this->normalize_process_references($item_metadata->get_value())
                    );
                    continue;
                }

                $score = $this->get_registration_metadatum_score($metadatum);
                if ($score <= $registration_score) {
                    continue;
                }

                $value = trim((string) $item_metadata->get_value_as_string());
                if ($value !== '') {
                    $registration_number = $this->decode_text($value);
                    $registration_score = $score;
                }
            } catch (\Throwable $error) {
                continue;
            }
        }

        $processes_by_url = [];
        foreach ($processes as $process) {
            if (!empty($process['url'])) {
                $processes_by_url[$process['url']] = $process;
            }
        }

        return [
            'registration_number' => $registration_number,
            'processes' => array_values($processes_by_url),
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

            $processes[] = [
                'id' => $process_id,
                'number' => $process_number,
                'title' => $title,
                'url' => $url,
            ];
        }

        return $processes;
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