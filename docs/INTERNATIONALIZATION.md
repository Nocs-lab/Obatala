# Internacionalização (i18n) no Obatala

Este documento explica como trabalhar com traduções no plugin, tanto em **JavaScript (React)** quanto em **PHP**. O texto de referência para tradução é sempre em **inglês**; o domínio do plugin é **`obatala`**.

---

## 1. JavaScript / React (@wordpress/i18n)

### Importar as funções

```javascript
import { __ } from "@wordpress/i18n";           // texto simples
import { __, sprintf } from "@wordpress/i18n";   // quando precisar de sprintf
```

### Regra de ouro

**Todo texto visível ao usuário deve usar `__('Texto em inglês', 'obatala')`.**  
Não use strings soltas em português ou inglês em labels, botões, mensagens, placeholders ou títulos.

---

### Exemplos com base no código atual

#### Texto simples (labels, botões, títulos)

```javascript
// ✅ Correto
<Button>{__('Save', 'obatala')}</Button>
<label>{__('Step name', 'obatala')}</label>
<Tooltip text={__('Remove connection', 'obatala')} />
placeholder={__('Enter the step name', 'obatala')}
title: __('Export JSON', 'obatala')
```

#### Texto com variáveis (sprintf)

Quando a frase contém valores dinâmicos (nomes, IDs, datas), use `sprintf`:

```javascript
// ✅ Correto – mensagem de confirmação com nome do nó
{sprintf(__('Are you sure you want to delete node %s?', 'obatala'), props?.stageName || '')}

// ✅ Correto – confirmação de exclusão de conexão
{sprintf(__('Are you sure you want to delete connection between %s and %s?', 'obatala'), sourceNode, targetNode)}

// ✅ Correto – data formatada
{sprintf(__('Completed on %s', 'obatala'), lastUpdateStage(index).dateFormat)}
```

- O primeiro argumento de `sprintf` é a string traduzível com placeholders `%s`, `%d`, `%1$s`, etc.
- Os argumentos seguintes são os valores que substituem os placeholders.

#### Em objetos (títulos de coluna, opções de menu)

```javascript
// ✅ Correto
controls={[
    { title: __('Edit', 'obatala'), onClick: () => {} },
    { title: __('Delete', 'obatala'), onClick: () => {} },
]}
Header: __('Title', 'obatala')
```

#### Mensagens de erro/sucesso (setNotice, setError)

```javascript
// ✅ Correto
setNotice({ status: 'error', message: __('Error fetching comments.', 'obatala') });
setNotice({ status: 'success', message: __('Comment added successfully.', 'obatala') });
setError(__('No process ID found in the URL.', 'obatala'));
```

#### Fallbacks com ??

```javascript
// ✅ Correto – texto padrão traduzido quando config não existe
label={field.config?.label ?? __("Unknown Title", "obatala")}
placeholder={field.config?.placeholder ?? __("Enter a value...", "obatala")}
```

---

### O que NÃO fazer

```javascript
// ❌ Texto solto (não será traduzido)
<Button>Salvar</Button>
<Tooltip text="Remover conexão" />

// ❌ Misturar idiomas no código
placeholder="Digite o nome da etapa"  // use __('Enter the step name', 'obatala')

// ❌ Esquecer o segundo parâmetro (domínio)
__('Save')  // ❌ sempre use __('Save', 'obatala')
```

---

## 2. PHP

### Funções mais usadas

| Função           | Uso típico |
|------------------|------------|
| `__('text', 'obatala')` | Retorna a string traduzida (para usar em echo, atribuição, etc.) |
| `_x('text', 'contexto', 'obatala')` | Mesmo texto com contextos diferentes (ex.: "Post type general name") |
| `esc_html__('text', 'obatala')` | Traduz e escapa para HTML (evita XSS) |
| `esc_html_e('text', 'obatala')` | Traduz, escapa e imprime (equivalente a echo esc_html__(...)) |

### Exemplos no código atual

```php
// Títulos e labels
__('General Settings', 'obatala')
__('Save Settings', 'obatala')

// Descrições em HTML (sempre escapar)
echo '<p class="description">' . esc_html__('Enter your API key here.', 'obatala') . '</p>';

// Texto que só é impresso
esc_html_e('No process found.', 'obatala');

// Contexto (ex.: labels de post type)
_x('Processes', 'Post type general name', 'obatala');
_x('Process', 'Post type singular name', 'obatala');
```

---

## 3. Fluxo de trabalho com traduções

### 3.1 Atualizar o catálogo de strings (.pot)

Sempre que **adicionar ou alterar** strings traduzíveis:

```bash
npm run i18n:make-pot
```

Isso gera/atualiza `languages/obatala.pot`.

### 3.2 Atualizar os .po (por idioma)

1. Abra `languages/obatala-pt_BR.po` (ou o idioma que estiver usando) em um editor de PO (ex.: Poedit, Loco Translate) ou via WP-CLI.
2. Atualize o .po a partir do .pot (em Poedit: “Atualizar a partir do POT”) para puxar as novas strings.
3. Traduza as novas entradas (em inglês no código = texto fonte; português na tradução).

### 3.3 Gerar .mo e JSON para o JavaScript

O plugin usa scripts que geram os .mo (PHP) e os JSON (React) a partir dos .po:

```bash
npm run i18n:po-to-mo-json
```

Ou, se existir apenas o script de JSON:

```bash
npm run i18n:make-json
```

Os arquivos `languages/obatala-pt_BR-obatala-admin-scripts.json` (e outros idiomas) são carregados pelo WordPress via `wp_set_script_translations()` no `Enqueuer.php`, então as strings usadas com `__('...', 'obatala')` no JS passam a aparecer no idioma do site.

---

## 4. Checklist ao adicionar ou alterar texto

- [ ] Todo texto visível no JS está em `__('Texto em inglês', 'obatala')` ou `sprintf(__('... %s ...', 'obatala'), valor)`?
- [ ] Em PHP, usei `esc_html__` ou `esc_html_e` quando o texto vai para HTML?
- [ ] Rodei `npm run i18n:make-pot` depois de mudar strings?
- [ ] Atualizei o .po do idioma e rodei `npm run i18n:po-to-mo-json` (ou equivalente) para gerar .mo e JSON?

Seguindo isso, o plugin mantém o inglês como fonte e as traduções (ex.: pt_BR) consistentes no admin e no front.
