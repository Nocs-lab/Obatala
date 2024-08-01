<?php

namespace Obatala\Api;

use WP_REST_Controller;

class ObatalaAPI extends WP_REST_Controller {
    /**
     * Namespace da API
     */
    const NAMESPACE = 'obatala/v1';

    /**
     * Registra o namespace da API e outras configurações iniciais
     */
    public function register() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Registra as rotas da API
     * Este método deve ser implementado nas subclasses
     */
    public function register_routes() {
        // As rotas específicas serão registradas nas subclasses
    }

    /**
     * Adiciona uma rota customizada à API
     *
     * @param string $route
     * @param array $args
     */
    protected function add_route($route, $args) {
        register_rest_route(self::NAMESPACE, $route, $args);
    }
}
