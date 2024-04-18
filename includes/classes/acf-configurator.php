<?php
namespace Obatala;

class ACF_Configurator {

    public function __construct() {
        // Check if ACF Pro plugin is not currently existing
        if (!class_exists('ACF') && !defined( 'MY_ACF_PATH' ) ) {

            define( 'MY_ACF_PATH',  OBATALA_PATH . 'vendor/acf/' );
            define( 'MY_ACF_URL', OBATALA_URL . 'vendor/acf/' );
            
            $this->include_acf();
            $this->customize_acf_settings();
            $this->configure_json_save_load_points();
            
            add_filter('acf/settings/url', array($this, 'fix_acf_settings_url'));
        } else {
            add_filter('acf/settings/load_json', array($this, 'acf_json_load_point'));
        }
    }
    private function include_acf() {
            // Include ACF
            include_once( MY_ACF_PATH . 'acf.php' );        
    }
    private function customize_acf_settings() {
        // Hide the ACF admin menu item.
        // add_filter( 'acf/settings/show_admin', '__return_false' );
        // Hide the ACF Updates menu
        add_filter( 'acf/settings/show_updates', '__return_false', 100 );
        
        // Optionally hide the ACF field group menu item
        // add_filter('acf/settings/show_admin', '__return_false');
    }



    public function fix_acf_settings_url($url) {
        return MY_ACF_URL; // Ensure MY_ACF_URL is defined somewhere or pass it as a parameter
    }
    

    private function configure_json_save_load_points() {
        add_filter('acf/settings/save_json', array($this, 'acf_json_save_point'));
        add_filter('acf/settings/load_json', array($this, 'acf_json_load_point'));
    }

    public function acf_json_save_point($path) {
        return OBATALA_PATH . 'includes/acf-json';
    }

    public function acf_json_load_point($paths) {
        unset($paths[0]);
        $paths[] = OBATALA_PATH . 'includes/acf-json';
        return $paths;
    }
    
}

new ACF_Configurator();

?>
