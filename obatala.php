<?php

namespace Obatala;

require_once __DIR__ . '/vendor/autoload.php';

// Plugin definition
/*
    Plugin Name: Obatala - Plugin de Gestão de Processos Curatoriais para WordPress
    Description: Adiciona funcionalidades de gestão de processos curatoriais para o plugin Tainacan
    Version: beta.0.1
    Author: Douglas de Araújo
    Author URI: github.com/everbero
    License: GPLv2 or later
    Text Domain: obatala-tainacan
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
    public function __clone() {}

    // Prevents unserializing of the plugin instance
    public function __wakeup() {}

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
        load_plugin_textdomain('obatala-tainacan', false, plugin_basename(dirname(__FILE__)) . '/languages');

        // Registering admin menus and settings
        add_action('admin_menu', ['Obatala\Admin\AdminMenu', 'add_admin_pages']);
        add_action('admin_init', ['Obatala\Admin\SettingsPage', 'register_settings']);

        // Register the custom post type and taxonomies
        add_action('init', ['Obatala\Entities\ProcessCollection', 'init']);
        add_action('init', ['Obatala\Entities\ProcessStepCollection', 'init']);
        // Register and enqueue scripts and styles
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);

        // Register custom layouts
        add_filter('single_template', function ($template) {
            global $post;
            if ($post->post_type == 'process_obatala') {
                $plugin_template = plugin_dir_path(__FILE__) . 'single-process_obatala.php';
                if (file_exists($plugin_template)) {
                    return $plugin_template;
                }
            }
            return $template;
        });

        add_filter('archive_template', function ($template) {
            if (is_post_type_archive('process_obatala')) {
                $plugin_template = plugin_dir_path(__FILE__) . 'archive-process_obatala.php';
                if (file_exists($plugin_template)) {
                    return $plugin_template;
                }
            }
            return $template;
        });
    }

    /**
     * Enqueues scripts and styles.
     */
    public function enqueue_scripts() {
       
    }

    public function admin_enqueue_scripts() {
        // Register and enqueue admin scripts and styles here
    }

    /**
     * Activation hook for the plugin.
     */
    public function install() {
        if (!in_array('tainacan/tainacan.php', apply_filters('active_plugins', get_option('active_plugins')))) {
            deactivate_plugins(plugin_basename(__FILE__));
            wp_die(
                __('Obatala requires the Tainacan plugin to be installed and activated.', 'obatala-tainacan')
            );
        }
    }
}

// Initialize the plugin
Nocs_ObatalaPlugin::get_instance();
