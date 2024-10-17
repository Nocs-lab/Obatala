<?php

namespace Obatala\Api;

use Obatala\Metadata\ProcessMetadataManager;

class StepMetadataApi extends ObatalaAPI {
    
    /**
     * Register the routes for handling step metadata.
     */
    public function register_routes() {
        // Route to save metadata
        $this->add_route('/process_step/(?P<step_id>\d+)/metadata', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_save_metadata'],
            'permission_callback' => '__return_true',
        ]);

        // Route to get metadata
        $this->add_route('/process_step/(?P<step_id>\d+)/metadata', [
            'methods' => 'GET',
            'callback' => [$this, 'handle_get_metadata'],
            'permission_callback' => '__return_true',
        ]);

        // Route to delete metadata
        $this->add_route('/process_step/(?P<step_id>\d+)/metadata/(?P<meta_key>[\w-]+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'handle_delete_metadata'],
            'permission_callback' => '__return_true',
        ]);

        // Route to save step data
        $this->add_route('/process_step/(?P<step_id>\d+)/save_step_data', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_save_step_data'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Handle the request to save metadata for a step.
     *
     * @param \WP_REST_Request $request The request object.
     * @return \WP_REST_Response|\WP_Error The response or error.
     */
    public function handle_save_metadata($request) {
        $step_id = intval($request['step_id']);
        $meta_data = $request->get_param('meta_data');

        if (empty($meta_data) || !is_array($meta_data)) {
            return new \WP_Error('invalid_data', 'Invalid data.', ['status' => 400]);
        }

        foreach ($meta_data as $field) {
            $meta_key = sanitize_text_field($field['key']);
            $meta_value = sanitize_text_field($field['value']);

            $result = ProcessMetadataManager::save_metadata($step_id, $meta_value, $meta_key);
            if (!$result) {
                return new \WP_Error('save_error', 'Error saving metadata.', ['status' => 500]);
            }
        }

        return rest_ensure_response('Metadata saved successfully.');
    }

    /**
     * Handle the request to get metadata for a step.
     *
     * @param \WP_REST_Request $request The request object.
     * @return \WP_REST_Response|\WP_Error The response or error.
     */
    public function handle_get_metadata($request) {
        $step_id = intval($request['step_id']);
        $metadata = ProcessMetadataManager::get_metadata($step_id);

        if (empty($metadata)) {
            return new \WP_Error('not_found', 'Invalid step ID.', ['status' => 404]);
        }

        return rest_ensure_response($metadata);
    }

    /**
     * Handle the request to delete metadata for a step.
     *
     * @param \WP_REST_Request $request The request object.
     * @return \WP_REST_Response|\WP_Error The response or error.
     */
    public function handle_delete_metadata($request) {
        $step_id = intval($request['step_id']);
        $meta_key = sanitize_text_field($request['meta_key']);

        $result = ProcessMetadataManager::delete_metadata($step_id, $meta_key);
        if ($result) {
            return rest_ensure_response('Metadata deleted successfully.');
        } else {
            return new \WP_Error('delete_error', 'Error deleting metadata.', ['status' => 500]);
        }
    }

    /**
     * Handle the request to save step data.
     *
     * @param \WP_REST_Request $request The request object.
     * @return \WP_REST_Response|\WP_Error The response or error.
     */
    public function handle_save_step_data($request) {
        $step_id = intval($request['step_id']);
        $process_id = intval($request['process_id']);

        $result = ProcessMetadataManager::save_step_data($step_id, $process_id);
        if ($result) {
            return rest_ensure_response('Step data saved successfully.');
        } else {
            return new \WP_Error('save_error', 'Error saving step data.', ['status' => 500]);
        }
    }
}
