<?php
namespace Obatala\Admin;

defined('ABSPATH') || exit;

class SettingsPage {
    private const OPTION_SOME_SETTING = 'obatala_some_setting';
    private const OPTION_ENABLE_FEATURE = 'obatala_enable_feature';
    private const OPTION_API_KEY = 'obatala_api_key';

    public static function register_settings() {
        // Register settings group
        register_setting('obatala_settings_group', self::OPTION_SOME_SETTING, 'sanitize_text_field');
        register_setting('obatala_settings_group', self::OPTION_ENABLE_FEATURE, 'sanitize_text_field');
        register_setting('obatala_settings_group', self::OPTION_API_KEY, 'sanitize_text_field');

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

    private static function get_option_with_legacy_fallback($new_key, $legacy_key, $default = '') {
        $value = get_option($new_key, null);
        if ($value !== null) {
            return $value;
        }

        return get_option($legacy_key, $default);
    }

    public static function some_setting_field_render() {
        $value = self::get_option_with_legacy_fallback(self::OPTION_SOME_SETTING, 'some_setting');
        echo '<input type="text" name="' . esc_attr(self::OPTION_SOME_SETTING) . '" value="' . esc_attr($value) . '"/>';
        echo '<p class="description">' . esc_html__('Enter the value for some setting.', 'obatala') . '</p>';
    }

    public static function enable_feature_field_render() {
        $checked = self::get_option_with_legacy_fallback(self::OPTION_ENABLE_FEATURE, 'enable_feature') ? 'checked' : '';
        echo '<input type="checkbox" name="' . esc_attr(self::OPTION_ENABLE_FEATURE) . '" ' . esc_attr($checked) . '/>';
        echo '<p class="description">' . esc_html__('Enable or disable a specific feature.', 'obatala') . '</p>';
    }

    public static function api_key_field_render() {
        $value = self::get_option_with_legacy_fallback(self::OPTION_API_KEY, 'api_key');
        echo '<input type="text" name="' . esc_attr(self::OPTION_API_KEY) . '" value="' . esc_attr($value) . '"/>';
        echo '<p class="description">' . esc_html__('Enter your API key here.', 'obatala') . '</p>';
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
