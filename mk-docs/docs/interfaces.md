# Criação de Interfaces no WordPress para Gerenciamento de Processos no Plugin

O desenvolvimento de interfaces de usuário no WordPress para gerenciar processos personalizados envolve várias etapas e técnicas que permitem a integração eficiente e uma boa experiência de usuário. Este documento descreve como criar uma página no WordPress para gerenciar os processos de um plugin, utilizando as funções nativas do WordPress e padrões de desenvolvimento recomendados.

## 1. Estruturação do Plugin

Inicialmente, é essencial estruturar o plugin de maneira organizada. Para o plugin que gerencia processos, a estrutura de diretórios pode incluir:

- `classes/` - Contém as classes PHP para lógica de negócios.
- `admin/` - Armazena arquivos relacionados às páginas de administração.
- `includes/` - Funções auxiliares e definições do plugin.
- `views/` - Arquivos de template para renderizar HTML.
- `assets/` - JavaScript, CSS, e imagens.

## 2. Registro de Custom Post Types

O primeiro passo para a gestão de processos é registrar um custom post type (CPT) específico para os processos. Isso é feito utilizando a função `register_post_type()` do WordPress. Este CPT terá capacidades específicas para controlar quem pode criar, editar ou deletar os processos.

```php
function obatala_register_post_type() {
    $args = [
        'label' => __('Processos', 'obatala'),
        'public' => true,
        'show_ui' => true,
        'capability_type' => 'post',
        'has_archive' => true,
        'supports' => ['title', 'editor', 'comments'],
        'menu_icon' => 'dashicons-admin-tools',
    ];
    register_post_type('obatala_processos', $args);
}
add_action('init', 'obatala_register_post_type');
```

## 3. Criação da Interface de Administração

Para criar uma interface de administração:
- **Adicionar uma página de menu**: Utilize `add_menu_page()` ou `add_submenu_page()` para adicionar uma página no painel administrativo.
- **Renderizar a interface**: Crie funções de callback que renderizam o conteúdo da página utilizando HTML e PHP.

```php
function obatala_add_admin_menu() {
    add_menu_page(
        __('Gerenciar Processos', 'obatala'),
        'Gerenciar Processos',
        'manage_options',
        'obatala_manage_processos',
        'obatala_manage_processos_page',
        'dashicons-admin-tools'
    );
}

function obatala_manage_processos_page() {
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form method="post" action="options.php">
            <?php
            // Adicionar conteúdo da página aqui.
            ?>
        </form>
    </div>
    <?php
}
add_action('admin_menu', 'obatala_add_admin_menu');
```

## 4. Envolvendo AJAX para Interfaces Dinâmicas

Para tornar a interface mais interativa, o WordPress permite o uso de AJAX. Registre os hooks `wp_ajax_` para lidar com as requisições AJAX do lado do servidor.

```php
function obatala_process_ajax_requests() {
    // Verificar nonce e permissões de usuário
    // Processar a requisição AJAX
    wp_send_json_success(['message' => 'Processo atualizado com sucesso!']);
}

add_action('wp_ajax_obatala_update_processo', 'obatala_process_ajax_requests');
```

## 5. Segurança e Validação

É crucial validar e sanitizar todas as entradas para evitar vulnerabilidades de segurança. Utilize funções como `sanitize_text_field()`, `check_admin_referer()`, entre outras, para garantir que a entrada do usuário seja segura.

Para adicionar páginas ao front-end do seu site WordPress através de um plugin, você pode seguir uma abordagem similar à criação de páginas de administração, mas com o foco em interagir com os usuários finais do site. Aqui estão as etapas detalhadas para realizar isso:

## 6. **Criar Templates de Página**

Para as páginas do front-end, você pode criar templates específicos dentro do seu plugin. Esses templates podem ser usados para exibir informações, formulários de submissão, listas de processos, etc.

### Exemplo de um Template PHP:
```php
function obatala_processos_template() {
    if (is_singular('obatala_processos')) {
        include plugin_dir_path(__FILE__) . 'views/processos-template.php';
    }
}
add_filter('template_include', 'obatala_processos_template');
```

Dentro de `processos-template.php`, você pode estruturar o HTML e o PHP como desejar para exibir os dados do processo.

## 7. **Injetar Conteúdo Dinâmico com Shortcodes**

Shortcodes são uma excelente maneira de adicionar conteúdo dinâmico às páginas do WordPress. Você pode criar shortcodes que os usuários podem adicionar em páginas ou posts para mostrar informações dos processos ou outras funcionalidades do plugin.

### Exemplo de um Shortcode:
```php
function obatala_listar_processos_shortcode() {
    ob_start();

    // Aqui você pode consultar os processos e exibi-los como desejar.
    $query = new WP_Query(['post_type' => 'obatala_processos']);
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            echo '<div>' . get_the_title() . '</div>'; // Simplificado para exemplo
        }
    }

    return ob_get_clean();
}
add_shortcode('listar_processos', 'obatala_listar_processos_shortcode');
```

## 8. **Manipular Formulários e Requisições AJAX**

Para interações mais complexas, como formulários de submissão ou ações que requerem atualização de dados sem recarregar a página, use AJAX.

### Exemplo de AJAX no WordPress:
```php
// Enfileirar scripts e declarar variável global para AJAX
function obatala_enqueue_scripts() {
    wp_enqueue_script('obatala-ajax-script', plugin_dir_url(__FILE__) . 'js/obatala-scripts.js', array('jquery'), null, true);
    wp_localize_script('obatala-ajax-script', 'obatalaAjax', array('ajaxurl' => admin_url('admin-ajax.php')));
}
add_action('wp_enqueue_scripts', 'obatala_enqueue_scripts');

// Manipular a requisição AJAX
add_action('wp_ajax_nopriv_submit_processo', 'obatala_handle_submit_processo');
add_action('wp_ajax_submit_processo', 'obatala_handle_submit_processo');

function obatala_handle_submit_processo() {
    // Verificações de segurança, processar dados do formulário
    wp_send_json_success(['message' => 'Processo submetido com sucesso!']);
}
```

## 9. **Permissões e Restrições de Acesso**

Certifique-se de que as páginas e funcionalidades do plugin sejam acessíveis apenas para os usuários com as permissões adequadas. Use funções do WordPress como `current_user_can()` para checar as capacidades do usuário antes de exibir conteúdo sensível ou permitir ações específicas.

Com essas etapas, você pode construir uma interface robusta e segura para o front-end do seu site WordPress, permitindo aos usuários interagir com o plugin de maneira eficaz e segura.