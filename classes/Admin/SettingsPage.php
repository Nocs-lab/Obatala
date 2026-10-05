<?php
namespace Obatala\Admin;

defined('ABSPATH') || exit;

class SettingsPage {
    public static function register_settings() {
        // Register settings group
        register_setting('obatala_settings_group', 'some_setting');
        register_setting('obatala_settings_group', 'enable_feature');
        register_setting('obatala_settings_group', 'api_key');

        // Add a settings section for general settings
        add_settings_section(
            'obatala_general_settings',
            __('General Settings', 'obatala'),
            null,
            'obatala_settings_page'
        );

        // Add individual settings fields
        add_settings_field(
            'some_setting_field',
            __('Some Setting', 'obatala'),
            [self::class, 'some_setting_field_render'],
            'obatala_settings_page',
            'obatala_general_settings'
        );

        add_settings_field(
            'enable_feature_field',
            __('Enable Feature', 'obatala'),
            [self::class, 'enable_feature_field_render'],
            'obatala_settings_page',
            'obatala_general_settings'
        );

        add_settings_field(
            'api_key_field',
            __('API Key', 'obatala'),
            [self::class, 'api_key_field_render'],
            'obatala_settings_page',
            'obatala_general_settings'
        );
    }

    public static function some_setting_field_render() {
        $value = get_option('some_setting');
        echo '<input type="text" name="some_setting" value="' . esc_attr($value) . '"/>';
        echo '<p class="description">' . __('Enter the value for some setting.', 'obatala') . '</p>';
    }

    public static function enable_feature_field_render() {
        $checked = get_option('enable_feature') ? 'checked' : '';
        echo '<input type="checkbox" name="enable_feature" ' . $checked . '/>';
        echo '<p class="description">' . __('Enable or disable a specific feature.', 'obatala') . '</p>';
    }

    public static function api_key_field_render() {
        $value = get_option('api_key');
        echo '<input type="text" name="api_key" value="' . esc_attr($value) . '"/>';
        echo '<p class="description">' . __('Enter your API key here.', 'obatala') . '</p>';
    }

    public static function create_settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_fields('obatala_settings_group');  // Match the settings group
                do_settings_sections('obatala_settings_page');  // Match the page slug
                submit_button(__('Save Settings', 'obatala'));
                ?>
            </form>
        </div>
        <?php
    }
}
