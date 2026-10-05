<?php

namespace {
    if (!class_exists('WP_Error')) {
        class WP_Error
        {
            public $code;
            public $message;
            public $data;

            public function __construct($code = '', $message = '', $data = null)
            {
                $this->code = $code;
                $this->message = $message;
                $this->data = $data;
            }
        }
    }
}

namespace Obatala\Services {
    function get_option($name, $default = false)
    {
        return $GLOBALS['obatala_process_type_options'][$name] ?? $default;
    }

    function remove_accents($value)
    {
        return $value;
    }

    function __($text, $domain = 'default')
    {
        return $text;
    }
}

namespace {
    use Obatala\Services\ProcessTypeValidationService;
    use PHPUnit\Framework\TestCase;

    class ProcessTypeValidationServiceTest extends TestCase
    {
        protected function setUp(): void
        {
            $GLOBALS['obatala_process_type_options']['obatala_setores'] = json_encode([
                'group-a' => ['nome' => 'Group A'],
            ]);
        }

        public function test_complete_model_can_be_activated()
        {
            $this->assertTrue(ProcessTypeValidationService::validate_for_activation($this->validFlow()));
        }

        public function test_model_without_fields_stays_incomplete()
        {
            $flow = $this->validFlow();
            $flow['nodes'][1]['data']['fields'] = [];

            $result = ProcessTypeValidationService::validate_for_activation($flow);

            $this->assertInstanceOf(WP_Error::class, $result);
            $this->assertSame('obatala_incomplete_process_type', $result->code);
        }

        public function test_duplicate_field_titles_prevent_activation()
        {
            $flow = $this->validFlow();
            $flow['nodes'][1]['data']['fields'][] = [
                'id' => 'field-2',
                'config' => ['label' => 'Title'],
            ];

            $this->assertInstanceOf(
                WP_Error::class,
                ProcessTypeValidationService::validate_for_activation($flow)
            );
        }

        private function validFlow()
        {
            return [
                'nodes' => [
                    ['id' => 'Start'],
                    [
                        'id' => 'stage-1',
                        'tempSector' => 'group-a',
                        'data' => [
                            'fields' => [
                                ['id' => 'field-1', 'config' => ['label' => 'Title']],
                            ],
                        ],
                    ],
                    ['id' => 'End'],
                ],
                'edges' => [
                    ['source' => 'Start', 'target' => 'stage-1'],
                    ['source' => 'stage-1', 'target' => 'End'],
                ],
            ];
        }
    }
}
