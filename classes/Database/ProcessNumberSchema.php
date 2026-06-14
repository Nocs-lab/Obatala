<?php

namespace Obatala\Database;

defined('ABSPATH') || exit;

/**
 * Creates and upgrades database structures for process numbering.
 */
class ProcessNumberSchema {

    public const DB_VERSION = '1.0.0';
    public const DB_VERSION_OPTION = 'obatala_process_number_db_version';

    public static function get_sequence_table_name() {
        global $wpdb;
        return $wpdb->prefix . 'obatala_process_sequence';
    }

    public static function get_registry_table_name() {
        global $wpdb;
        return $wpdb->prefix . 'obatala_process_numbers';
    }

    public static function maybe_upgrade() {
        $installed = get_option(self::DB_VERSION_OPTION, '');
        if ($installed === self::DB_VERSION) {
            return;
        }

        self::install();
        update_option(self::DB_VERSION_OPTION, self::DB_VERSION);

        $number_service = new \Obatala\Services\ProcessNumberService();
        $number_service->backfillMissingNumbers();
    }

    public static function install() {
        global $wpdb;

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $charset_collate = $wpdb->get_charset_collate();
        $sequence_table = self::get_sequence_table_name();
        $registry_table = self::get_registry_table_name();

        $sql_sequence = "CREATE TABLE {$sequence_table} (
            ano_processo smallint(4) unsigned NOT NULL,
            last_sequential int(5) unsigned NOT NULL DEFAULT 0,
            PRIMARY KEY  (ano_processo)
        ) {$charset_collate};";

        $sql_registry = "CREATE TABLE {$registry_table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            post_id bigint(20) unsigned NOT NULL,
            ano_processo smallint(4) unsigned NOT NULL,
            sequencial_processo int(5) unsigned NOT NULL,
            digito_verificador_processo tinyint(1) unsigned NOT NULL,
            numero_processo varchar(20) NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY unique_year_seq (ano_processo, sequencial_processo),
            UNIQUE KEY unique_numero_processo (numero_processo),
            UNIQUE KEY unique_post_id (post_id),
            KEY idx_numero_processo (numero_processo)
        ) {$charset_collate};";

        dbDelta($sql_sequence);
        dbDelta($sql_registry);
    }
}
