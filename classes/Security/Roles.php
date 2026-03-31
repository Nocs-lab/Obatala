<?php

namespace Obatala\Security;

defined('ABSPATH') || exit;

class Roles
{
    const ROLE_ADMIN = 'obatala_administrator';
    const ROLE_EDITOR = 'obatala_editor';
    const ROLE_AUTHOR = 'obatala_author';

    const CAP_ACCESS = 'obatala_access';
    const CAP_PROCESS_MANAGE = 'obatala_manage_processes';
    const CAP_PROCESS_ADVANCE = 'obatala_advance_stages';
    const CAP_COMMENT = 'obatala_comment_manage';
    const CAP_REPORT = 'obatala_report_generate';
    const CAP_MODEL_MANAGE = 'obatala_manage_models';
    const CAP_GROUP_MANAGE = 'obatala_manage_groups';
    const CAP_MAPPER_MANAGE = 'obatala_manage_mappers';
    const CAP_SETTINGS_MANAGE = 'obatala_settings_manage';

    /**
     * Create/update Obatala roles and capabilities.
     */
    public static function ensure_roles()
    {
        $all_caps = self::all_caps();
        $operator_caps = self::operator_caps();
        $author_caps = self::author_caps();

        add_role(self::ROLE_ADMIN, __('Obatala Administrator', 'obatala'), array_merge(['read' => true], $all_caps));
        add_role(self::ROLE_EDITOR, __('Obatala Editor', 'obatala'), array_merge(['read' => true], $operator_caps));
        add_role(self::ROLE_AUTHOR, __('Obatala Author', 'obatala'), array_merge(['read' => true], $author_caps));

        self::grant_caps_to_role(self::ROLE_ADMIN, $all_caps);
        self::grant_caps_to_role(self::ROLE_EDITOR, $operator_caps);
        self::grant_caps_to_role(self::ROLE_AUTHOR, $author_caps);

        // Keep backward compatibility for common WP roles.
        self::grant_caps_to_role('administrator', $all_caps);
        self::grant_caps_to_role('editor', $operator_caps);
        self::grant_caps_to_role('author', $author_caps);
    }

    /**
     * Checks whether current user can access Obatala.
     */
    public static function can_access_obatala()
    {
        return is_user_logged_in() && (
            current_user_can(self::CAP_ACCESS) ||
            current_user_can('edit_posts') ||
            current_user_can('manage_options')
        );
    }

    private static function grant_caps_to_role($role_name, $caps)
    {
        $role = get_role($role_name);
        if (!$role) {
            return;
        }
        foreach ($caps as $cap => $grant) {
            if ($grant) {
                $role->add_cap($cap);
            }
        }
    }

    private static function all_caps()
    {
        return [
            self::CAP_ACCESS => true,
            self::CAP_PROCESS_MANAGE => true,
            self::CAP_PROCESS_ADVANCE => true,
            self::CAP_COMMENT => true,
            self::CAP_REPORT => true,
            self::CAP_MODEL_MANAGE => true,
            self::CAP_GROUP_MANAGE => true,
            self::CAP_MAPPER_MANAGE => true,
            self::CAP_SETTINGS_MANAGE => true,
        ];
    }

    private static function operator_caps()
    {
        return [
            self::CAP_ACCESS => true,
            self::CAP_PROCESS_MANAGE => true,
            self::CAP_PROCESS_ADVANCE => true,
            self::CAP_COMMENT => true,
            self::CAP_REPORT => true,
        ];
    }

    private static function author_caps()
    {
        return [
            self::CAP_ACCESS => true,
            self::CAP_PROCESS_MANAGE => true,
            self::CAP_COMMENT => true,
            self::CAP_REPORT => true,
        ];
    }
}
