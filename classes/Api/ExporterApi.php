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

         // Route to get items from collection
         $this->add_route('get_items_collection/(?P<collection_id>[a-zA-Z0-9_\-.]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_items_collection'],
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
}
