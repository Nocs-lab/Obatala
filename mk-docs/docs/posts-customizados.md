### Registro de Custom Post Types

Para a gestão de processos no "Obatala", utilizamos o Tainacan para criar e gerenciar tipos de posts personalizados. Para ter a liberdade que queremos, será necessário estender a classe `Repository` do Tainacan. A documentação detalhada dos métodos do repositório pode ser encontrada [aqui](https://tainacan.github.io/tainacan-wiki/#/dev/repository-methods).

### Exemplo de Extensão da Classe Repository do Tainacan

Primeiro, criamos uma nova classe que estende a classe `Repository` do Tainacan para gerenciar os processos curatoriais.

#### `ProcessCollection.php`

```php
<?
    namespace Obatala\Entities;

    use Tainacan\Entities\Collection;
    use Respect\Validation\Validator as v;

    class ProcessCollection extends Collection {
        public static function get_post_type() {
            return 'process_collection';
        }

        protected function _get_map() {
            return array_merge(parent::_get_map(), [
                'nome' => [
                    'map'         => 'post_title',
                    'title'       => __('Nome', 'obatala'),
                    'type'        => 'string',
                    'description' => __('O nome do processo', 'obatala'),
                    'validation'  => v::stringType()->notEmpty(),
                ],
                'descricao' => [
                    'map'         => 'post_content',
                    'title'       => __('Descrição', 'obatala'),
                    'type'        => 'string',
                    'description' => __('Descrição detalhada do processo', 'obatala'),
                ],
                // Adicione mais campos conforme necessário
            ]);
        }
    }
```

#### `ProcessRepository.php`

```php
<?
    namespace Obatala\Repositories;

    use Obatala\Entities\ProcessCollection;
    use Tainacan\Repositories\Repository;

    class ProcessRepository extends Repository {
        public $entities_type = '\Obatala\Entities\ProcessCollection';

        public static function get_instance() {
            static $instance = null;
            if (null === $instance) {
                $instance = new self();
            }
            return $instance;
        }

        protected function _get_map() {
            return ProcessCollection::_get_map();
        }

        public function register_post_type() {
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
                'capabilities'        => $this->get_capabilities(),
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
            register_post_type(ProcessCollection::get_post_type(), $args);
        }
    }
```

#### Registro do Repositório e Custom Post Type

No arquivo principal do plugin, inicialize o repositório e registre o custom post type.

### `obatala.php`

```php
<?php
    if (!defined('ABSPATH')) {
        exit; // Exit if accessed directly
    }

    require_once __DIR__ . '/classes/entities/ProcessCollection.php';
    require_once __DIR__ . '/classes/repositories/ProcessRepository.php';

    add_action('init', function() {
        $processRepository = \Obatala\Repositories\ProcessRepository::get_instance();
        $processRepository->register_post_type();
    });
```

---

### Conclusão

Estendendo a classe `Repository` do Tainacan, você pode criar e gerenciar tipos de post personalizados com as funcionalidades avançadas do Tainacan. Consulte a [documentação do Tainacan](https://tainacan.github.io/tainacan-wiki/#/dev/repository-methods) para mais detalhes sobre os métodos disponíveis e melhores práticas.