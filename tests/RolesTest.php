<?php

namespace Obatala\Security {
    function get_option($name, $default = false) {
        return $GLOBALS['obatala_test_options'][$name] ?? $default;
    }

    function update_option($name, $value, $autoload = null) {
        $GLOBALS['obatala_test_options'][$name] = $value;
        return true;
    }

    function get_role($name) {
        return $GLOBALS['obatala_test_roles'][$name] ?? null;
    }

    function remove_role($name) {
        unset($GLOBALS['obatala_test_roles'][$name]);
        unset($GLOBALS['wp_roles']->roles[$name], $GLOBALS['wp_roles']->role_names[$name]);
    }

    function __($text, $domain = 'default') {
        return $text;
    }

    function get_users($args = []) {
        $users = array_values($GLOBALS['obatala_test_users'] ?? []);
        if (empty($args['role__in'])) {
            return $users;
        }
        return array_values(array_filter($users, function ($user) use ($args) {
            return (bool) array_intersect($user->roles, $args['role__in']);
        }));
    }

    function get_current_user_id() {
        return (int) ($GLOBALS['obatala_test_current_user_id'] ?? 0);
    }

    function user_can($user_id, $capability) {
        return !empty($GLOBALS['obatala_test_user_caps'][(int) $user_id][$capability]);
    }

    function get_user_meta($user_id, $key, $single = false) {
        return $GLOBALS['obatala_test_user_meta'][(int) $user_id][$key] ?? ($single ? '' : []);
    }

    function get_post_meta($post_id, $key, $single = false) {
        return $GLOBALS['obatala_test_post_meta'][(int) $post_id][$key] ?? ($single ? '' : []);
    }

    function maybe_unserialize($value) {
        return $value;
    }
}

namespace {
    use Obatala\Security\RoleMigration;
    use Obatala\Security\Roles;
    use PHPUnit\Framework\TestCase;

    class ObatalaFakeRole {
        public $capabilities;
        public $add_calls = 0;

        public function __construct($capabilities = []) {
            $this->capabilities = $capabilities;
        }

        public function add_cap($capability) {
            $this->capabilities[$capability] = true;
            $this->add_calls++;
        }

        public function has_cap($capability) {
            return !empty($this->capabilities[$capability]);
        }

        public function remove_cap($capability) {
            unset($this->capabilities[$capability]);
        }
    }

    class ObatalaFakeUser {
        public $roles;
        public $caps;

        public function __construct($roles, $caps = []) {
            $this->roles = $roles;
            $this->caps = $caps;
        }

        public function set_role($role) {
            $this->roles = [$role];
        }

        public function remove_role($role) {
            $this->roles = array_values(array_diff($this->roles, [$role]));
        }

        public function add_role($role) {
            if (!in_array($role, $this->roles, true)) {
                $this->roles[] = $role;
            }
        }

        public function add_cap($capability) {
            $this->caps[$capability] = true;
        }

        public function remove_cap($capability) {
            unset($this->caps[$capability]);
        }
    }

    class RolesTest extends TestCase {
        protected function setUp(): void {
            $GLOBALS['obatala_test_options'] = [];
            $GLOBALS['obatala_test_roles'] = [
                'administrator' => new ObatalaFakeRole([
                    Roles::LEGACY_CAP_ADMIN_PROCESSES => true,
                ]),
                Roles::ROLE_TAINACAN_ADMIN => new ObatalaFakeRole(['tnc_native_admin' => true]),
                Roles::ROLE_TAINACAN_EDITOR => new ObatalaFakeRole(['tnc_native_editor' => true]),
                Roles::ROLE_TAINACAN_AUTHOR => new ObatalaFakeRole(['tnc_native_author' => true]),
                Roles::ROLE_PARTICIPANT => new ObatalaFakeRole(['read' => true]),
                Roles::ROLE_ADMIN => new ObatalaFakeRole([Roles::LEGACY_CAP_ACCESS => true]),
                Roles::ROLE_EDITOR => new ObatalaFakeRole([Roles::LEGACY_CAP_PROCESS_MANAGE => true]),
                Roles::ROLE_AUTHOR => new ObatalaFakeRole([Roles::LEGACY_CAP_REPORT => true]),
                'editor' => new ObatalaFakeRole([
                    Roles::LEGACY_CAP_PROCESS_MANAGE => true,
                    Roles::CAP_TP_MANAGE => true,
                ]),
            ];
            $role_names = array_fill_keys(array_keys($GLOBALS['obatala_test_roles']), 'Test role');
            $role_names[Roles::ROLE_PARTICIPANT] = 'Tainacan Processos — Participante';
            $roles = [];
            foreach ($role_names as $slug => $name) {
                $roles[$slug] = ['name' => $name, 'capabilities' => []];
            }
            $GLOBALS['wp_roles'] = (object) [
                'roles' => $roles,
                'role_names' => $role_names,
                'role_key' => 'wp_user_roles',
            ];
            $GLOBALS['obatala_test_users'] = [];
            $GLOBALS['obatala_test_current_user_id'] = 7;
            $GLOBALS['obatala_test_user_caps'] = [];
            $GLOBALS['obatala_test_user_meta'] = [];
            $GLOBALS['obatala_test_post_meta'] = [];
        }

