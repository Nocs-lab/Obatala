<?php

namespace Obatala\Api;

use Obatala\Entities\Process;
use Obatala\Services\ProcessNumberService;
use Obatala\Services\TainacanMappingService;
use WP_Error;
use WP_REST_Posts_Controller;
use WP_REST_Response;
use WP_REST_Server;

class CustomPostTypeApi extends ObatalaAPI {

    /**
     * Registers the custom REST routes for various Obatala's post types.
     * WordPress will call this method when the REST API is initialized.
     * We need this method to register the routes on our own namespace.
     */
    public function register_routes() {
        // Register routes for 'process_obatala' post type
        $this->register_post_type_routes('process_obatala');

        // Register routes for 'process_type' post type
        $this->register_post_type_routes('process_type');

    }

    /**
     * Registers REST routes for a given custom post type.
     *
     * @param string $post_type The custom post type to register routes for.
     */
    protected function register_post_type_routes($post_type) {
        // Create a new WP_REST_Posts_Controller instance for the post type
        $controller = new WP_REST_Posts_Controller($post_type);

        // Register the collection route (to fetch multiple items)
        register_rest_route(self::NAMESPACE, '/' . $post_type, [
            [
                'methods' => WP_REST_Server::READABLE, // HTTP GET
                'callback' => function ($request) use ($controller, $post_type) {
                    $response = $controller->get_items($request);
                    if (is_wp_error($response)) {
                        return $response;
                    }

                    $data = $response->get_data();
                    if (!is_array($data)) {
                        return $response;
                    }

                    if ($post_type === 'process_obatala') {
                        $data = $this->filter_processes_by_number_query($data, $request);
                        $data = array_values(array_filter($data, function ($item) {
                            return !Process::is_deleted($item['id']);
                        }));
                    }

                    foreach ($data as &$item) {
                        $item = $this->attach_process_meta($item, $post_type);
                    }
                    unset($item);

                    $response->set_data($data);
                    return $response;
                },
                'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'], // Check for permissions
                'args' => array_merge($controller->get_collection_params(), [
                    'numero_processo' => [
                        'type' => 'string',
                        'description' => __('Filter processes by number (full, partial, or unmasked).', 'obatala'),
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ]),
            ],
            [
                'methods' => WP_REST_Server::CREATABLE, // HTTP POST
                'callback' => function ($request) use ($controller, $post_type) {
                    if ($post_type === 'process_obatala') {
                        return $this->create_process_item($request, $controller);
                    }
                    return $controller->create_item($request);
                },
                'permission_callback' => [$controller, 'create_item_permissions_check'], // Check for permissions
                'args' => $controller->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE), // Arguments for item creation
            ],
        ]);

