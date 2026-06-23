<?php


namespace {
	if (!defined('ABSPATH')) {
		exit;
	}
}
namespace Obatala {



	require_once __DIR__ . '/vendor/autoload.php';

	/*
		Plugin Name: Obatala - Gestão de Processos Curatoriais
		Description: Adiciona funcionalidades de gestão de processos curatoriais para o plugin Tainacan
		Version: 1.7.14
		Author: NOCs
		License: GPLv2 or later
		Text Domain: obatala
		Requires Plugins: tainacan
	*/

	// Prevent direct access to the file
	defined('ABSPATH') || exit;

	// Define constants for our plugin
	define('OBATALA_PLUGIN_DIR', plugin_dir_path(__FILE__));
	define('OBATALA_PLUGIN_URL', plugin_dir_url(__FILE__));

	/**
	 * Main class for the Obatala Plugin
	 */
	class Nocs_ObatalaPlugin
	{
		/**
		 * Singleton instance
		 */
		private static $instance = null;

		/**
		 * Returns the singleton instance of the class.
		 */
		public static function get_instance()
		{
			if (self::$instance === null) {
				self::$instance = new self();
			}
			return self::$instance;
		}

		// Prevents cloning of the plugin instance
		public function __clone()
		{
		}

		// Prevents unserializing of the plugin instance
		public function __wakeup()
		{
		}

		/**
		 * Constructor.
		 */
		private function __construct()
		{
			add_action('plugins_loaded', array($this, 'initialize'));
		}

		/**
		 * Initialize the plugin after plugins are loaded.
		 */
		public function initialize()
		{
			load_plugin_textdomain('obatala', false, dirname(plugin_basename(__FILE__)) . '/languages');
			\Obatala\Security\Roles::ensure_roles();

			// Initialize admin menus and settings
			\Obatala\Admin\AdminMenu::init();
			\Obatala\Admin\Enqueuer::init();

			// Register the custom post types and taxonomies
			add_action('init', ['Obatala\Entities\Process', 'init']);
			add_action('init', ['Obatala\Entities\ProcessType', 'init']);
			add_action('init', ['Obatala\Database\ProcessNumberSchema', 'maybe_upgrade']);

			// Register and enqueue scripts and styles
			// Register and enqueue scripts and styles
			\Obatala\Admin\Enqueuer::init();


			// Register REST API fields
			$this->register_api_endpoints();

			add_action('admin_notices', array($this, 'maybe_notice_pdf_library'));
		}

		/**
		 * Show admin notice when Dompdf is not available (PDF report feature).
		 */
		public function maybe_notice_pdf_library()
		{
			if (!current_user_can('edit_posts')) {
				return;
			}
			$screen = function_exists('get_current_screen') ? get_current_screen() : null;
			if (!$screen || strpos($screen->id, 'obatala') === false) {
				return;
			}
			if (class_exists('\Dompdf\Dompdf')) {
				return;
			}
			echo '<div class="notice notice-warning is-dismissible"><p>';
			echo esc_html__('PDF generation library is not available. Run: composer install', 'obatala');
			echo ' ';
			echo '<code>composer install</code>';
			echo ' ';
			echo esc_html__('in the plugin folder to enable the "Generate PDF report" feature.', 'obatala');
			echo '</p></div>';
		}

		/**
		 * Register API endpoints
		 */
		private function register_api_endpoints()
		{
			$custom_post_type_api = new \Obatala\Api\CustomPostTypeApi();
			$custom_post_type_api->register();

			$process_custom_fields = new \Obatala\Api\ProcessApi();
			$process_custom_fields->register();

			$process_type_custom_fields = new \Obatala\Api\ProcessTypeApi();
			$process_type_custom_fields->register();

			$sector_api = new \Obatala\Api\SectorApi();
			$sector_api->register();

			$exporter_api = new \Obatala\Api\ExporterApi();
			$exporter_api->register();

			$tainacan_items_api = new \Obatala\Api\TainacanItemsApi();
			$tainacan_items_api->register();
		}



		/**
		 * Install the plugin
		 */
		public function install()
		{
			// Check if Tainacan plugin is active, if not, deactivate this plugin
			$tainacan_plugin  = 'tainacan/tainacan.php';
			$active_plugins   = (array) get_option('active_plugins', []);
			$network_plugins  = (array) get_site_option('active_sitewide_plugins', []);
			$is_tainacan_active = in_array($tainacan_plugin, $active_plugins, true) || isset($network_plugins[$tainacan_plugin]);

			if (!$is_tainacan_active) {
				deactivate_plugins(plugin_basename(__FILE__));
				wp_die(
					esc_html(__('Obatala requires the Tainacan plugin to be installed and activated.', 'obatala'))
				);
			}

			\Obatala\Security\Roles::ensure_roles();
			\Obatala\Database\ProcessNumberSchema::install();

			$number_service = new \Obatala\Services\ProcessNumberService();
			$number_service->backfillMissingNumbers();
		}
	}

	// Initialize the plugin
	Nocs_ObatalaPlugin::get_instance();
	register_activation_hook(__FILE__, [Nocs_ObatalaPlugin::get_instance(), 'install']);

}
