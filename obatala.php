<?php

namespace Obatala;

require_once __DIR__ . '/vendor/autoload.php';
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

            // in case we need custom hooks
            // self::$instance->register_hooks();
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
    // in case we need custom hooks
    // private function register_hooks() {
    //     // add_action('tainacan-register-vuejs-component', [$this, 'register_vuejs_component']);
    // }

    /**
     * Initialize the plugin after plugins are loaded.
     */
    public function initialize() {
        // Register activation hooks for our menu pages
        // Note: these are static methods, so we use the :: syntax
        // for non static methods, we would use the -> syntax or new up an instance of the class
        // i.e add_action('init', [new CustomPostType(), 'register']);

        // todo atualizar estes imports, deve verificar se psr-4 está funcional fora do conteiner do kinsta
        require_once __DIR__ . '/classes/admin/AdminMenu.php';
        require_once __DIR__ . '/classes/admin/SettingsPage.php';
        require_once __DIR__ . '/classes/repositories/ProcessRepository.php';
        // Load plugin text domain
        load_plugin_textdomain('obatala-tainacan', false, plugin_basename(dirname(__FILE__)) . '/languages');

        // Registering admin menus and settings
        add_action('admin_menu', ['Obatala\Admin\AdminMenu', 'add_admin_pages']);
        add_action('admin_init', ['Obatala\Admin\SettingsPage', 'register_settings']);

        // Register the custom post type from ProcessCollection
        $processCollection = ProcessCollection::get_instance();
        add_action('init', [$processCollection, 'register_post_type']);

        // Register and enqueue scripts and styles
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_scripts']);

        // Register custom layouts
        add_filter('single_template', function ($template) {
            global $post;
            if ($post->post_type == 'process_collection') {
                $plugin_template = plugin_dir_path(__FILE__) . 'single-process_collection.php';
                if (file_exists($plugin_template)) {
                    return $plugin_template;
                }
            }
            return $template;
        });
        
        add_filter('archive_template', function ($template) {
            global $post;
            if (is_post_type_archive('process_collection')) {
                $plugin_template = plugin_dir_path(__FILE__) . 'archive-process_collection.php';
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
        // Enqueue DaisyUI CSS
        wp_enqueue_style('daisyui-css', 'https://cdn.jsdelivr.net/npm/daisyui@4.11.1/dist/full.min.css', array(), '4.11.1');
    
        // Enqueue Tailwind CSS via script tag as it requires JS execution
        wp_enqueue_script('tailwindcss', 'https://cdn.tailwindcss.com', array(), null, true);
    
        // Tailwind configuration script
        $tailwind_config = "tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#570df8',
                        secondary: '#f000b8',
                        accent: '#37cdbe',
                        neutral: '#3d4451',
                        'base-100': '#ffffff',
                        info: '#3ABFF8',
                        success: '#36D399',
                        warning: '#FBBD23',
                        error: '#F87272',
                    }
                }
            },
            daisyui: {
                themes: ['light']
            }
        };";
        // Include the daisyUI plugin initialization
        $tailwind_config .= "tailwind.config.plugins = [daisyui];";
    
        // Add the configuration script after the Tailwind script
        wp_add_inline_script('tailwindcss', $tailwind_config, 'after');
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
