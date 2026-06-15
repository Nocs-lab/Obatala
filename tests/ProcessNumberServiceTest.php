<?php

use Obatala\Services\ProcessNumberService;
use PHPUnit\Framework\TestCase;

class ProcessNumberServiceTest extends TestCase {

    /**
     * @dataProvider checkDigitProvider
     */
    public function test_calculate_check_digit($year, $sequential, $expected_dv) {
        $this->assertSame(
            $expected_dv,
            ProcessNumberService::calculateCheckDigit($year, $sequential)
        );
    }

    public function checkDigitProvider() {
        return [
            '2026-00001' => [2026, 1, 1],
            '2026-00002' => [2026, 2, 2],
            '2026-00042' => [2026, 42, 6],
            '2027-00001' => [2027, 1, 2],
        ];
    }

    /**
     * @dataProvider formatProvider
     */
    public function test_format_process_number($year, $sequential, $expected) {
        $this->assertSame(
            $expected,
            ProcessNumberService::formatProcessNumber($year, $sequential)
        );
    }

    public function formatProvider() {
        return [
            '2026-00001-1' => [2026, 1, '2026-00001-1'],
            '2026-00002-2' => [2026, 2, '2026-00002-2'],
            '2026-00042-6' => [2026, 42, '2026-00042-6'],
            '2027-00001-2' => [2027, 1, '2027-00001-2'],
        ];
    }

    public function test_build_numeric_base() {
        $this->assertSame('202600042', ProcessNumberService::buildNumericBase(2026, 42));
        $this->assertSame('202700001', ProcessNumberService::buildNumericBase(2027, 1));
    }

    public function test_build_full_numeric_string() {
        $this->assertSame('2026000426', ProcessNumberService::buildFullNumericString(2026, 42));
    }

    /**
     * @dataProvider searchProvider
     */
    public function test_matches_search_query($query, $expected) {
        $number_data = [
            'numero_processo' => '2026-00042-6',
            'ano_processo' => 2026,
            'sequencial_processo' => 42,
            'digito_verificador_processo' => 6,
        ];

        $this->assertSame(
            $expected,
            ProcessNumberService::matchesSearchQuery($number_data, $query)
        );
    }

    public function searchProvider() {
        return [
            'full masked' => ['2026-00042-6', true],
            'partial sequential' => ['00042', true],
            'year only' => ['2026', true],
            'unmasked full' => ['2026000426', true],
            'unmasked base' => ['202600042', true],
            'no match' => ['1999-00001-1', false],
        ];
    }

    public function test_year_resets_sequence_formatting() {
        $first_2026 = ProcessNumberService::formatProcessNumber(2026, 1);
        $first_2027 = ProcessNumberService::formatProcessNumber(2027, 1);

        $this->assertSame('2026-00001-1', $first_2026);
        $this->assertSame('2027-00001-2', $first_2027);
    }
}
