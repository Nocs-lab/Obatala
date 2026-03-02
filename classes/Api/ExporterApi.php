<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;
use WP_REST_Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

class ExporterApi extends ObatalaAPI {

    public function register_routes() {

        // Route to get all collections
        $this->add_route('exporter/all_collections_tainacan', [
            'methods' => 'GET',
            'callback' => [$this, 'get_all_collections'],
            'permission_callback' => '__return_true',
        ]);

        // Route to get metadata collection
        $this->add_route('exporter/get_metadata_collection/(?P<collection_id>[a-zA-Z0-9_\-.]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_metadata_collection'],
            'permission_callback' => '__return_true',
        ]);

        // Route to get mapper collection
        $this->add_route('exporter/get_mapper_process_type/(?P<process_model_id>[a-zA-Z0-9_\-.]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_mapper_process_type'],
            'permission_callback' => '__return_true',
        ]);

         // Route to get items from collection
         $this->add_route('get_items_collection/(?P<collection_id>[a-zA-Z0-9_\-.]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_items_collection'],
            'permission_callback' => '__return_true',
        ]);

        $this->add_route('exporter/save_mapping_data', [
            'methods'  => 'POST',
            'callback' => [$this, 'save_mapping_data'],
            'permission_callback' => '__return_true', 
        ]);

    }

    public function get_all_collections() {
        $collections = $this->get_all_collection_names();
        
        return $collections;
    }

    function get_all_collection_names() {
        $collections_names = [];
        $collections = \Tainacan\Repositories\Collections::get_instance()->fetch([], 'OBJECT');
        
        foreach ($collections as $collection) {
            $collections_names[] = $collection;
        }

        return $collections_names;
    }   

    public function get_metadata_collection($request){

        $collection_id = sanitize_text_field($request['collection_id']);
    
        // Obtém a instância do repositório de metadados
        $metadata_repository = \Tainacan\Repositories\Metadata::get_instance();
    
        // Busca os metadados da coleção
        $metadata = $metadata_repository->fetch(
            [ 'collection_id' => $collection_id ],
            'OBJECT'
        );

        return $metadata;
    }

    public function get_mapper_process_type($request) {
        // Sanitiza o ID da coleção
        $process_model_id = (int) sanitize_text_field($request['process_model_id']);
        $meta_value       = get_post_meta($process_model_id, '_obatala_mapping_data', true);

        // Retorna o resultado (como array associativo)
        return [
            'mapping_data' => maybe_unserialize($meta_value),
        ];
    }


    public function get_items_collection($request) {
        $collection_id = sanitize_text_field($request['collection_id']);
        $selected_metadata_json = $request->get_param('selected_metadata');
        $mapper_type = $request->get_param('mapper_type');
        
        $items_repository = \Tainacan\Repositories\Items::get_instance();
        $items = $items_repository->fetch([
            'collection_id' => $collection_id,
            'posts_per_page' => -1
        ]);
                
        $metadados = [];

        foreach ($items->posts as $item) {
            $item_metadados = get_post_meta($item->ID);

            $metadados[] = $item_metadados;
        }

        return $this->export_xlsx($metadados, $selected_metadata_json, $mapper_type);
    }

    public function save_mapping_data($request) {
        $params = $request->get_json_params();

        $process_model_id = $params['process_model_id'] ?? null;
        $collection_id    = $params['collection_id'] ?? null;
        $mappings         = $params['mappings'] ?? [];

        if (!is_numeric($collection_id) || (int) $collection_id === 0) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'ID da coleção inválido.',
            ], 400);
        }

        if (!$process_model_id || empty($mappings)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Dados incompletos.',
            ], 400);
        }

        if (!get_post($collection_id)) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Post (coleção) não encontrado.',
            ], 404);
        }

        $data_to_save = [
            'process_model_id' => (int) $process_model_id,
            'collection_id' => (int) $collection_id,
            'mappings' => $mappings,
        ];

        $saved = update_post_meta((int) $process_model_id, '_obatala_mapping_data', wp_json_encode($data_to_save));

        if ($saved === false) {
            // Verifica se os dados enviados já são os mesmos salvos
            $current_data = get_post_meta((int) $process_model_id, '_obatala_mapping_data', true);
            if ($current_data === wp_json_encode($data_to_save)) {
                return new \WP_REST_Response([
                    'success' => true,
                    'message' => 'Dados já estavam salvos.',
                    'saved_data' => $data_to_save,
                ], 200);
            }

            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Erro ao salvar no banco de dados.',
            ], 500);
        }


        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Mapeamento salvo com sucesso.',
            'saved_data' => $data_to_save,
        ], 200);
    }

}
