<?php
namespace Obatala;
// namespaces are used to avoid conflicts with other plugins, themes, or WordPress core, it works like a folder structure
// in this case, we are using the namespace Obatala, which is the name of the plugin
// more info about namespaces: https://www.php.net/manual/en/language.namespaces.php

// plugin definition bellow

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
    // preventing magic methods in the class is a good practice to avoid conflicts with other plugins, themes, or WordPress core
    // and to avoid unexpected behaviors like $instance = new ObatalaPlugin(); $instance();
    
    
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
        add_action('admin_init', array($this, 'install'));
        // Define the plugin path as a CONSTANT VARIABLE
        define('OBATALA_PATH', plugin_dir_path(__FILE__));
        define('OBATALA_URL', plugin_dir_url(__FILE__));
        load_plugin_textdomain('obatala-tainacan', false, plugin_basename(dirname(__FILE__)) . '/languages');
        
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    

        $this->includes();
        if (is_admin()) {
            $this->admin_includes();
        }
    }

    /**
     * Enqueues scripts and styles.
     */
    public function enqueue_scripts() {
        // Register and enqueue scripts and styles here
    }
    public function admin_enqueue_scripts() {
        // Register and enqueue admin scripts and styles here
    }

    /**
     * Includes necessary files for the plugin.
     */
    private function includes() {
       
        // include_once plugin_dir_path(__FILE__) . 'path/to/file.php';
            
    }

    /**
     * Includes necessary admin files for the plugin.
     */
    private function admin_includes() {
        // include_once plugin_dir_path(__FILE__) . 'path/to/admin/file.php';
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
