<?php

namespace Obatala\Security;

defined('ABSPATH') || exit;

class Roles
{
    // Legacy identifiers are used only by the one-time cleanup migration.
    const ROLE_ADMIN = 'obatala_administrator';
    const ROLE_EDITOR = 'obatala_editor';
    const ROLE_AUTHOR = 'obatala_author';

    const ROLE_TAINACAN_ADMIN = 'tainacan-administrator';
    const ROLE_TAINACAN_EDITOR = 'tainacan-editor';
    const ROLE_TAINACAN_AUTHOR = 'tainacan-author';
    const ROLE_PARTICIPANT = 'tainacan-processes-participant';

    // Legacy capabilities are mapped and removed by RoleMigration.
    const LEGACY_CAP_ACCESS = 'obatala_access';
    const LEGACY_CAP_PROCESS_MANAGE = 'obatala_manage_processes';
    const LEGACY_CAP_PROCESS_ADVANCE = 'obatala_advance_stages';
    const LEGACY_CAP_COMMENT = 'obatala_comment_manage';
    const LEGACY_CAP_REPORT = 'obatala_report_generate';
    const LEGACY_CAP_MODEL_MANAGE = 'obatala_manage_models';
    const LEGACY_CAP_GROUP_MANAGE = 'obatala_manage_groups';
    const LEGACY_CAP_MAPPER_MANAGE = 'obatala_manage_mappers';
    const LEGACY_CAP_SETTINGS_MANAGE = 'obatala_settings_manage';
    const LEGACY_CAP_ADMIN_PROCESSES = 'obatala_admin_processes';

    const CAP_TP_ACCESS = 'tainacan_processes_access';
    const CAP_TP_MANAGE = 'tainacan_processes_manage';
    const CAP_TP_ADVANCE_STAGES = 'tainacan_processes_advance_stages';
    const CAP_TP_MANAGE_COMMENTS = 'tainacan_processes_manage_comments';
    const CAP_TP_GENERATE_REPORTS = 'tainacan_processes_generate_reports';
    const CAP_TP_MANAGE_MODELS = 'tainacan_processes_manage_models';
    const CAP_TP_MANAGE_GROUPS = 'tainacan_processes_manage_groups';
    const CAP_TP_MANAGE_MAPPINGS = 'tainacan_processes_manage_mappings';
    const CAP_TP_MANAGE_SETTINGS = 'tainacan_processes_manage_settings';
    const CAP_TP_DELETE_MODELS = 'tainacan_processes_delete_models';
    const CAP_TP_DELETE_PROCESSES = 'tainacan_processes_delete_processes';
    const CAP_TP_EXECUTE_EXPORTS = 'tainacan_processes_execute_exports';

    /**
     * Ensures the plugin-owned role exists and runs one-time role migrations.
     * Existing role customizations are not overwritten on every request.
     */
    public static function ensure_roles()
    {
        if (!get_role(self::ROLE_PARTICIPANT)) {
            add_role(
                self::ROLE_PARTICIPANT,
                __('Tainacan Participant', 'obatala'),
                array_merge(['read' => true], self::participant_caps())
            );
        }

        RoleMigration::maybe_migrate();
    }

    public static function all_caps()
    {
        return self::caps_map([
            self::CAP_TP_ACCESS,
            self::CAP_TP_MANAGE,
            self::CAP_TP_ADVANCE_STAGES,
            self::CAP_TP_MANAGE_COMMENTS,
            self::CAP_TP_GENERATE_REPORTS,
            self::CAP_TP_MANAGE_MODELS,
            self::CAP_TP_MANAGE_GROUPS,
            self::CAP_TP_MANAGE_MAPPINGS,
            self::CAP_TP_MANAGE_SETTINGS,
            self::CAP_TP_DELETE_MODELS,
            self::CAP_TP_DELETE_PROCESSES,
            self::CAP_TP_EXECUTE_EXPORTS,
        ]);
    }

    public static function editor_caps()
    {
        return self::caps_map([
            self::CAP_TP_ACCESS,
            self::CAP_TP_MANAGE,
            self::CAP_TP_ADVANCE_STAGES,
            self::CAP_TP_MANAGE_COMMENTS,
            self::CAP_TP_GENERATE_REPORTS,
            self::CAP_TP_EXECUTE_EXPORTS,
        ]);
    }

