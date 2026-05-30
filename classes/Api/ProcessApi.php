<?php

namespace Obatala\Api;

defined('ABSPATH') || exit;

use WP_REST_Response; // Certifique-se de importar a classe WP_REST_Response
use WP_Error;
use Obatala\Entities\Process;
use Obatala\Entities\Sector;
use Obatala\Services\TainacanExportService;

class ProcessApi extends ObatalaAPI {

    public function register_routes() {
        // Route to get the current stage
        $this->add_route('process_obatala/(?P<id>\d+)/current_stage', [
            'methods' => 'GET',
            'callback' => [$this, 'get_current_stage'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        // Route to update the current stage
        $this->add_route('process_obatala/(?P<id>\d+)/current_stage', [
            'methods' => 'POST',
            'callback' => [$this, 'update_current_stage'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
            'args' => [
                'current_stage' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ]
            ]
        ]);

        // Route to get the process type
        $this->add_route('process_obatala/(?P<id>\d+)/process_type', [
            'methods' => 'GET',
            'callback' => [$this, 'get_process_type'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        // Route to update the process type
        $this->add_route('process_obatala/(?P<id>\d+)/process_type', [
            'methods' => 'POST',
            'callback' => [$this, 'update_process_type'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
            'args' => [
                'process_type' => [
                    'required' => true,
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ]
            ]
        ]);

        // Route to get meta fields
        $this->add_route('process_obatala/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [$this, 'get_meta'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);
        
        // Route to update multiple meta fields
        $this->add_route('process_obatala/(?P<id>\d+)/meta', [
            'methods' => 'POST',
            'callback' => [$this, 'update_meta'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        // Rota para obter todos os comentários associados a um processo
        $this->add_route('process_obatala/users', [
            'methods' => 'GET',
            'callback' => [$this, 'get_user_processes'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('process_obatala/(?P<id>\d+)/comments', [
            'methods' => 'GET',
            'callback' => [$this, 'get_comments'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

       
        // Route to add a comment to the process
        $this->add_route('process_obatala/(?P<id>\d+)/comment', [
            'methods' => 'POST',
            'callback' => [$this, 'add_comment'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        //Rota para editar um comentario de um processo
        $this->add_route('/process_obatala/comment/(?P<id>\d+)', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_comment'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        //Rota para deletar um comentario de um processo
        $this->add_route('/process_obatala/comment/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'delete_comment'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        //Rota para editar uma etapa de um processo(mudar node_status e parametros gerais)
        $this->add_route('/process_obatala/(?P<id>\d+)/node', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_node'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        // Rota para retornar nodes validos(Started e Finished)
        $this->add_route('/process_obatala/(?P<id>\d+)/node', [
            'methods' => 'GET',
            'callback' => [$this, 'valid_nodes'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        // Rota para gerar relatório PDF do processo
        $this->add_route('/process_obatala/(?P<id>\d+)/report-pdf', [
            'methods' => 'GET',
            'callback' => [$this, 'generate_report_pdf'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('/process_obatala/(?P<id>\d+)/stage-document-pdf', [
            'methods' => 'GET',
            'callback' => [$this, 'generate_stage_document_pdf'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('/process_obatala/(?P<id>\d+)/stage-document-signed', [
            'methods' => 'POST',
            'callback' => [$this, 'upload_signed_stage_document'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);

        $this->add_route('/process_obatala/(?P<id>\d+)/stage-document-signed', [
            'methods' => 'GET',
            'callback' => [$this, 'download_signed_stage_document'],
            'permission_callback' => [ObatalaAPI::class, 'permission_check_edit_posts'],
        ]);
    }

    /**
     * Gera o relatório em PDF do processo e retorna em base64 para download no frontend.
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response|\WP_Error
     */
    public function generate_report_pdf($request) {
        $process_id = (int) $request['id'];
        $user_id = get_current_user_id();
        if (!$user_id) {
            return new WP_REST_Response(['error' => 'Unauthorized', 'message' => __('You must be logged in to generate the report.', 'obatala')], 401);
        }
        $user = get_userdata($user_id);
        if (!$user) {
            return new WP_REST_Response(['error' => 'Unauthorized', 'message' => __('Invalid user.', 'obatala')], 401);
        }
        $permission = Sector::check_permission($user_id, $process_id);
        if (!$permission['status']) {
            return new WP_REST_Response([
                'error' => 'Forbidden',
                'message' => __('You do not have permission to generate the report for this process.', 'obatala'),
            ], 403);
        }
        if (!class_exists('\Dompdf\Dompdf')) {
            return new WP_REST_Response([
                'error' => 'Server Error',
                'message' => __('PDF generation library is not available. Run: composer install', 'obatala'),
            ], 500);
        }
        $report = new \Obatala\Report\ProcessReportPdf($process_id, $user);
        if (!$report->loadProcessData()) {
            return new WP_REST_Response(['error' => 'Not Found', 'message' => __('Process not found.', 'obatala')], 404);
        }
        $pdf_binary = $report->generatePdfBinary();
        if ($pdf_binary === null) {
            return new WP_REST_Response(['error' => 'Server Error', 'message' => __('Failed to generate PDF.', 'obatala')], 500);
        }
        $post = get_post($process_id);
        $safe_title = sanitize_file_name($post->post_title ?: 'process-' . $process_id);
        $filename = $safe_title . '-report-' . date('Y-m-d-His') . '.pdf';
        return new WP_REST_Response([
            'pdf' => base64_encode($pdf_binary),
            'filename' => $filename,
        ], 200);
    }

    public function generate_stage_document_pdf($request) {
        $context = $this->get_stage_document_context($request);
        if (is_wp_error($context)) {
            return $this->error_response($context);
        }

        if (!class_exists('\Dompdf\Dompdf')) {
            return new WP_REST_Response([
                'error' => 'Server Error',
                'message' => __('PDF generation library is not available. Run: composer install', 'obatala'),
            ], 500);
        }

        $report = new \Obatala\Report\StageDocumentPdf(
            $context['post'],
            $context['node'],
            $context['field'],
            $context['document'],
            $context['user']
        );
        $pdf_binary = $report->generatePdfBinary();
        if ($pdf_binary === null) {
            return new WP_REST_Response(['error' => 'Server Error', 'message' => __('Failed to generate PDF.', 'obatala')], 500);
        }

        $safe_title = sanitize_file_name($context['post']->post_title ?: 'process-' . $context['process_id']);
        $field_label = $context['field']['config']['label'] ?? $context['field_id'];
        $filename = $safe_title . '-' . sanitize_file_name($field_label) . '-' . date('Y-m-d-His') . '.pdf';

        $document = $context['document'];
        $document['status'] = !empty($document['signedFile']) ? 'signed' : 'pdf_generated';
        $document['generatedPdf'] = [
            'filename' => $filename,
            'generatedAt' => current_time('mysql'),
            'generatedBy' => $context['user']->display_name,
            'generatedById' => $context['user']->ID,
        ];
        $document['history'][] = [
            'event' => 'pdf_generated',
            'at' => current_time('mysql'),
            'user' => $context['user']->display_name,
            'userId' => $context['user']->ID,
            'filename' => $filename,
        ];
        $this->update_stage_document_value($context['process_id'], $context['node_id'], $context['field_id'], $document);

        return new WP_REST_Response([
            'pdf' => base64_encode($pdf_binary),
            'filename' => $filename,
            'document' => $document,
        ], 200);
    }

    public function upload_signed_stage_document($request) {
        $context = $this->get_stage_document_context($request);
        if (is_wp_error($context)) {
            return $this->error_response($context);
        }

        $files = $request->get_file_params();
        if (empty($files['file']) || !empty($files['file']['error'])) {
            return new WP_REST_Response(['error' => 'Bad Request', 'message' => __('No signed PDF was sent.', 'obatala')], 400);
        }

        $file = $files['file'];
        $mime = wp_check_filetype_and_ext($file['tmp_name'], $file['name']);
        if (($mime['type'] ?? '') !== 'application/pdf') {
            return new WP_REST_Response(['error' => 'Bad Request', 'message' => __('Only PDF files are allowed.', 'obatala')], 400);
        }

        $document = $context['document'];
        if (!empty($document['signedFile']['name'])) {
            return new WP_REST_Response([
                'error' => 'Conflict',
                'message' => __('A signed PDF is already attached and cannot be replaced.', 'obatala'),
            ], 409);
        }

        $directory = $this->get_stage_document_directory($context['process_id'], $context['node_id'], $context['field_id']);
        if (!wp_mkdir_p($directory)) {
            return new WP_REST_Response(['error' => 'Server Error', 'message' => __('Could not create the document directory.', 'obatala')], 500);
        }

        $filename = date('YmdHis') . '-' . sanitize_file_name($file['name']);
        $destination = trailingslashit($directory) . $filename;
        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            return new WP_REST_Response(['error' => 'Server Error', 'message' => __('Could not save the signed PDF.', 'obatala')], 500);
        }

        $document['status'] = 'signed';
        $document['signedFile'] = [
            'name' => $filename,
            'originalName' => sanitize_file_name($file['name']),
            'uploadedAt' => current_time('mysql'),
            'uploadedBy' => $context['user']->display_name,
            'uploadedById' => $context['user']->ID,
            'sha256' => hash_file('sha256', $destination),
        ];
        $document['history'][] = [
            'event' => 'signed_pdf_uploaded',
            'at' => current_time('mysql'),
            'user' => $context['user']->display_name,
            'userId' => $context['user']->ID,
            'filename' => $filename,
        ];

        $this->update_stage_document_value($context['process_id'], $context['node_id'], $context['field_id'], $document);

        return new WP_REST_Response([
            'message' => __('Signed PDF attached successfully.', 'obatala'),
            'document' => $document,
        ], 200);
    }

    public function download_signed_stage_document($request) {
        $context = $this->get_stage_document_context($request);
        if (is_wp_error($context)) {
            return $this->error_response($context);
        }

        $filename = $context['document']['signedFile']['name'] ?? '';
        if (!$filename) {
            return new WP_REST_Response(['error' => 'Not Found', 'message' => __('No signed PDF is attached to this document.', 'obatala')], 404);
        }

        $directory = $this->get_stage_document_directory($context['process_id'], $context['node_id'], $context['field_id']);
        $file_path = realpath(trailingslashit($directory) . basename($filename));
        $real_directory = realpath($directory);

        if (!$file_path || !$real_directory || strpos($file_path, $real_directory) !== 0 || !file_exists($file_path)) {
            return new WP_REST_Response(['error' => 'Not Found', 'message' => __('Signed PDF not found.', 'obatala')], 404);
        }

        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . basename($filename) . '"');
        header('Content-Length: ' . filesize($file_path));
        readfile($file_path);
        exit;
    }

    private function get_stage_document_context($request) {
        $process_id = (int) $request['id'];
        $node_id = sanitize_text_field((string) $request->get_param('node_id'));
        $field_id = sanitize_text_field((string) $request->get_param('field_id'));
        $user_id = get_current_user_id();

        if (!$user_id) {
            return new WP_Error('unauthorized', __('You must be logged in.', 'obatala'), ['status' => 401]);
        }
        if (!$node_id || !$field_id) {
            return new WP_Error('bad_request', __('The node_id and field_id parameters are required.', 'obatala'), ['status' => 400]);
        }

        $post = get_post($process_id);
        if (!$post || $post->post_type !== 'process_obatala') {
            return new WP_Error('not_found', __('Process not found.', 'obatala'), ['status' => 404]);
        }

        $permission = Sector::check_permission($user_id, $process_id);
        if (!$permission['status']) {
            return new WP_Error('forbidden', __('You do not have permission to access this process document.', 'obatala'), ['status' => 403]);
        }

        $flow_data = maybe_unserialize(get_post_meta($process_id, 'flowData', true));
        $stage_data = maybe_unserialize(get_post_meta($process_id, 'stageData', true));
        if (!is_array($flow_data)) {
            $flow_data = [];
        }
        if (!is_array($stage_data)) {
            $stage_data = [];
        }

        $node = null;
        foreach (($flow_data['nodes'] ?? []) as $candidate) {
            if (($candidate['id'] ?? '') === $node_id) {
                $node = $candidate;
                break;
            }
        }
        if (!$node) {
            return new WP_Error('not_found', __('Step not found.', 'obatala'), ['status' => 404]);
        }

        $field = null;
        foreach (($node['data']['fields'] ?? []) as $candidate) {
            if (($candidate['id'] ?? '') === $field_id) {
                $field = $candidate;
                break;
            }
        }
        if (!$field || ($field['type'] ?? '') !== 'stage_document') {
            return new WP_Error('not_found', __('Stage document field not found.', 'obatala'), ['status' => 404]);
        }

        $document = $this->get_stage_document_value($stage_data, $node_id, $field_id);
        if (empty($document['content']) && empty($document['signedFile'])) {
            return new WP_Error('not_found', __('No document content was found for this step.', 'obatala'), ['status' => 404]);
        }

        return [
            'process_id' => $process_id,
            'node_id' => $node_id,
            'field_id' => $field_id,
            'post' => $post,
            'node' => $node,
            'field' => $field,
            'document' => $document,
            'user' => get_userdata($user_id),
        ];
    }

    private function get_stage_document_value($stage_data, $node_id, $field_id) {
        $fields = $stage_data[$node_id]['fields'] ?? [];
        foreach ($fields as $field) {
            if (($field['fieldId'] ?? '') !== $field_id) {
                continue;
            }
            $value = $field['value'] ?? [];
            $document = is_array($value) && isset($value[0]) ? $value[0] : $value;
            if (is_array($document)) {
                return $document;
            }
            return [
                'content' => is_string($document) ? $document : '',
                'status' => $document ? 'draft' : 'empty',
            ];
        }

        return [
            'content' => '',
            'status' => 'empty',
        ];
    }

    private function update_stage_document_value($process_id, $node_id, $field_id, $document) {
        $this->sanitize_stage_document_payload($document);
        $stage_data = maybe_unserialize(get_post_meta($process_id, 'stageData', true));
        if (!is_array($stage_data)) {
            $stage_data = [];
        }
        if (!isset($stage_data[$node_id]) || !is_array($stage_data[$node_id])) {
            $stage_data[$node_id] = ['fields' => []];
        }
        if (!isset($stage_data[$node_id]['fields']) || !is_array($stage_data[$node_id]['fields'])) {
            $stage_data[$node_id]['fields'] = [];
        }

        $updated = false;
        foreach ($stage_data[$node_id]['fields'] as &$field) {
            if (($field['fieldId'] ?? '') === $field_id) {
                $field['value'] = [$document];
                $updated = true;
                break;
            }
        }
        unset($field);

        if (!$updated) {
            $stage_data[$node_id]['fields'][] = [
                'fieldId' => $field_id,
                'value' => [$document],
            ];
        }

        update_post_meta($process_id, 'stageData', $stage_data);
    }

    private function get_stage_document_directory($process_id, $node_id, $field_id) {
        $upload_dir = wp_upload_dir();
        return trailingslashit($upload_dir['basedir'])
            . 'obatala/stage-documents/'
            . (int) $process_id . '/'
            . sanitize_file_name($node_id) . '/'
            . sanitize_file_name($field_id);
    }

    private function error_response(WP_Error $error) {
        $status = $error->get_error_data()['status'] ?? 500;
        return new WP_REST_Response([
            'error' => $error->get_error_code(),
            'message' => $error->get_error_message(),
        ], $status);
    }
    
    public function get_current_stage($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'current_stage', true);
    }

    public function update_current_stage($request) {
        $post_id = (int) $request['id'];
        $current_stage = (int) $request['current_stage'];
        return update_post_meta($post_id, 'current_stage', $current_stage);
    }

    public function get_process_type($request) {
        $post_id = (int) $request['id'];
        return get_post_meta($post_id, 'process_type', true);
    }

    public function update_process_type($request) {
        $post_id = (int) $request['id'];
        $process_type = (int) $request['process_type'];
        return update_post_meta($post_id, 'process_type', $process_type);
    }
    public function get_meta($request) {
        $post_id = (int) $request['id'];
    
        $stageData = maybe_unserialize(get_post_meta($post_id, 'stageData', true));
        $submittedStages = maybe_unserialize(get_post_meta($post_id, 'submittedStages', true));

        $response = array(
            'stageData' => $stageData,
            'submittedStages' => $submittedStages,
        );
    
        return rest_ensure_response($response);
    }
    public function update_meta($request) {
        $post_id = (int) $request['id'];
        $meta = $request->get_json_params();
        $this->sanitize_stage_document_meta($meta);
        
        $raw_process_type = $meta['process_type'] ?? 0;
        if (is_array($raw_process_type)) {
            $raw_process_type = reset($raw_process_type);
        }
        $post_type_id = (int) $raw_process_type;
        $post_type_post = $post_type_id ? get_post($post_type_id) : null;

        if ($post_type_post) {
            $title = $post_type_post->post_title;
            update_post_meta($post_id, 'process_title', $title);
        }

        foreach ($meta as $key => $value) {
            if (in_array($key, ['is_deleted', 'deleted_at', 'deleted_by', 'deleted_by_name'], true)) {
                continue;
            }
            update_post_meta($post_id, $key, $value);
        }
        return true;
    }

    private function sanitize_stage_document_meta(&$meta) {
        if (empty($meta['stageData']) || !is_array($meta['stageData'])) {
            return;
        }

        foreach ($meta['stageData'] as &$stage) {
            if (empty($stage['fields']) || !is_array($stage['fields'])) {
                continue;
            }

            foreach ($stage['fields'] as &$field) {
                if (empty($field['value']) || !is_array($field['value'])) {
                    continue;
                }

                foreach ($field['value'] as &$value) {
                    if (is_array($value) && array_key_exists('content', $value)) {
                        $this->sanitize_stage_document_payload($value);
                    }
                }
                unset($value);
            }
            unset($field);
        }
        unset($stage);
    }

    private function sanitize_stage_document_payload(&$document) {
        $document['content'] = isset($document['content']) ? wp_kses_post((string) $document['content']) : '';
        $document['status'] = isset($document['status']) ? sanitize_key((string) $document['status']) : 'empty';
        if (isset($document['updatedAt'])) {
            $document['updatedAt'] = sanitize_text_field((string) $document['updatedAt']);
        }
    }
    
    public function get_user_processes($request) {
        $user_id = (int) $request->get_param('user_id'); 
        $processes = get_posts([
            'post_type'   => 'process_obatala', 
            'numberposts' => -1,
        ]);
    
        $user_processes = [];
    
        foreach ($processes as $process) {
            $process_id = (int) $process->ID;

            if (Process::is_deleted($process_id)) {
                continue;
            }

            $permission = Sector::check_permission($user_id, $process_id);
    
            if ($permission['status']) {
                $user_processes[] = $process_id;
            }
        }
    
        if (empty($user_processes)) {
            return new WP_REST_Response(['message' => 'No processes found.'], 200);
        }
    
        return new WP_REST_Response($user_processes, 200);
    }
    
    public function add_comment($request) {
        $post_id = (int) $request['id'];
        $user_id = (int) $request->get_param('user_id'); // ID do usuário autenticado
        $body = sanitize_text_field($request->get_param('text'));
    
        // Verifica se o post existe
        if (!get_post($post_id)) {
            return new WP_REST_Response([
                'message' => 'The specified post does not exist.',
            ], 404);
        }
        
        // Verificar permissão
        $permission = Sector::check_permission($user_id, $post_id);
    
        if (!$permission['status']) {
            return new WP_REST_Response(
                [
                    'error' => 'Permission denied',
                    'status' => $permission['message']
                ],
                403
            );
        }
    
        // Verifica se o comentário está vazio
        if (empty($body)) {
            return new WP_REST_Response([
                'message' => 'The comment cannot be empty.',
            ], 400);
        }
    
        // Pega os dados do usuário, se existir
        $user = get_userdata($user_id);
        $author_name = $user ? $user->display_name : 'Anonymous';
        $author_email = $user ? $user->user_email : '';
    
        // Dados do novo comentário
        $comment_data = [
            'comment_post_ID'      => $post_id,
            'comment_author'       => $author_name,
            'comment_author_email' => $author_email,
            'comment_content'      => $body,
            'user_id'              => $user_id,
            'comment_date'         => current_time('mysql'),
            'comment_approved'     => 1, // Define como aprovado automaticamente
        ];
    
        // Insere o comentário
        $comment_id = wp_insert_comment($comment_data);
    
        if (!$comment_id) {
            return new WP_REST_Response([
                'message' => 'Error while inserting the comment.',
            ], 500);
        }
    
        return new WP_REST_Response([
            'message' => 'Comment added successfully.',
            'comment_id' => $comment_id,
        ], 200);
    }

    //Retorna todos os comentarios realizados em um processo 
    public function get_comments($request) {
        $post_id = (int) $request['id'];
        $comments = get_comments(['post_id' => $post_id]); // Busca os comentários do post
        $user_id = (int) $request->get_param('user_id'); // ID do usuário autenticado
        
        // Verificar permissão
        $permission = Sector::check_permission($user_id, $post_id);
    
        if (!$permission['status']) {
            return new WP_REST_Response(
                [
                    'error' => 'Permission denied',
                    'status' => $permission['message']
                ],
                403
            );
        }
    
        if (empty($comments)) {
            return new WP_REST_Response(['message' => 'No comments found.'], 200);
        }
    
        $formatted_comments = array_map(function($comment) {
            return [
                'comment_ID'          => (int) $comment->comment_ID,
                'comment_author'      => $comment->comment_author,
                'comment_author_email'=> $comment->comment_author_email,
                'comment_content'     => $comment->comment_content,
                'user_id'             => (int) $comment->user_id,
                'comment_date'        => $comment->comment_date,
            ];
        }, $comments);
    
        return new WP_REST_Response($formatted_comments, 200);
    }

    //Atualiza um comentario especifico
    public function update_comment($request) {
        $comment_id = (int) $request['id'];
        $body = sanitize_text_field($request->get_param('text'));
        $user_id = (int) $request->get_param('user_id'); // ID do usuário autenticado
    
        // Verifica se o comentário existe
        $comment = get_comment($comment_id);
        if (!$comment) {
            return new WP_REST_Response([
                'message' => 'The specified comment does not exist.',
            ], 404);
        }
    
        // Verifica se o usuário autenticado é o dono do comentário
        if ((int) $comment->user_id !== $user_id) {
            return new WP_REST_Response([
                'message' => 'You do not have permission to edit this comment.',
            ], 403); // 403 = Forbidden
        }
    
        // Verifica se o novo texto do comentário está vazio
        if (empty($body)) {
            return new WP_REST_Response([
                'message' => 'The comment cannot be empty.',
            ], 400);
        }
    
        // Dados atualizados do comentário
        $comment_data = [
            'comment_ID'           => $comment_id,
            'comment_content'      => $body,
            'comment_date'         => current_time('mysql'),
        ];
    
        // Atualiza o comentário
        $updated = wp_update_comment($comment_data);
    
        if (!$updated) {
            return new WP_REST_Response([
                'message' => 'Error while updating the comment.',
            ], 500);
        }
    
        return new WP_REST_Response([
            'message' => 'Comment updated successfully.',
            'comment_id' => $comment_id,
        ], 200);
    }

    //Remover um comentário específico
    public function delete_comment($request) {
        $comment_id = (int) $request['id'];
        $user_id = (int) $request->get_param('user_id'); // ID do usuário autenticado
    
        // Verifica se o comentário existe
        $comment = get_comment($comment_id);
        if (!$comment) {
            return new WP_REST_Response([
                'message' => 'The specified comment does not exist.',
            ], 404);
        }
    
        // Verifica se o usuário autenticado é o dono do comentário
        if ((int) $comment->user_id !== $user_id) {
            return new WP_REST_Response([
                'message' => 'You do not have permission to delete this comment.',
            ], 403); // 403 = Forbidden
        }
    
        // Deleta o comentário
        $deleted = wp_delete_comment($comment_id, true); // O segundo parâmetro 'true' força a exclusão, mesmo que seja um comentário aprovado
    
        if (!$deleted) {
            return new WP_REST_Response([
                'message' => 'Error while deleting the comment.',
            ], 500);
        }
    
        return new WP_REST_Response([
            'message' => 'Comment deleted successfully.',
            'comment_id' => $comment_id,
        ], 200);
    }

    public function update_node($request) {
        $post_id = (int) $request['id'];
        $node_id = $request['node_id'] ?? null;
        $export_result = null;
        $response_status = 'Finished';

        $flowData = get_post_meta($post_id, 'flowData', true);
        $flowData = maybe_unserialize($flowData);
        $nodes = $flowData['nodes'];
        $edges = $flowData['edges'];
        
        $first_edge = null;
        foreach ($edges as $edge) {
            if ($edge['source'] === 'Start') {
                $first_edge = $edge;
                break;
            }
        }

        if ($first_edge) {
            $first_node_id = $first_edge['target'];
        }
        
        $first_node = null;
        foreach ($nodes as $node) {
            if ($node['id'] === $first_node_id) {
                $first_node = $node;
                break;
            }
        }

        if ($node_id === null && $first_node['node_status'] === 'Stopped') {
            return $this->init_node($flowData, $post_id);
        }else if ($node_id === null) {
            return new WP_REST_Response([
                'message' => 'Node ID iniciado.',
            ], 200);
        }

        // Filtra nós que NÃO são Start, End ou Condicional
        $filtered_nodes = array_filter($nodes, function($node) {
            return $node['id'] !== 'Start' && 
                $node['id'] !== 'End' && 
                strpos($node['id'], 'Condicional') !== 0;
        });

        // Encontra o nó a ser atualizado
        $node_to_update = null;
        foreach ($filtered_nodes as $node) {
            if ($node['id'] === $node_id) {
                $node_to_update = $node;
                break;
            }
        }

        if (!$node_to_update) {
            return new WP_REST_Response(['message' => 'Node not found.'], 404);
        }

        // Atualiza apenas o status do nó
        $updated_node = $node_to_update;
        $updated_node['node_status'] = 'Finished';

        foreach ($nodes as &$node) {
            if ($node['id'] === $node_id) {
                $node = $updated_node;
                break;
            }
        }
        unset($node);

        // Encontra a próxima conexão
        $next_edge = null;
        foreach ($edges as $edge) {
            if ($edge['source'] === $node_id) {
                $next_edge = $edge;
                break;
            }
        }

        if ($next_edge) {
            $next_node_id = $next_edge['target'];
            
            // Verifica se o próximo nó é uma condicional
            if (strpos($next_node_id, 'Condicional') === 0) {
                $conditional_node = null;
                foreach ($nodes as $node) {
                    if ($node['id'] === $next_node_id) {
                        $conditional_node = $node;
                        break;
                    }
                }

                if ($conditional_node) {
                    $input_node_id = $conditional_node['data']['condition']['inputNode'];
                    $radio_name = $conditional_node['data']['condition']['condition'];
                    
                    $input_node = null;
                    foreach ($nodes as $node) {
                        if ($node['id'] === $input_node_id) {
                            $input_node = $node;
                            break;
                        }
                    }
                    
                    $radio_id = null;
                    foreach ($input_node['data']['fields'] as $field) {
                        if ($field['config']['label'] === $radio_name) {
                            $radio_id = $field['id'];
                            break;
                        }
                    }
                    
                    $stageData = get_post_meta($post_id, 'stageData', true);
                    
                    if (isset($stageData[$input_node_id])) {
                        $input_node_data = $stageData[$input_node_id];
                        
                        foreach ($input_node_data['fields'] as $field) {
                            if ($field['fieldId'] === $radio_id && isset($field['value'][0])) {
                                $selected_value = trim($field['value'][0]);
                                
                                foreach ($conditional_node['data']['condition']['outputNodes'] as $output) {
                                    if (trim($output['conditionValue']) === $selected_value) {
                                        $next_node_id = $output['nodeId'];
                                        break 2;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Se o próximo nó for End, conclui o processo apenas se todos os requisitos foram atendidos
            if ($next_node_id === 'End') {
                $progress = $this->calculate_progress_percentage($post_id, $nodes, $edges);
                if ($progress >= 100) {
                    $process_status = 'Finished';

                    try {
                        $export_service = new TainacanExportService();
                        $runtime = $export_service->get_runtime_config($post_id);
                        $has_enabled_mapper = ($runtime['mapper_status'] ?? 'enabled') === 'enabled'
                            && !empty($runtime['enabled']);

                        if ($has_enabled_mapper) {
                            $export_service->mark_export_pending_confirmation($post_id);
                            $process_status = TainacanExportService::PROCESS_STATUS_AWAITING_EXPORT_CONFIRMATION;
                            $export_result = [
                                'status' => 'pending',
                                'message' => 'Processo concluído. Aguardando confirmação para exportação ao Tainacan.',
                                'process_id' => $post_id,
                                'collection_id' => (int) ($runtime['collection_id'] ?? 0),
                                'exported_items' => [],
                                'failed_items' => [],
                                'warnings' => [],
                                'created_at' => current_time('mysql'),
                            ];
                        } else {
                            $export_result = null;
                        }
                    } catch (\Throwable $exception) {
                        $export_result = [
                            'status' => 'error',
                            'message' => 'Falha ao preparar confirmação de exportação para o Tainacan.',
                            'process_id' => $post_id,
                            'collection_id' => 0,
                            'exported_items' => [],
                            'failed_items' => [],
                            'warnings' => [],
                            'error' => $exception->getMessage(),
                            'created_at' => current_time('mysql'),
                        ];
                    }

                    update_post_meta($post_id, 'status', $process_status);
                    $response_status = $process_status;
                }
            }
            // Caso contrário, atualiza o status do próximo nó
            else {
                foreach ($nodes as &$node) {
                    if ($node['id'] === $next_node_id && $node['node_status'] === 'Stopped') {
                        $node['node_status'] = 'Started';
                        break;
                    }
                }
            }
        }

        // Salva as alterações
        $newFlowData = $flowData;
        $newFlowData['nodes'] = $nodes;
        
        update_post_meta($post_id, 'flowData', $newFlowData);
        
        return new WP_REST_Response([
            'message' => 'Node updated successfully.',
            'node_id' => $node_id,
            'next_node_id' => $next_node_id ?? null,
            'status' => $response_status,
            'export_result' => $export_result,
        ], 200);
    }

    public function init_node($flowData, $post_id) {
        $nodes = $flowData['nodes'];
        $edges = $flowData['edges'];
        
        // Encontra a primeira conexão após o Start
        $first_edge = null;
        foreach ($edges as $edge) {
            if ($edge['source'] === 'Start') {
                $first_edge = $edge;
                break;
            }
        }

        if ($first_edge) {
            $first_node_id = $first_edge['target'];
            
            // Atualiza o status do primeiro nó
            foreach ($nodes as &$node) {
                if ($node['id'] === $first_node_id && $node['node_status'] === 'Stopped') {
                    $node['node_status'] = 'Started';
                    
                    // Atualiza também o status do post para started
                    update_post_meta($post_id, 'status', 'Started');
                    
                    // Salva as alterações
                    $newFlowData = $flowData;
                    $newFlowData['nodes'] = $nodes;
                    update_post_meta($post_id, 'flowData', $newFlowData);
                    
                    return new WP_REST_Response([
                        'message' => 'First node initialized successfully.',
                        'node_id' => $first_node_id,
                        'status' => 'started'
                    ], 200);
                }
            }
        }

        return new WP_REST_Response([
            'message' => 'Could not initialize first node.'
        ], 400);
    }

    public function valid_nodes($request) {
        $post_id = (int) $request['id'];
        $flowData = get_post_meta($post_id, 'flowData', true);
        $flowData = maybe_unserialize($flowData);

        if (!$flowData || !isset($flowData['nodes']) || !isset($flowData['edges'])) {
            return new WP_REST_Response([], 200);
        }

        $nodes = $flowData['nodes'];
        $edges = $flowData['edges'];

        // Cria mapa de id => node
        $nodeMap = [];
        foreach ($nodes as $node) {
            $nodeMap[$node['id']] = $node;
        }

        // Identifica nodes válidos
        $validNodes = array_filter($nodes, function($node) {
            return $node['id'] !== 'Start' &&
                $node['id'] !== 'End' &&
                strpos($node['id'], 'Condicional') !== 0 &&
                $node['node_status'] !== 'Stopped';
        });

        $validNodeMap = [];
        foreach ($validNodes as $node) {
            $validNodeMap[$node['id']] = $node;
        }

        // Grafo: source => [target1, target2, ...]
        $graph = [];
        foreach ($edges as $edge) {
            $source = $edge['source'];
            $target = $edge['target'];
            $graph[$source][] = $target;
        }

        // Função recursiva para buscar próximo nó válido
        $visited = [];

        // Caminho ordenado final
        $orderedNodes = [];
        $current = $graph['Start'][0] ?? null;

        while ($current && $current !== 'End') {
            if (isset($validNodeMap[$current])) {
                $orderedNodes[] = $validNodeMap[$current];
            }

            $visited = []; // reset para próxima chamada
            $current = $this->findNextValid($current, $graph, $nodeMap, $validNodeMap, $visited);
        }

        $progress = $this->calculate_progress_percentage($post_id, $nodes, $edges);

        return new WP_REST_Response([
            'ordered_nodes' => $orderedNodes,
            'progress'      => $progress
        ], 200);       
    }

    private function get_process_stage_data($post_id) {
        $stage_data = maybe_unserialize(get_post_meta($post_id, 'stageData', true));
        return is_array($stage_data) ? $stage_data : [];
    }

    private function stage_document_content_filled($document) {
        if (!is_array($document)) {
            return false;
        }
        $content = isset($document['content']) ? (string) $document['content'] : '';
        return trim(wp_strip_all_tags($content)) !== '';
    }

    private function stage_document_signed_uploaded($document) {
        if (!is_array($document)) {
            return false;
        }
        $name = $document['signedFile']['name'] ?? '';
        return trim((string) $name) !== '';
    }

    private function is_flow_field_requirement_met($field, $node_id, $stage_data) {
        $config = $field['config'] ?? [];
        $field_id = $field['id'] ?? '';
        $type = $field['type'] ?? '';

        if ($type !== 'stage_document') {
            return true;
        }

        $document = $this->get_stage_document_value($stage_data, $node_id, $field_id);

        if (!empty($config['required']) && !$this->stage_document_content_filled($document)) {
            return false;
        }

        if (!empty($config['requireSignedUpload']) && !$this->stage_document_signed_uploaded($document)) {
            return false;
        }

        return true;
    }

    private function is_node_progress_complete($node, $stage_data) {
        if (($node['node_status'] ?? '') !== 'Finished') {
            return false;
        }

        $node_id = $node['id'] ?? '';
        $fields = $node['data']['fields'] ?? [];
        foreach ($fields as $field) {
            if (!$this->is_flow_field_requirement_met($field, $node_id, $stage_data)) {
                return false;
            }
        }

        return true;
    }

    public function calculate_progress_percentage($post_id, $nodes, $edges) {
        if (!$nodes || !$edges) {
            return 0;
        }

        // Mapa de id => node
        $nodeMap = [];
        foreach ($nodes as $node) {
            $nodeMap[$node['id']] = $node;
        }

        // Identifica nós válidos
        $validNodes = array_filter($nodes, function($node) {
            return $node['id'] !== 'Start' &&
                $node['id'] !== 'End' &&
                strpos($node['id'], 'Condicional') !== 0 &&
                $node['node_status'] !== 'Stopped';
        });

        $validNodeMap = [];
        foreach ($validNodes as $node) {
            $validNodeMap[$node['id']] = $node;
        }

        // Grafo: source => [target1, target2, ...]
        $graph = [];
        foreach ($edges as $edge) {
            $source = $edge['source'];
            $target = $edge['target'];
            $graph[$source][] = $target;
        }

        // Função recursiva para buscar próximo nó válido
        $visited = [];

        // Caminho ordenado final
        $orderedNodes = [];
        $current = $graph['Start'][0] ?? null;

        while ($current && $current !== 'End') {
            if (isset($validNodeMap[$current])) {
                $orderedNodes[] = $validNodeMap[$current];
            }

            $visited = [];
            $current = $this->findNextValid($current, $graph, $nodeMap, $validNodeMap, $visited);
        }

        // Calcula percentual (etapa só conta se requisitos do documento estiverem atendidos)
        $totalValid = count($orderedNodes);
        if ($totalValid === 0) {
            return 0;
        }

        $stage_data = $this->get_process_stage_data($post_id);
        $finishedCount = 0;
        foreach ($orderedNodes as $node) {
            if ($this->is_node_progress_complete($node, $stage_data)) {
                $finishedCount++;
            }
        }

        $percentage = ($finishedCount / $totalValid) * 100;
        return round($percentage, 2);
    }

    function findNextValid($currentId, $graph, $nodeMap, $validNodeMap, &$visited) {
        if (isset($visited[$currentId])) return null; // evita loops
        $visited[$currentId] = true;

        if (!isset($graph[$currentId])) return null;

        foreach ($graph[$currentId] as $targetId) {
            if (isset($validNodeMap[$targetId])) {
                return $targetId;
            } elseif (isset($nodeMap[$targetId]) && strpos($targetId, 'Condicional') === 0) {
                // recursivamente tenta achar próximo válido via condicional
                $next = $this->findNextValid($targetId, $graph, $nodeMap, $validNodeMap, $visited);
                if ($next) return $next;
            }
        }

        return null;
    }
    
}
