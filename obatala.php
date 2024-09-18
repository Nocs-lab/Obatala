<?php

namespace Obatala;

require_once __DIR__ . '/vendor/autoload.php';

/*
	Plugin Name: Obatala - Plugin de Gestão de Processos Curatoriais para WordPress
	Description: Adiciona funcionalidades de gestão de processos curatoriais para o plugin Tainacan
	Version: 1.2.2
	Author: Douglas de Araújo
	Author URI: github.com/everbero
	License: GPLv2 or later
	Text Domain: obatala
*/

// Prevent direct access to the file
defined('ABSPATH') || exit;

// Define constants for our plugin
define('OBATALA_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('OBATALA_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main class for the Obatala Plugin
 */
class Nocs_ObatalaPlugin {
	/**
	 * Singleton instance
	 */
	private static $instance = null;

	/**
	 * Returns the singleton instance of the class.
	 */
	public static function get_instance() {
		if (self::$instance === null) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	// Prevents cloning of the plugin instance
	public function __clone() {
	}

	// Prevents unserializing of the plugin instance
	public function __wakeup() {
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		add_action('plugins_loaded', array($this, 'initialize'));
	}

	/**
	 * Initialize the plugin after plugins are loaded.
	 */
	public function initialize() {
		// Load plugin text domain
		load_plugin_textdomain('obatala', false, plugin_basename(dirname(__FILE__)) . '/languages');

		// Initialize admin menus and settings
		\Obatala\Admin\AdminMenu::init();
		\Obatala\Admin\Enqueuer::init();

		// Register the custom post types and taxonomies
		add_action('init', ['Obatala\Entities\Process', 'init']);
		add_action('init', ['Obatala\Entities\ProcessStep', 'init']);
		add_action('init', ['Obatala\Entities\ProcessType', 'init']);
		add_action('init', ['Obatala\Entities\Sector', 'init']);

		// Register and enqueue scripts and styles
		// Register and enqueue scripts and styles
		\Obatala\Admin\Enqueuer::init();


		// Register REST API fields
		$this->register_api_endpoints();
	}

	/**
	 * Register API endpoints
	 */
	private function register_api_endpoints() {
		$custom_post_type_api = new \Obatala\Api\CustomPostTypeApi();
		$custom_post_type_api->register();
		
		$process_custom_fields = new \Obatala\Api\ProcessApi();
		$process_custom_fields->register();

		$custom_metadata_api = new \Obatala\Api\StepMetadataApi();
		$custom_metadata_api->register();

		$process_step_custom_fields = new \Obatala\Api\ProcessStepApi();
		$process_step_custom_fields->register();

		$process_type_custom_fields = new \Obatala\Api\ProcessTypeApi();
		$process_type_custom_fields->register();

		$sector_api = new \Obatala\Api\SectorAPI();
		$sector_api->register();
	}



	/**
	 * Install the plugin
	 */
	public function install() {
		// Check if Tainacan plugin is active, if not, deactivate this plugin
		if (!in_array('tainacan/tainacan.php', apply_filters('active_plugins', get_option('active_plugins')))) {
			deactivate_plugins(plugin_basename(__FILE__));
			wp_die(
				__('Obatala requires the Tainacan plugin to be installed and activated.', 'obatala')
			);
		}
	}
}

// Initialize the plugin
Nocs_ObatalaPlugin::get_instance();
register_activation_hook(__FILE__, [Nocs_ObatalaPlugin::get_instance(), 'install']);
