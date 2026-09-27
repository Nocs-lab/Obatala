<?php

namespace Obatala\Security;

defined('ABSPATH') || exit;

class RoleMigration
{
    const OPTION_VERSION = 'tainacan_processes_roles_version';
    const OPTION_REPORT = 'tainacan_processes_roles_migration_report';
    const VERSION = 3;

    public static function maybe_migrate()
    {
        if ((int) get_option(self::OPTION_VERSION, 0) < self::VERSION) {
            self::migrate();
        }
    }

    public static function migrate()
    {
        $report = [
            'version' => self::VERSION,
            'users_migrated' => 0,
            'users_migrated_from_direct_caps' => 0,
            'role_capability_grants' => 0,
            'role_capability_removals' => 0,
            'user_capability_removals' => 0,
            'legacy_roles_removed' => 0,
            'participant_role_renamed' => false,
            'roles_not_found' => [],
        ];

        self::grant_caps(
            Roles::ROLE_PARTICIPANT,
            array_merge(['read' => true], Roles::participant_caps()),
            $report
        );
        self::grant_caps('administrator', Roles::all_caps(), $report);
        self::grant_caps(Roles::ROLE_TAINACAN_ADMIN, Roles::all_caps(), $report);
        self::grant_caps(Roles::ROLE_TAINACAN_EDITOR, Roles::editor_caps(), $report);

        $missing_targets = array_intersect(
            [Roles::ROLE_PARTICIPANT, Roles::ROLE_TAINACAN_ADMIN, Roles::ROLE_TAINACAN_EDITOR],
            $report['roles_not_found']
        );
        if (!empty($missing_targets)) {
            $report['status'] = 'pending_missing_target_roles';
            update_option(self::OPTION_REPORT, $report, false);
            return;
        }

        self::rename_participant_role($report);
        self::migrate_legacy_users($report);
        self::migrate_direct_capability_users($report);
        self::normalize_process_roles_for_users();
        self::normalize_role_capabilities($report);
        self::remove_legacy_roles($report);

        $report['status'] = 'complete';
        update_option(self::OPTION_REPORT, $report, false);
        update_option(self::OPTION_VERSION, self::VERSION, false);
    }

    private static function grant_caps($role_name, $capabilities, &$report)
    {
        $role = get_role($role_name);
        if (!$role) {
            $report['roles_not_found'][] = $role_name;
            return;
        }
        foreach ($capabilities as $capability => $grant) {
            if ($grant && !$role->has_cap($capability)) {
                $role->add_cap($capability);
                $report['role_capability_grants']++;
            }
        }
    }

    private static function rename_participant_role(&$report)
    {
        global $wp_roles;
        if (!$wp_roles || empty($wp_roles->roles[Roles::ROLE_PARTICIPANT])) {
            return;
        }

        $display_name = __('Tainacan Participant', 'obatala');
        if (($wp_roles->roles[Roles::ROLE_PARTICIPANT]['name'] ?? '') === $display_name) {
            return;
        }

        $wp_roles->roles[Roles::ROLE_PARTICIPANT]['name'] = $display_name;
        if (isset($wp_roles->role_names) && is_array($wp_roles->role_names)) {
            $wp_roles->role_names[Roles::ROLE_PARTICIPANT] = $display_name;
        }
        if (!empty($wp_roles->role_key)) {
            update_option($wp_roles->role_key, $wp_roles->roles);
        }
        $report['participant_role_renamed'] = true;
    }

    private static function migrate_legacy_users(&$report)
    {
        $legacy_roles = [Roles::ROLE_ADMIN, Roles::ROLE_EDITOR, Roles::ROLE_AUTHOR];
        $users = get_users(['role__in' => $legacy_roles]);
        foreach ($users as $user) {
            $source_role = self::highest_legacy_role((array) $user->roles);
            if ($source_role === '') {
                continue;
            }
            $target_role = self::target_role($source_role);
            $other_roles = array_values(array_diff((array) $user->roles, $legacy_roles));
            if (empty($other_roles)) {
                $user->set_role($target_role);
            } else {
                foreach ($legacy_roles as $legacy_role) {
                    $user->remove_role($legacy_role);
                }
                if (
                    !in_array('administrator', $other_roles, true)
                    && !in_array($target_role, $other_roles, true)
                ) {
                    $user->add_role($target_role);
                }
            }
            $report['users_migrated']++;
        }
    }

    private static function migrate_direct_capability_users(&$report)
    {
        foreach (get_users(['fields' => 'all']) as $user) {
            $target_role = self::target_for_direct_caps((array) $user->caps);
            if ($target_role && !self::has_equivalent_process_role((array) $user->roles, $target_role)) {
                $user->add_role($target_role);
                $report['users_migrated_from_direct_caps']++;
            }

            $plugin_caps = array_merge(
                array_keys(Roles::legacy_capability_map()),
                array_keys(Roles::all_caps())
            );
            foreach (array_keys((array) $user->caps) as $capability) {
                if (strpos($capability, 'obatala_') === 0) {
                    $plugin_caps[] = $capability;
                }
            }
            $plugin_caps = array_values(array_unique($plugin_caps));
            foreach ($plugin_caps as $capability) {
                if (array_key_exists($capability, (array) $user->caps)) {
                    $user->remove_cap($capability);
                    $report['user_capability_removals']++;
                }
            }
        }
    }