    public static function participant_caps()
    {
        return self::caps_map([
            self::CAP_TP_ACCESS,
            self::CAP_TP_ADVANCE_STAGES,
            self::CAP_TP_MANAGE_COMMENTS,
            self::CAP_TP_GENERATE_REPORTS,
        ]);
    }

    public static function legacy_capability_map()
    {
        return [
            self::LEGACY_CAP_ACCESS => self::CAP_TP_ACCESS,
            self::LEGACY_CAP_PROCESS_MANAGE => self::CAP_TP_MANAGE,
            self::LEGACY_CAP_PROCESS_ADVANCE => self::CAP_TP_ADVANCE_STAGES,
            self::LEGACY_CAP_COMMENT => self::CAP_TP_MANAGE_COMMENTS,
            self::LEGACY_CAP_REPORT => self::CAP_TP_GENERATE_REPORTS,
            self::LEGACY_CAP_MODEL_MANAGE => self::CAP_TP_MANAGE_MODELS,
            self::LEGACY_CAP_GROUP_MANAGE => self::CAP_TP_MANAGE_GROUPS,
            self::LEGACY_CAP_MAPPER_MANAGE => self::CAP_TP_MANAGE_MAPPINGS,
            self::LEGACY_CAP_SETTINGS_MANAGE => self::CAP_TP_MANAGE_SETTINGS,
            self::LEGACY_CAP_ADMIN_PROCESSES => self::CAP_TP_MANAGE_SETTINGS,
        ];
    }

    public static function has_capability($capability, $user_id = null)
    {
        $user_id = $user_id === null ? get_current_user_id() : (int) $user_id;
        if ($user_id <= 0) {
            return false;
        }
        return user_can($user_id, $capability);
    }

    public static function can_access_obatala($user_id = null) { return self::has_capability(self::CAP_TP_ACCESS, $user_id); }
    public static function can_manage_processes($user_id = null) { return self::has_capability(self::CAP_TP_MANAGE, $user_id); }
    public static function can_advance_stages($user_id = null) { return self::has_capability(self::CAP_TP_ADVANCE_STAGES, $user_id); }
    public static function can_manage_comments($user_id = null) { return self::has_capability(self::CAP_TP_MANAGE_COMMENTS, $user_id); }
    public static function can_generate_reports($user_id = null) { return self::has_capability(self::CAP_TP_GENERATE_REPORTS, $user_id); }
    public static function can_manage_models($user_id = null) { return self::has_capability(self::CAP_TP_MANAGE_MODELS, $user_id); }
    public static function can_manage_groups($user_id = null) { return self::has_capability(self::CAP_TP_MANAGE_GROUPS, $user_id); }
    public static function can_manage_mappings($user_id = null) { return self::has_capability(self::CAP_TP_MANAGE_MAPPINGS, $user_id); }
    public static function can_manage_settings($user_id = null) { return self::has_capability(self::CAP_TP_MANAGE_SETTINGS, $user_id); }
    public static function can_delete_models($user_id = null) { return self::has_capability(self::CAP_TP_DELETE_MODELS, $user_id); }
    public static function can_delete_processes($user_id = null) { return self::has_capability(self::CAP_TP_DELETE_PROCESSES, $user_id); }
    public static function can_execute_exports($user_id = null) { return self::has_capability(self::CAP_TP_EXECUTE_EXPORTS, $user_id); }

    public static function is_process_administrator($user_id = null)
    {
        $user_id = $user_id === null ? get_current_user_id() : (int) $user_id;
        return $user_id > 0 && (
            user_can($user_id, 'manage_options')
            || self::can_manage_settings($user_id)
        );
    }

    /** A group grants visibility over every process in which it participates. */
    public static function can_access_process($process_id, $user_id = null)
    {
        $user_id = $user_id === null ? get_current_user_id() : (int) $user_id;
        if (!self::can_access_obatala($user_id)) {
            return false;
        }
        if (self::is_process_administrator($user_id)) {
            return true;
        }
        $process_sectors = self::get_process_sector_ids($process_id);
        if (empty($process_sectors)) {
            return self::can_manage_processes($user_id);
        }
        return (bool) array_intersect(self::get_user_sector_ids($user_id), $process_sectors);
    }

