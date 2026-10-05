<?php

namespace {
    if (!class_exists('WP_REST_Controller')) {
        class WP_REST_Controller {}
    }

    if (!class_exists('WP_Error')) {
        class WP_Error {}
    }
}

namespace Obatala\Api {
    function get_post_meta($post_id, $key, $single = false) {
        return $GLOBALS['obatala_progress_test_meta'][(int) $post_id][$key] ?? ($single ? '' : []);
    }

    function maybe_unserialize($value) {
        return $value;
    }

    function is_wp_error($value) {
        return $value instanceof \WP_Error;
    }

    function wp_strip_all_tags($value) {
        return strip_tags((string) $value);
    }
}

namespace Obatala\Services {
    function get_post_meta($post_id, $key, $single = false) {
        return $GLOBALS['obatala_progress_test_meta'][(int) $post_id][$key] ?? ($single ? '' : []);
    }
}

namespace {
    use Obatala\Api\TainacanItemsApi;
    use PHPUnit\Framework\TestCase;

    class TainacanItemsProgressTest extends TestCase {
        protected function setUp(): void {
            $GLOBALS['obatala_progress_test_meta'] = [];
        }

        public function test_progress_ignores_stage_skipped_by_conditional() {
            $process_id = 770;
            $finished_stage = function ($id) {
                return [
                    'id' => $id,
                    'node_status' => 'Finished',
                    'data' => ['fields' => []],
                ];
            };

            $GLOBALS['obatala_progress_test_meta'][$process_id] = [
                'status' => 'Finished',
                'process_type' => 0,
                'stageData' => [],
                'submittedStages' => [
                    'Etapa 1' => true,
                    'Etapa 2' => true,
                    'Etapa 3' => true,
                    'Etapa 4' => true,
                    'Etapa 6' => true,
                ],
                'flowData' => [
                    'nodes' => [
                        ['id' => 'Start', 'node_status' => 'Finished'],
                        $finished_stage('Etapa 1'),
                        $finished_stage('Etapa 2'),
                        $finished_stage('Etapa 3'),
                        ['id' => 'Condicional 1', 'node_status' => 'Finished'],
                        $finished_stage('Etapa 4'),
                        [
                            'id' => 'Etapa 5',
                            'node_status' => 'Stopped',
                            'data' => ['fields' => []],
                        ],
                        $finished_stage('Etapa 6'),
                        ['id' => 'End', 'node_status' => 'Stopped'],
                    ],
                    'edges' => [
                        ['source' => 'Start', 'target' => 'Etapa 1'],
                        ['source' => 'Etapa 1', 'target' => 'Etapa 2'],
                        ['source' => 'Etapa 2', 'target' => 'Etapa 3'],
                        ['source' => 'Etapa 3', 'target' => 'Condicional 1'],
                        ['source' => 'Condicional 1', 'target' => 'Etapa 4'],
                        ['source' => 'Condicional 1', 'target' => 'Etapa 5'],
                        ['source' => 'Etapa 4', 'target' => 'Etapa 6'],
                        ['source' => 'Etapa 5', 'target' => 'Etapa 6'],
                        ['source' => 'Etapa 6', 'target' => 'End'],
                    ],
                ],
            ];

            $method = new \ReflectionMethod(TainacanItemsApi::class, 'calculate_process_progress');
            $method->setAccessible(true);

            $this->assertSame(100.0, $method->invoke(new TainacanItemsApi(), $process_id));
        }
    }
}
