<?php

namespace Obatala\Api;

use WP_REST_Controller;

class ObatalaAPI extends WP_REST_Controller {
    /**
     * API Namespace
     */
    const NAMESPACE = 'obatala/v1';

    /**
     * Registers the API namespace and other initial settings
     */
    public function register() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Registers the API routes
     * This method should be implemented in subclasses
     */
    public function register_routes() {
        // Specific routes will be registered in the subclasses
    }

    /**
     * Adds a custom route to the API
     *
     * @param string $route
     * @param array $args
     */
    protected function add_route($route, $args) {
        register_rest_route(self::NAMESPACE, $route, $args);
    }
}