    private static function target_for_direct_caps($caps)
    {
        $effective_caps = [];
        foreach ($caps as $capability => $grant) {
            if (!$grant) {
                continue;
            }
            $effective_caps[] = Roles::legacy_capability_map()[$capability] ?? $capability;
        }

        $administrator_caps = [
            Roles::CAP_TP_MANAGE_MODELS,
            Roles::CAP_TP_MANAGE_GROUPS,
            Roles::CAP_TP_MANAGE_MAPPINGS,
            Roles::CAP_TP_MANAGE_SETTINGS,
            Roles::CAP_TP_DELETE_MODELS,
            Roles::CAP_TP_DELETE_PROCESSES,
        ];
        if (array_intersect($administrator_caps, $effective_caps)) {
            return Roles::ROLE_TAINACAN_ADMIN;
        }
        if (array_intersect([Roles::CAP_TP_MANAGE, Roles::CAP_TP_EXECUTE_EXPORTS], $effective_caps)) {
            return Roles::ROLE_TAINACAN_EDITOR;
        }
        if (array_intersect(array_keys(Roles::participant_caps()), $effective_caps)) {
            return Roles::ROLE_PARTICIPANT;
        }
        return '';
    }

    private static function has_equivalent_process_role($roles, $target_role)
    {
        if (in_array('administrator', $roles, true) || in_array(Roles::ROLE_TAINACAN_ADMIN, $roles, true)) {
            return true;
        }
        if ($target_role === Roles::ROLE_TAINACAN_EDITOR && in_array(Roles::ROLE_TAINACAN_EDITOR, $roles, true)) {
            return true;
        }
        if ($target_role === Roles::ROLE_PARTICIPANT) {
            return (bool) array_intersect(
                [Roles::ROLE_TAINACAN_EDITOR, Roles::ROLE_PARTICIPANT],
                $roles
            );
        }
        return in_array($target_role, $roles, true);
    }

    private static function normalize_process_roles_for_users()
    {
        foreach (get_users(['fields' => 'all']) as $user) {
            $roles = (array) $user->roles;
            if (in_array(Roles::ROLE_TAINACAN_ADMIN, $roles, true)) {
                $user->remove_role(Roles::ROLE_TAINACAN_EDITOR);
                $user->remove_role(Roles::ROLE_PARTICIPANT);
            } elseif (in_array(Roles::ROLE_TAINACAN_EDITOR, $roles, true)) {
                $user->remove_role(Roles::ROLE_PARTICIPANT);
            }
        }
    }

    private static function normalize_role_capabilities(&$report)
    {
        global $wp_roles;
        if (!$wp_roles || empty($wp_roles->roles)) {
            return;
        }

        $matrices = [
            'administrator' => Roles::all_caps(),
            Roles::ROLE_TAINACAN_ADMIN => Roles::all_caps(),
            Roles::ROLE_TAINACAN_EDITOR => Roles::editor_caps(),
            Roles::ROLE_PARTICIPANT => Roles::participant_caps(),
        ];
        $new_caps = array_keys(Roles::all_caps());

        foreach (array_keys($wp_roles->roles) as $role_name) {
            $role = get_role($role_name);
            if (!$role) {
                continue;
            }
            foreach (array_keys((array) $role->capabilities) as $capability) {
                if (strpos($capability, 'obatala_') === 0 && $role->has_cap($capability)) {
                    $role->remove_cap($capability);
                    $report['role_capability_removals']++;
                }
            }
            $allowed_caps = $matrices[$role_name] ?? [];
            foreach ($new_caps as $capability) {
                if ($role->has_cap($capability) && empty($allowed_caps[$capability])) {
                    $role->remove_cap($capability);
                    $report['role_capability_removals']++;
                }
            }
        }
    }

    private static function remove_legacy_roles(&$report)
    {
        foreach ([Roles::ROLE_ADMIN, Roles::ROLE_EDITOR, Roles::ROLE_AUTHOR] as $role_name) {
            if (get_role($role_name)) {
                remove_role($role_name);
                $report['legacy_roles_removed']++;
            }
        }
    }

    private static function highest_legacy_role($roles)
    {
        foreach ([Roles::ROLE_ADMIN, Roles::ROLE_EDITOR, Roles::ROLE_AUTHOR] as $role) {
            if (in_array($role, $roles, true)) {
                return $role;
            }
        }
        return '';
    }

    private static function target_role($source_role)
    {
        if ($source_role === Roles::ROLE_ADMIN) {
            return Roles::ROLE_TAINACAN_ADMIN;
        }
        if ($source_role === Roles::ROLE_EDITOR) {
            return Roles::ROLE_TAINACAN_EDITOR;
        }
        return Roles::ROLE_PARTICIPANT;
    }

}
