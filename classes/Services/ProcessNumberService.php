<?php

namespace Obatala\Services;

use Obatala\Database\ProcessNumberSchema;
use Obatala\Entities\Process;

defined('ABSPATH') || exit;

/**
 * Generates and persists unique process numbers in the format AAAA-NNNNN-DV.
 */
class ProcessNumberService {

    public const META_NUMERO = 'numero_processo';
    public const META_ANO = 'ano_processo';
    public const META_SEQUENCIAL = 'sequencial_processo';
    public const META_DV = 'digito_verificador_processo';

    public const PROTECTED_META_KEYS = [
        self::META_NUMERO,
        self::META_ANO,
        self::META_SEQUENCIAL,
        self::META_DV,
    ];

    /**
     * @return string Numeric base AAAANNNNN (9 digits).
     */
    public static function buildNumericBase($year, $sequential) {
        return sprintf('%04d%05d', (int) $year, (int) $sequential);
    }

    /**
     * DV = sum of digits of AAAANNNNN modulo 10.
     */
    public static function calculateCheckDigit($year, $sequential) {
        $base = self::buildNumericBase($year, $sequential);
        $sum = 0;
        foreach (str_split($base) as $digit) {
            $sum += (int) $digit;
        }
        return $sum % 10;
    }

    /**
     * @return string Formatted number AAAA-NNNNN-DV.
     */
    public static function formatProcessNumber($year, $sequential, $check_digit = null) {
        $dv = $check_digit ?? self::calculateCheckDigit($year, $sequential);
        return sprintf('%04d-%05d-%d', (int) $year, (int) $sequential, (int) $dv);
    }

