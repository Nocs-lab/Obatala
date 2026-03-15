<?php

namespace {
	if ( ! defined( 'ABSPATH' ) ) {
		exit;
	}
}
namespace Obatala\Api {

    use WP_REST_Controller;

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

        /**
         * Permission callback: user must be logged in and able to edit posts.
         *
         * @param \WP_REST_Request $request Request object.
         * @return bool True if the user has permission, false otherwise.
         */
        public static function permission_check_edit_posts($request)
        {
            return is_user_logged_in() && current_user_can('edit_posts');
        }

        /**
         * Permission callback: user must be logged in and able to manage options (admin).
         *
         * @param \WP_REST_Request $request Request object.
         * @return bool True if the user has permission, false otherwise.
         */
        public static function permission_check_manage_options($request)
        {
            return is_user_logged_in() && current_user_can('manage_options');
        }
    }
}