        public function test_capability_matrix_keeps_tainacan_author_out() {
            $this->assertArrayHasKey(Roles::CAP_TP_MANAGE_MODELS, Roles::all_caps());
            $this->assertArrayNotHasKey(Roles::CAP_TP_MANAGE_MODELS, Roles::editor_caps());
            $this->assertArrayHasKey(Roles::CAP_TP_EXECUTE_EXPORTS, Roles::editor_caps());
            $this->assertArrayHasKey(Roles::CAP_TP_ADVANCE_STAGES, Roles::participant_caps());
            $this->assertArrayNotHasKey(Roles::CAP_TP_MANAGE, Roles::participant_caps());
        }

        public function test_sector_ids_are_normalized_without_duplicates() {
            $this->assertSame(['12', 'group-a', '9'], Roles::normalize_sector_ids([[12, 'group-a'], ['12', 9]]));
        }

        public function test_legacy_capabilities_no_longer_authorize_access() {
            $GLOBALS['obatala_test_user_caps'][7] = [
                Roles::LEGACY_CAP_ACCESS => true,
            ];

            $this->assertFalse(Roles::can_access_obatala(7));
        }

        public function test_stage_action_is_limited_to_the_active_stage_group() {
            $GLOBALS['obatala_test_user_caps'][7] = [
                Roles::CAP_TP_ACCESS => true,
                Roles::CAP_TP_ADVANCE_STAGES => true,
            ];
            $GLOBALS['obatala_test_user_meta'][7]['associated_sector'] = ['group-a'];
            $GLOBALS['obatala_test_post_meta'][10]['flowData'] = [
                'nodes' => [
                    ['id' => 'Start'],
                    ['id' => '1', 'node_status' => 'Started', 'sector_obatala' => 'group-a'],
                    ['id' => '2', 'node_status' => 'Stopped', 'sector_obatala' => 'group-b'],
                    ['id' => 'End'],
                ],
                'edges' => [
                    ['source' => 'Start', 'target' => '1'],
                    ['source' => '1', 'target' => '2'],
                    ['source' => '2', 'target' => 'End'],
                ],
            ];

            $this->assertSame('1', Roles::get_active_stage_id(10));
            $this->assertTrue(Roles::can_act_on_stage(10, '1', 7));
            $this->assertFalse(Roles::can_act_on_stage(10, '2', 7));
        }

        public function test_migration_maps_legacy_roles_and_preserves_native_author() {
            $author = new ObatalaFakeUser([Roles::ROLE_AUTHOR]);
            $editor = new ObatalaFakeUser([Roles::ROLE_EDITOR]);
            $multi_role = new ObatalaFakeUser(['administrator', Roles::ROLE_ADMIN]);
            $direct_cap = new ObatalaFakeUser(['subscriber'], [Roles::LEGACY_CAP_COMMENT => true]);
            $GLOBALS['obatala_test_users'] = [$author, $editor, $multi_role, $direct_cap];

            RoleMigration::migrate();

            $this->assertSame([Roles::ROLE_PARTICIPANT], $author->roles);
            $this->assertSame([Roles::ROLE_TAINACAN_EDITOR], $editor->roles);
            $this->assertSame(['administrator'], $multi_role->roles);
            $this->assertSame(['subscriber', Roles::ROLE_PARTICIPANT], $direct_cap->roles);
            $this->assertArrayNotHasKey(Roles::LEGACY_CAP_COMMENT, $direct_cap->caps);
            $this->assertArrayNotHasKey(Roles::CAP_TP_MANAGE_COMMENTS, $direct_cap->caps);
            $this->assertNull(\Obatala\Security\get_role(Roles::ROLE_ADMIN));
            $this->assertNull(\Obatala\Security\get_role(Roles::ROLE_EDITOR));
            $this->assertNull(\Obatala\Security\get_role(Roles::ROLE_AUTHOR));
            $this->assertFalse($GLOBALS['obatala_test_roles']['editor']->has_cap(Roles::LEGACY_CAP_PROCESS_MANAGE));
            $this->assertFalse($GLOBALS['obatala_test_roles']['editor']->has_cap(Roles::CAP_TP_MANAGE));
            $this->assertFalse(
                $GLOBALS['obatala_test_roles']['administrator']->has_cap(Roles::LEGACY_CAP_ADMIN_PROCESSES)
            );
            $this->assertSame(
                'Tainacan Participant',
                $GLOBALS['wp_roles']->roles[Roles::ROLE_PARTICIPANT]['name']
            );
            $this->assertSame(
                ['tnc_native_author' => true],
                $GLOBALS['obatala_test_roles'][Roles::ROLE_TAINACAN_AUTHOR]->capabilities
            );
            $this->assertSame(RoleMigration::VERSION, $GLOBALS['obatala_test_options'][RoleMigration::OPTION_VERSION]);
        }

        public function test_migration_is_not_reapplied_after_version_is_saved() {
            RoleMigration::maybe_migrate();
            $calls_after_first_run = $GLOBALS['obatala_test_roles'][Roles::ROLE_TAINACAN_EDITOR]->add_calls;

            RoleMigration::maybe_migrate();

            $this->assertSame(
                $calls_after_first_run,
                $GLOBALS['obatala_test_roles'][Roles::ROLE_TAINACAN_EDITOR]->add_calls
            );
        }
    }
}