    /**
     * @return string Digits-only representation (AAAANNNNNDV).
     */
    public static function buildFullNumericString($year, $sequential, $check_digit = null) {
        $dv = $check_digit ?? self::calculateCheckDigit($year, $sequential);
        return self::buildNumericBase($year, $sequential) . (string) (int) $dv;
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function getProcessNumberData($post_id) {
        $post_id = (int) $post_id;
        $numero = get_post_meta($post_id, self::META_NUMERO, true);
        if ($numero === '' || $numero === null) {
            return null;
        }

        return [
            'numero_processo' => (string) $numero,
            'ano_processo' => (int) get_post_meta($post_id, self::META_ANO, true),
            'sequencial_processo' => (int) get_post_meta($post_id, self::META_SEQUENCIAL, true),
            'digito_verificador_processo' => (int) get_post_meta($post_id, self::META_DV, true),
        ];
    }

    /**
     * Assigns a unique process number to a post.
     *
     * @param int      $post_id
     * @param int|null $year Year for sequencing; defaults to current year. Used by backfill.
     * @return array<string, mixed>|\WP_Error
     */
    public function assignToProcess($post_id, $year = null) {
        global $wpdb;

        $post_id = (int) $post_id;
        $post = get_post($post_id);
        if (!$post || $post->post_type !== Process::get_post_type()) {
            return new \WP_Error(
                'obatala_invalid_process',
                __('Invalid process.', 'obatala'),
                ['status' => 400]
            );
        }

        $existing = self::getProcessNumberData($post_id);
        if ($existing !== null) {
            return $existing;
        }

        if ($year === null) {
            $year = (int) current_time('Y');
        } else {
            $year = (int) $year;
        }

        if ($year < 1000 || $year > 9999) {
            return new \WP_Error(
                'obatala_invalid_year',
                __('Invalid process year.', 'obatala'),
                ['status' => 400]
            );
        }

        $lock_name = 'obatala_process_number_' . $year;
        $lock = $wpdb->get_var($wpdb->prepare('SELECT GET_LOCK(%s, 10)', $lock_name));
        if ((int) $lock !== 1) {
            return new \WP_Error(
                'obatala_number_lock_failed',
                __('Could not acquire lock to generate process number.', 'obatala'),
                ['status' => 503]
            );
        }

        try {
            $max_attempts = 5;
            for ($attempt = 0; $attempt < $max_attempts; $attempt++) {
                $sequential = $this->reserveNextSequential($year);
                if ($sequential === null) {
                    continue;
                }

                $check_digit = self::calculateCheckDigit($year, $sequential);
                $numero = self::formatProcessNumber($year, $sequential, $check_digit);
                $saved = $this->persistNumber($post_id, $year, $sequential, $check_digit, $numero);

                if ($saved !== false) {
                    return [
                        'numero_processo' => $numero,
                        'ano_processo' => $year,
                        'sequencial_processo' => $sequential,
                        'digito_verificador_processo' => $check_digit,
                    ];
                }
            }

            return new \WP_Error(
                'obatala_number_generation_failed',
                __('Failed to generate a unique process number.', 'obatala'),
                ['status' => 500]
            );
        } finally {
            $wpdb->query($wpdb->prepare('SELECT RELEASE_LOCK(%s)', $lock_name));
        }
    }

    /**
     * @return int|null
     */
    private function reserveNextSequential($year) {
        global $wpdb;

        $table = ProcessNumberSchema::get_sequence_table_name();
        $year = (int) $year;

        $inserted = $wpdb->query(
            $wpdb->prepare(
                "INSERT INTO {$table} (ano_processo, last_sequential) VALUES (%d, 1)
                 ON DUPLICATE KEY UPDATE last_sequential = last_sequential + 1",
                $year
            )
        );

        if ($inserted === false) {
            return null;
        }

        $sequential = (int) $wpdb->get_var(
            $wpdb->prepare("SELECT last_sequential FROM {$table} WHERE ano_processo = %d", $year)
        );

        return $sequential > 0 ? $sequential : null;
    }

    /**
     * @return bool True on success, false when unique constraint prevents insert (retry).
     */
    private function persistNumber($post_id, $year, $sequential, $check_digit, $numero) {
        global $wpdb;

        $registry_table = ProcessNumberSchema::get_registry_table_name();

        $inserted = $wpdb->insert(
            $registry_table,
            [
                'post_id' => (int) $post_id,
                'ano_processo' => (int) $year,
                'sequencial_processo' => (int) $sequential,
                'digito_verificador_processo' => (int) $check_digit,
                'numero_processo' => $numero,
            ],
            ['%d', '%d', '%d', '%d', '%s']
        );

        if ($inserted === false) {
            return false;
        }

        update_post_meta($post_id, self::META_NUMERO, $numero);
        update_post_meta($post_id, self::META_ANO, (int) $year);
        update_post_meta($post_id, self::META_SEQUENCIAL, (int) $sequential);
        update_post_meta($post_id, self::META_DV, (int) $check_digit);

        return true;
    }

    /**
     * Backfill numbers for legacy processes without numero_processo.
     */
    public function backfillMissingNumbers() {
        $posts = get_posts([
            'post_type' => Process::get_post_type(),
            'post_status' => 'any',
            'posts_per_page' => -1,
            'orderby' => 'date',
            'order' => 'ASC',
            'meta_query' => [
                'relation' => 'OR',
                [
                    'key' => self::META_NUMERO,
                    'compare' => 'NOT EXISTS',
                ],
                [
                    'key' => self::META_NUMERO,
                    'value' => '',
                    'compare' => '=',
                ],
            ],
        ]);

        foreach ($posts as $post) {
            $year = (int) gmdate('Y', strtotime($post->post_date));
            $this->assignToProcess((int) $post->ID, $year);
        }
    }

    /**
     * Checks whether a process matches a free-text search query.
     */
    public static function matchesSearchQuery(array $number_data, $query) {
        $query = trim((string) $query);
        if ($query === '') {
            return true;
        }

        if ($number_data === []) {
            return false;
        }

        $numero = strtolower((string) ($number_data['numero_processo'] ?? ''));
        $ano = (string) ($number_data['ano_processo'] ?? '');
        $sequencial = (int) ($number_data['sequencial_processo'] ?? 0);
        $dv = (string) ($number_data['digito_verificador_processo'] ?? '');
        $query_lower = strtolower($query);
        $query_digits = preg_replace('/\D+/', '', $query);

        if ($numero !== '' && strpos($numero, $query_lower) !== false) {
            return true;
        }

        if ($ano !== '' && $query_lower === $ano) {
            return true;
        }

        $seq_padded = sprintf('%05d', $sequencial);
        if ($query_digits !== "" && $sequencial > 0 && strpos($seq_padded, $query_digits) !== false) {
            return true;
        }

        if ($query_digits === '') {
            return false;
        }

        $full_digits = self::buildFullNumericString(
            (int) $ano,
            $sequencial,
            (int) $dv
        );
        $base_digits = self::buildNumericBase((int) $ano, $sequencial);

        return strpos($full_digits, $query_digits) !== false
            || strpos($base_digits, $query_digits) !== false
            || strpos(str_replace('-', '', $numero), $query_digits) !== false;
    }

    /**
     * Finds post IDs whose process number matches the query.
     *
     * @return int[]
     */
    public function findPostIdsByNumberQuery($query) {
        global $wpdb;

        $query = trim((string) $query);
        if ($query === '') {
            return [];
        }

        $registry_table = ProcessNumberSchema::get_registry_table_name();
        $like = '%' . $wpdb->esc_like($query) . '%';
        $post_ids = $wpdb->get_col(
            $wpdb->prepare(
                "SELECT post_id FROM {$registry_table} WHERE numero_processo LIKE %s",
                $like
            )
        );

        if (!empty($post_ids)) {
            return array_map('intval', $post_ids);
        }

        $digits = preg_replace('/\D+/', '', $query);
        if ($digits === '') {
            return [];
        }

        $rows = $wpdb->get_results("SELECT post_id, ano_processo, sequencial_processo, digito_verificador_processo, numero_processo FROM {$registry_table}", ARRAY_A);
        $matches = [];

        foreach ($rows as $row) {
            if (self::matchesSearchQuery([
                'numero_processo' => $row['numero_processo'],
                'ano_processo' => (int) $row['ano_processo'],
                'sequencial_processo' => (int) $row['sequencial_processo'],
                'digito_verificador_processo' => (int) $row['digito_verificador_processo'],
            ], $query)) {
                $matches[] = (int) $row['post_id'];
            }
        }

        return array_values(array_unique($matches));
    }
}
