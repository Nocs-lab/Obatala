<?php
namespace Obatala\Admin;

defined('ABSPATH') || exit;

class SettingsPage {
    public static function register_settings() {
        register_setting('obatala_settings_group', 'some_setting');  // Note the settings group name

        add_settings_section(
            'obatala_general_settings',
            __('General Settings', 'obatala-tainacan'),
            null,
            'obatala_settings_page'  // Ensure this matches with the page on which the settings are shown
        );

        add_settings_field(
            'some_setting_field',
            __('Some Setting', 'obatala-tainacan'),
            [self::class, 'some_setting_field_render'],
            'obatala_settings_page',  // Ensure this matches with the settings section
            'obatala_general_settings'
        );
    }

    public static function some_setting_field_render() {
        $value = get_option('some_setting');
        echo '<input type="text" name="some_setting" value="' . esc_attr($value) . '"/>';
        echo '<p class="description">' . __('Enter the value for some setting.', 'obatala-tainacan') . '</p>';
    }

    public static function create_settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <form action="options.php" method="post">
                <?php
                settings_fields('obatala_settings_group');  // Match the settings group
                do_settings_sections('obatala_settings_page');  // Match the page slug
                submit_button(__('Save Settings', 'obatala-tainacan'));
                ?>
            </form>
        </div>
        <?php
    }
}