        // Register single item routes (to fetch, update, or delete a single item)
        register_rest_route(self::NAMESPACE, '/' . $post_type . '/(?P<id>[\d]+)', [
            [
                'methods' => WP_REST_Server::READABLE, // HTTP GET for a single item
                'callback' => function ($request) use ($controller, $post_type) {
                    // Retrieve the single item by ID
                    $response = $controller->get_item($request);
                    if (!is_wp_error($response)) {
                        $data = $response->get_data();

                        if ($post_type === 'process_obatala' && Process::is_deleted($data['id'])) {
                            return new WP_Error(
                                'rest_post_invalid_id',
                                __('Process not found.', 'obatala'),
                                ['status' => 404]
                            );
                        }

                        $data = $this->attach_process_meta($data, $post_type);
                        $response->set_data($data); // Update response with modified data
                    }
                    return $response; // Return the final response
                },
                'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'], // Check for permissions
                'args' => [
                    'context' => [
                        'default' => 'view', // Default view context
                    ],
                ],
            ],
            [
                'methods' => WP_REST_Server::EDITABLE, // HTTP PUT for updating an item
                'callback' => [$controller, 'update_item'], // Callback for updating an item
                'permission_callback' => [$controller, 'update_item_permissions_check'], // Check for permissions
                'args' => $controller->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE), // Arguments for item update
            ],
            [
                'methods' => WP_REST_Server::DELETABLE, // HTTP DELETE for deleting an item
                'callback' => $post_type === 'process_obatala'
                    ? [$this, 'soft_delete_process']
                    : [$controller, 'delete_item'],
                'permission_callback' => [$controller, 'delete_item_permissions_check'],
                'args' => [
                    'force' => [
                        'default' => false,
                    ],
                ],
            ],
        ]);

        // Register the schema route (to fetch the schema of the post type)
        register_rest_route(self::NAMESPACE, '/' . $post_type . '/schema', [
            'methods' => WP_REST_Server::READABLE, // HTTP GET for the schema
            'callback' => [$controller, 'get_public_item_schema'], // Callback for fetching the schema
            'permission_callback' => '__return_true', // No permission check needed for schema
        ]);
    }

    /**
     * Exclusão lógica de um processo (marca meta is_deleted em vez de remover o post).
     */
    public function soft_delete_process($request) {
        $process_id = (int) $request['id'];
        $post = get_post($process_id);

        if (!$post || $post->post_type !== Process::get_post_type()) {
            return new WP_Error(
                'rest_post_invalid_id',
                __('Process not found.', 'obatala'),
                ['status' => 404]
            );
        }

        if (Process::is_deleted($process_id)) {
            return new WP_Error(
                'rest_post_already_deleted',
                __('Process already deleted.', 'obatala'),
                ['status' => 410]
            );
        }

        $deletion = Process::soft_delete($process_id);
        if (is_wp_error($deletion)) {
            return $deletion;
        }

        return new WP_REST_Response([
            'deleted' => true,
            'id' => $process_id,
            'message' => __('Process deleted successfully.', 'obatala'),
            'deleted_at' => $deletion['deleted_at'],
            'deleted_by' => $deletion['deleted_by'],
            'deleted_by_name' => $deletion['deleted_by_name'],
        ], 200);
    }

    /**
     * Creates a process and assigns its unique number.
     */
    public function create_process_item($request, WP_REST_Posts_Controller $controller) {
        $process_type_id = (int) $request->get_param('process_type');
        $validation_error = $this->validate_process_type_for_creation($process_type_id);
        if (is_wp_error($validation_error)) {
            return $validation_error;
        }

        $response = $controller->create_item($request);
        if (is_wp_error($response)) {
            return $response;
        }

        $data = $response->get_data();
        $post_id = isset($data['id']) ? (int) $data['id'] : 0;
        if ($post_id <= 0) {
            return $response;
        }

        $number_service = new ProcessNumberService();
        $assigned = $number_service->assignToProcess($post_id);
        if (is_wp_error($assigned)) {
            wp_delete_post($post_id, true);
            return $assigned;
        }

        $data = $this->attach_process_meta($data, Process::get_post_type());
        $response->set_data($data);
        return $response;
    }

    /**
     * Prevents process creation from inactive or structurally incomplete models.
     */
    private function validate_process_type_for_creation($process_type_id) {
        $process_type = get_post($process_type_id);
        if (!$process_type || $process_type->post_type !== 'process_type') {
            return new WP_Error(
                'obatala_invalid_process_type',
                __('Invalid process model selected.', 'obatala'),
                ['status' => 400]
            );
        }

        if (get_post_meta($process_type_id, 'status', true) !== 'Active') {
            return new WP_Error(
                'obatala_inactive_process_type',
                __('The process cannot be created because the selected process model is inactive', 'obatala'),
                ['status' => 400]
            );
        }

        $flow_data = get_post_meta($process_type_id, 'flowData', true);
        if (is_string($flow_data)) {
            $flow_data = json_decode($flow_data, true);
        }

        $nodes = is_array($flow_data) && isset($flow_data['nodes']) && is_array($flow_data['nodes'])
            ? $flow_data['nodes']
            : [];
        $edges = is_array($flow_data) && isset($flow_data['edges']) && is_array($flow_data['edges'])
            ? $flow_data['edges']
            : [];

        $nodes_by_id = [];
        foreach ($nodes as $node) {
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

        $sectors = json_decode((string) get_option('obatala_setores', '{}'), true);
        $sectors = is_array($sectors) ? $sectors : [];

        if (!isset($nodes_by_id['Start'], $nodes_by_id['End']) || empty($regular_nodes)) {
            return $this->incomplete_process_type_error();
        }

        foreach ($regular_nodes as $node) {
            $fields = $node['data']['fields'] ?? [];
            $sector_id = (string) ($node['tempSector'] ?? $node['sector_obatala'] ?? '');
            if (empty($fields) || $sector_id === '' || !isset($sectors[$sector_id])) {
                return $this->incomplete_process_type_error();
            }
        }

        $incoming = array_fill_keys(array_keys($nodes_by_id), 0);
        $outgoing = array_fill_keys(array_keys($nodes_by_id), 0);
        $graph = array_fill_keys(array_keys($nodes_by_id), []);

        foreach ($edges as $edge) {
            $source = isset($edge['source']) ? (string) $edge['source'] : '';
            $target = isset($edge['target']) ? (string) $edge['target'] : '';
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
                return $this->incomplete_process_type_error();
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
            return $this->incomplete_process_type_error();
        }

        return null;
    }

    private function incomplete_process_type_error() {
        return new WP_Error(
            'obatala_incomplete_process_type',
            __('The selected process model is incomplete. Connect all steps and define at least one field and a valid group for each step.', 'obatala'),
            ['status' => 400]
        );
    }

    /**
     * @param array<int, array<string, mixed>> $items
     * @return array<int, array<string, mixed>>
     */
    protected function filter_processes_by_number_query(array $items, $request) {
        $query = $request->get_param('numero_processo');
        $query = is_string($query) ? trim($query) : '';
        if ($query === '') {
            return $items;
        }

        return array_values(array_filter($items, function ($item) use ($query) {
            $post_id = (int) ($item['id'] ?? 0);
            $number_data = ProcessNumberService::getProcessNumberData($post_id) ?? [];

            if (!empty($number_data) && ProcessNumberService::matchesSearchQuery($number_data, $query)) {
                return true;
            }

            $title = isset($item['title']['rendered']) ? (string) $item['title']['rendered'] : '';
            return stripos($title, $query) !== false;
        }));
    }

    /**
     * @param array<string, mixed> $item
     * @return array<string, mixed>
     */
    protected function attach_process_meta(array $item, $post_type) {
        $meta = get_post_meta($item['id']);
        $mapping_service = new TainacanMappingService();

        if (isset($meta['step_order'])) {
            $meta['step_order'] = maybe_unserialize($meta['step_order'][0]);
        }

        if (isset($meta['flowData'])) {
            $flow_data = maybe_unserialize($meta['flowData'][0]);

            if (is_array($flow_data) && isset($flow_data['nodes']) && is_array($flow_data['nodes'])) {
                if ($post_type === 'process_type') {
                    $flow_data = $mapping_service->apply_profile_options_to_flow_data((int) $item['id'], $flow_data);
                } elseif ($post_type === 'process_obatala') {
                    $process_type_id = isset($meta['process_type'][0]) ? (int) $meta['process_type'][0] : 0;
                    if ($process_type_id > 0) {
                        $mapping_config = $mapping_service->get_mapping_config_for_process((int) $item['id'], $process_type_id);
                        $flow_data = $mapping_service->apply_profile_options_to_flow_data_from_config($flow_data, $mapping_config);
                    }
                }
            }

            $meta['flowData'] = $flow_data;
        }

        $item['meta'] = $meta;
        return $item;
    }
}