    /** A user may act only on a stage assigned to one of their groups. */
    public static function can_act_on_stage($process_id, $stage_id = null, $user_id = null)
    {
        $user_id = $user_id === null ? get_current_user_id() : (int) $user_id;
        if (!self::can_advance_stages($user_id) || !self::can_access_process($process_id, $user_id)) {
            return false;
        }
        if (self::is_process_administrator($user_id)) {
            return true;
        }
        $active_stage_id = self::get_active_stage_id($process_id);
        if ($active_stage_id === '') {
            return false;
        }
        if ($stage_id !== null && $stage_id !== '' && (string) $stage_id !== $active_stage_id) {
            return false;
        }
        $stage_sector = self::get_stage_sector_id($process_id, $active_stage_id);
        return $stage_sector !== '' && in_array($stage_sector, self::get_user_sector_ids($user_id), true);
    }

    /** Returns the started stage, or the first configured stage before initialization. */
    public static function get_active_stage_id($process_id)
    {
        $flow_data = self::get_process_flow_data($process_id);
        foreach ($flow_data['nodes'] as $node) {
            if (is_array($node) && ($node['node_status'] ?? '') === 'Started') {
                return (string) ($node['id'] ?? '');
            }
        }

        foreach ($flow_data['nodes'] as $node) {
            if (
                is_array($node)
                && !in_array((string) ($node['id'] ?? ''), ['Start', 'End'], true)
                && ($node['node_status'] ?? '') === 'Finished'
            ) {
                // A process with completed stages and no started stage is no
                // longer actionable (normally it has reached the End node).
                return '';
            }
        }

        foreach (($flow_data['edges'] ?? []) as $edge) {
            if (is_array($edge) && ($edge['source'] ?? '') === 'Start') {
                return (string) ($edge['target'] ?? '');
            }
        }

        return '';
    }

    public static function get_user_sector_ids($user_id)
    {
        return self::normalize_sector_ids(get_user_meta((int) $user_id, 'associated_sector', true));
    }

    public static function get_process_sector_ids($process_id)
    {
        $flow_data = self::get_process_flow_data($process_id);
        $sector_ids = [];
        foreach ($flow_data['nodes'] as $node) {
            if (!is_array($node)) {
                continue;
            }
            $sector = isset($node['sector_obatala']) ? $node['sector_obatala'] : '';
            if ($sector === '' && isset($node['tempSector'])) {
                $sector = $node['tempSector'];
            }
            $sector_ids = array_merge($sector_ids, self::normalize_sector_ids($sector));
        }
        return array_values(array_unique($sector_ids));
    }

    public static function normalize_sector_ids($value)
    {
        if (!is_array($value)) {
            $value = ($value === null || $value === '') ? [] : [$value];
        }
        $normalized = [];
        array_walk_recursive($value, function ($sector_id) use (&$normalized) {
            if (is_scalar($sector_id) && (string) $sector_id !== '') {
                $normalized[] = (string) $sector_id;
            }
        });
        return array_values(array_unique($normalized));
    }

    private static function get_stage_sector_id($process_id, $stage_id = null)
    {
        $flow_data = self::get_process_flow_data($process_id);
        $stage_id = $stage_id === null || $stage_id === ''
            ? self::get_active_stage_id($process_id)
            : $stage_id;
        foreach ($flow_data['nodes'] as $node) {
            if (!is_array($node)) {
                continue;
            }
            if ((string) ($node['id'] ?? '') === (string) $stage_id) {
                return (string) ($node['sector_obatala'] ?? $node['tempSector'] ?? '');
            }
        }

        return '';
    }

    private static function get_process_flow_data($process_id)
    {
        $flow_data = maybe_unserialize(get_post_meta((int) $process_id, 'flowData', true));
        if (is_string($flow_data)) {
            $decoded = json_decode($flow_data, true);
            $flow_data = is_array($decoded) ? $decoded : [];
        }
        return is_array($flow_data) && isset($flow_data['nodes']) && is_array($flow_data['nodes'])
            ? array_merge(['edges' => []], $flow_data)
            : ['nodes' => []];
    }

    private static function caps_map($capabilities)
    {
        return array_fill_keys($capabilities, true);
    }
}
