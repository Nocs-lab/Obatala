### Registro de Custom Post Types - Obatala

Para a gestão de processos no "Obatala", utilizamos WordPress para criar e gerenciar tipos de posts personalizados (Custom Post Types). Este guia explica como estender os posts personalizados do WordPress para gerenciar processos curatoriais no sistema Obatala.

!!! nota
    Apesar de não extender as classes do tainacan diretamente usaremos nomenclatura similar para que durante o desenvolvimento exercitar e criar familiaridade com o tainacan que será extendido futuramente.
    
### Exemplo de Extensão de Custom Post Types do WordPress

Primeiro, criamos uma nova classe para gerenciar os processos curatoriais, utilizando os posts personalizados do WordPress.

#### `ProcessCollection.php`

```php
<?php
namespace Obatala\Entities;

class ProcessCollection {
    public static function get_post_type() {
        return 'process_obatala';
    }

    public static function register_post_type() {
        $labels = [
            'name'               => __('Processos', 'obatala'),
            'singular_name'      => __('Processo', 'obatala'),
            'add_new'            => __('Adicionar Novo', 'obatala'),
            'add_new_item'       => __('Adicionar Novo Processo', 'obatala'),
            'edit_item'          => __('Editar Processo', 'obatala'),
            'new_item'           => __('Novo Processo', 'obatala'),
            'view_item'          => __('Ver Processo', 'obatala'),
            'view_items'         => __('Ver Processos', 'obatala'),
            'search_items'       => __('Buscar Processos', 'obatala'),
            'not_found'          => __('Nenhum Processo Encontrado', 'obatala'),
            'not_found_in_trash' => __('Nenhum Processo Encontrado na Lixeira', 'obatala'),
            'parent_item_colon'  => __('Processo Pai:', 'obatala'),
            'all_items'          => __('Todos os Processos', 'obatala'),
            'archives'           => __('Arquivos de Processos', 'obatala'),
            'menu_name'          => __('Processos', 'obatala')
        ];

        $args = [
            'labels'              => $labels,
            'hierarchical'        => true,
            'public'              => true,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'publicly_queryable'  => true,
            'exclude_from_search' => true,
            'has_archive'         => true,
            'query_var'           => true,
            'can_export'          => true,
            'rewrite'             => ['slug' => 'processos'],
            'capabilities'        => [
                'edit_post'          => 'edit_process',
                'read_post'          => 'read_process',
                'delete_post'        => 'delete_process',
                'edit_posts'         => 'edit_processes',
                'edit_others_posts'  => 'edit_others_processes',
                'publish_posts'      => 'publish_processes',
                'read_private_posts' => 'read_private_processes'
            ],
            'map_meta_cap'        => true,
            'show_in_rest'        => true,
            'show_in_nav_menus'   => true,
            'supports'            => [
                'title',
                'editor',
                'thumbnail',
                'revisions',
                'page-attributes'
            ]
        ];
        register_post_type(self::get_post_type(), $args);
    }
}
```

### Registro do Custom Post Type

No arquivo principal do plugin, inicialize e registre o custom post type.

#### `obatala.php`

```php
<?php
/**
 * Plugin Name: Obatala
 * Description: Plugin para gerenciar processos curatoriais.
 * Version: 1.0
 * Author: Douglas de Araújo
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

require_once __DIR__ . '/classes/entities/ProcessCollection.php';

add_action('init', function() {
    \Obatala\Entities\ProcessCollection::register_post_type();
});
```

### Campos Personalizados

Para adicionar campos personalizados aos processos, utilizamos a função `register_meta` do WordPress.

#### `ProcessMeta.php`

```php
<?php
namespace Obatala\Entities;

class ProcessMeta {
    public static function register_meta() {
        register_post_meta('process_obatala', 'nome', [
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'string',
            'description'   => __('O nome do processo', 'obatala'),
            'auth_callback' => function() {
                return current_user_can('edit_post');
            }
        ]);

        register_post_meta('process_obatala', 'descricao', [
            'show_in_rest'  => true,
            'single'        => true,
            'type'          => 'string',
            'description'   => __('Descrição detalhada do processo', 'obatala'),
            'auth_callback' => function() {
                return current_user_can('edit_post');
            }
        ]);

        // Adicione mais campos conforme necessário
    }
}
```

### Registro dos Metadados

No arquivo principal do plugin, registre os metadados personalizados.

#### `obatala.php`

```php
<?php
/**
 * Plugin Name: Obatala
 * Description: Plugin para gerenciar processos curatoriais.
 * Version: 1.0
 * Author: Douglas de Araújo
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

require_once __DIR__ . '/classes/entities/ProcessCollection.php';
require_once __DIR__ . '/classes/entities/ProcessMeta.php';

add_action('init', function() {
    \Obatala\Entities\ProcessCollection::register_post_type();
    \Obatala\Entities\ProcessMeta::register_meta();
});
```

### Conclusão

Estendendo os posts personalizados do WordPress, você pode criar e gerenciar processos curatoriais no sistema Obatala. Este guia mostra como registrar um custom post type e adicionar campos personalizados para atender às necessidades específicas do seu projeto. Utilize as funções e métodos fornecidos pelo WordPress para uma implementação flexível e robusta.