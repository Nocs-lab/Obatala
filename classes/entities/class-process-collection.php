<?php

namespace Obatala;

use Tainacan\Entities;
use Tainacan\Entities\Collection;

defined('ABSPATH') or die('No script kiddies please!');

class ProcessCollection extends Collection {

    /**
     * {@inheritDoc}
     * @see \Tainacan\Entities\Entity::post_type
     * @var string
     */
    static $post_type = 'tainacan-process';

    /**
     * {@inheritDoc}
     * @see \Tainacan\Entities\Entity::repository
     * @var string
     */
    protected $repository = 'Processes';

    public function __construct($attributes = []) {
        parent::__construct($attributes);
        $this->init();
    }

    private function init() {
        // Initialize any specific settings for process collections
        // For example, setting default metadata, or custom behaviors
        $this->set_default_order('name');
        $this->set_default_orderby('ASC');
        $this->set_default_view_mode('cards');
    }

    /**
     * Specific method to handle curatorial process actions
     */
    public function handle_curatorial_process() {
        // Method implementation for handling specific curatorial process actions
    }

    // You can add more methods specific to the curatorial processes
}

// This would also include registering the new post type and setting labels similar to how it's done in the Collections class
