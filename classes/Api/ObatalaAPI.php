<?php

namespace {
	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}
}
namespace Obatala\Api {

    use Obatala\Security\Roles;
    use WP_REST_Controller;
    use WP_Error;

    class ObatalaAPI extends WP_REST_Controller
    {
        /**
         * API Namespace
         */
        const NAMESPACE = 'obatala/v1';

        /**
         * Registers the API namespace and other initial settings
         */
        public function register()
        {
            add_action('rest_api_init', [$this, 'register_routes']);
        }

        /**
         * Registers the API routes
         * This method should be implemented in subclasses
         */
        public function register_routes()
        {
            // Specific routes will be registered in the subclasses
        }

        /**
         * Adds a custom route to the API
         *
         * @param string $route
         * @param array $args
         */
        protected function add_route($route, $args)
        {
            register_rest_route(self::NAMESPACE , $route, $args);
        }

        /** Backward-compatible name for routes that only require plugin access. */
        public static function permission_check_edit_posts($request)
        {
            return self::permission_check_access($request);
        }

        public static function permission_check_access($request)
        {
            return self::permission_result(Roles::can_access_obatala());
        }

        /**
         * Permission callback: user must be logged in and able to manage options (admin).
         *
         * @param \WP_REST_Request $request Request object.
         * @return bool True if the user has permission, false otherwise.
         */
        public static function permission_check_manage_options($request)
        {
            return self::permission_result(Roles::can_manage_settings());
        }

        public static function permission_check_process_access($request)
        {
            $process_id = self::request_process_id($request);
            $allowed = $process_id > 0
                ? Roles::can_access_process($process_id)
                : Roles::can_access_obatala();
            return self::permission_result($allowed);
        }

        public static function permission_check_process_manage($request)
        {
            $process_id = self::request_process_id($request);
            $allowed = Roles::can_manage_processes()
                && ($process_id <= 0 || Roles::can_access_process($process_id));
            return self::permission_result($allowed);
        }

        public static function permission_check_process_meta_update($request)
        {
            $manage_result = self::permission_check_process_manage($request);
            if ($manage_result === true) {
                return true;
            }
            return self::permission_check_stage_action($request);
        }

        public static function permission_check_stage_action($request)
        {
            $process_id = self::request_process_id($request);
            $stage_id = method_exists($request, 'get_param')
                ? $request->get_param('node_id')
                : null;
            return self::permission_result(
                $process_id > 0 && Roles::can_act_on_stage($process_id, $stage_id)
            );
        }

        public static function permission_check_comments($request)
        {
            $is_comment_item = method_exists($request, 'get_route')
                && strpos($request->get_route(), '/comment/') !== false;
            $process_id = $is_comment_item ? 0 : self::request_process_id($request);
            if ($is_comment_item && method_exists($request, 'get_param')) {
                $comment = get_comment((int) $request->get_param('id'));
                $process_id = $comment ? (int) $comment->comment_post_ID : 0;
            }
            return self::permission_result(
                Roles::can_manage_comments()
                && $process_id > 0
                && Roles::can_access_process($process_id)
            );
        }

        public static function permission_check_reports($request)
        {
            $process_id = self::request_process_id($request);
            return self::permission_result(
                Roles::can_generate_reports()
                && $process_id > 0
                && Roles::can_access_process($process_id)
            );
        }

        public static function permission_check_stage_document($request)
        {
            $report_result = self::permission_check_reports($request);
            if ($report_result !== true) {
                return $report_result;
            }
            if (method_exists($request, 'get_method') && $request->get_method() === 'GET') {
                return true;
            }
            $process_id = self::request_process_id($request);
            $stage_id = method_exists($request, 'get_param')
                ? $request->get_param('node_id')
                : null;
            return self::permission_result(
                $process_id > 0 && Roles::can_act_on_stage($process_id, $stage_id)
            );
        }

        public static function permission_check_manage_models($request)
        {
            return self::permission_result(Roles::can_manage_models());
        }

        public static function permission_check_manage_groups($request)
        {
            return self::permission_result(Roles::can_manage_groups());
        }

        public static function permission_check_manage_mappings($request)
        {
            return self::permission_result(Roles::can_manage_mappings());
        }

        public static function permission_check_delete_process($request)
        {
            $process_id = self::request_process_id($request);
            return self::permission_result(
                Roles::can_delete_processes()
                && $process_id > 0
                && Roles::can_access_process($process_id)
            );
        }

        public static function permission_check_delete_model($request)
        {
            return self::permission_result(Roles::can_delete_models());
        }

        public static function permission_check_execute_exports($request)
        {
            $process_id = self::request_process_id($request);
            return self::permission_result(
                Roles::can_execute_exports()
                && ($process_id <= 0 || Roles::can_access_process($process_id))
            );
        }

        protected static function permission_result($allowed)
        {
            if ($allowed) {
                return true;
            }
            $authenticated = get_current_user_id() > 0;
            return new WP_Error(
                $authenticated ? 'tainacan_processes_forbidden' : 'tainacan_processes_unauthorized',
                $authenticated
                    ? __('You do not have permission to perform this action.', 'obatala')
                    : __('Authentication is required.', 'obatala'),
                ['status' => $authenticated ? 403 : 401]
            );
        }

        protected static function request_process_id($request)
        {
            if (!method_exists($request, 'get_param')) {
                return 0;
            }
            foreach (['process_id', 'post_id', 'id'] as $parameter) {
                $value = (int) $request->get_param($parameter);
                if ($value > 0) {
                    return $value;
                }
            }
            return 0;
        }
    }
}
