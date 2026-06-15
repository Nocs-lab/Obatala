<?php

/**
 * Lightweight test runner when PHPUnit is not installed.
 * Usage: php tests/run-process-number-tests.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Obatala\Services\ProcessNumberService;

$failures = 0;

function assert_same($expected, $actual, $message) {
    global $failures;
    if ($expected !== $actual) {
        echo "FAIL: {$message}\n";
        echo "  expected: " . var_export($expected, true) . "\n";
        echo "  actual:   " . var_export($actual, true) . "\n";
        $failures++;
        return;
    }
    echo "OK: {$message}\n";
}

assert_same('2026-00001-1', ProcessNumberService::formatProcessNumber(2026, 1), 'format 2026-00001-1');
assert_same('2026-00002-2', ProcessNumberService::formatProcessNumber(2026, 2), 'format 2026-00002-2');
assert_same('2026-00042-6', ProcessNumberService::formatProcessNumber(2026, 42), 'format 2026-00042-6');
assert_same('2027-00001-2', ProcessNumberService::formatProcessNumber(2027, 1), 'format 2027-00001-2');
assert_same(6, ProcessNumberService::calculateCheckDigit(2026, 42), 'dv for 2026-00042');
assert_same('202600042', ProcessNumberService::buildNumericBase(2026, 42), 'numeric base');
assert_same('2026000426', ProcessNumberService::buildFullNumericString(2026, 42), 'full numeric string');

$number_data = [
    'numero_processo' => '2026-00042-6',
    'ano_processo' => 2026,
    'sequencial_processo' => 42,
    'digito_verificador_processo' => 6,
];

assert_same(true, ProcessNumberService::matchesSearchQuery($number_data, '2026-00042-6'), 'search full number');
assert_same(true, ProcessNumberService::matchesSearchQuery($number_data, '00042'), 'search partial sequential');
assert_same(true, ProcessNumberService::matchesSearchQuery($number_data, '2026'), 'search year');
assert_same(true, ProcessNumberService::matchesSearchQuery($number_data, '2026000426'), 'search unmasked');
assert_same(false, ProcessNumberService::matchesSearchQuery($number_data, '1999-00001-1'), 'search no match');

if ($failures > 0) {
    echo "\n{$failures} test(s) failed.\n";
    exit(1);
}

echo "\nAll process number tests passed.\n";
