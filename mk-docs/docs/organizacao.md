### Estrutura de Arquivos do Plugin "Obatala"

Este documento descreve a estrutura de arquivos do plugin "Obatala", que é utilizado para gerenciar processos curatoriais no WordPress. A estrutura é organizada de forma a separar claramente a lógica de negócios, a interface de administração, os templates e outros componentes necessários para o funcionamento do plugin. Além disso, abordaremos a utilização de namespaces e a nomenclatura de arquivos conforme o padrão PSR-4.

---

#### Estrutura de Arquivos

```
└── 📁Obatala
    └── 📁.github
        └── 📁workflows
            ├── notify.yml
            ├── release&update.yml
            ├── version.yml
    └── 📁build
        ├── index-rtl.css
        ├── index.asset.php
        ├── index.css
        ├── index.css.map
        ├── index.js
        ├── index.js.map
        ├── style-index-rtl.css
        ├── style-index.css
        ├── style-index.css.map
    └── 📁classes
        └── 📁Admin
            ├── AdminMenu.php
            ├── Enqueuer.php
            ├── SettingsPage.php
        └── 📁Api
            ├── CustomPostTypeApi.php
            ├── ObatalaAPI.php
            ├── ExporterApi.php
            ├── ProcessApi.php
            ├── ProcessTypeApi.php
            ├── SectorApi.php
        └── 📁Database
            ├── ProcessNumberSchema.php
        └── 📁Report
            ├── ProcessReportPdf.php
            ├── StageDocumentPdf.php
        └── 📁Security
            ├── Roles.php
        └── 📁Services
            ├── ProcessNumberService.php
            ├── TainacanExportService.php
            ├── TainacanMappingService.php
        └── 📁Entities
            ├── Process.php
            ├── ProcessType.php
            ├── Sector.php
        └── 📁Metadata
            ├── ProcessMetadataManager.php
    └── 📁css
        ├── react-flow.css
        ├── style.css
    └── 📁developer
        ├── create-zip.js
        ├── i18n-make-json.js
        ├── po-to-mo-and-json.mjs
        ├── update-plugin-version.js
        ├── updatePlugin.py
    └── 📁images
        ├── obatala.svg
        ├── tainacan.svg
    └── 📁languages
        ├── obatala-pt_BR.mo
        ├── obatala-pt_BR.po
        ├── obatala-pt_BR-*.json
        ├── obatala.pot
    └── 📁mk-docs
        └── 📁docs
            └── 📁metadados
                ├── documento-etapa.md
                ├── implementacao.md
                ├── metadados.md
            ├── instalacao.md
            └── 📁modelagem
                └── 📁classes
                    ├── etapa.md
                    ├── notificacao.md
                    ├── pessoa.md
                    ├── processo.md
                    ├── setor.md
                ├── index.md
                ├── processos.md
            └── 📁stylesheets
                ├── extra.css
            └── 📁tutoriais
                ├── guia-dev.md
            ├── gutenberg.md
            ├── index.md
            ├── organizacao.md
            ├── posts-customizados.md
        ├── mkdocs.yml
        ├── requirements.txt
    └── 📁src
        └── 📁admin
            └── 📁api
                ├── apiRequests.js
            └── 📁components
                └── 📁FlowEditor
                    └── 📁components
                        └── 📁dragables
                            ├── DragAndDropList.js
                            ├── SortableField.js
                        └── 📁inputControls
                            ├── DatePickerControls.js
                            ├── FileUploadControls.js
                            ├── LabelWithIcon.js
                            ├── NumberFieldControls.js
                            ├── SelectRadioControls.js
                            ├── TainacanSearch.js
                            ├── TextFieldControls.js
                        └── 📁reactFlow
                            ├── CustomEdge.js
                            ├── EndNode.js
                            ├── FlowButtons.js
                            ├── FlowImageExporter.js
                            ├── NodeConditional.js
                            ├── NodeContent.js
                            ├── NodeHandle.js
                            ├── StartNode.js
                        ├── FieldComponents.js
                        ├── SlidingDrawer.js
                    └── 📁context
                        ├── DrawerContext.js
                        ├── FlowContext.js
                    └── 📁helpers
                        ├── dataValidator.js
                    ├── mockdata.js
                    ├── ProcessFlow.js
                └── 📁ProcessManager
                    ├── CommentForm.js
                    ├── HistoryViewer.js
                    ├── MetaFieldDisplay.js
                    ├── MetaFieldInputs.js
                    ├── MetroNavigation.js
                    ├── ProcessCreator.js
                    ├── ProcessFilters.js
                    ├── ProcessHeader.js
                    ├── ProcessList.js
                    ├── ProcessStage.js
                    ├── ProcessUserLog.js
                └── 📁ProcessTypeManager
                    ├── ProcessTypeFilters.js
                    ├── ProcessTypeForm.js
                    ├── ProcessTypeList.js
                └── 📁SectorManager
                    └── 📁UserManager
                        ├── UserManager.js
                        ├── UserSelect.js
                    ├── SectorCreator.js
                    ├── SectorDetailsPage.js
                    ├── SectorFilters.js
                    ├── SectorList.js
                └── 📁Tainacan
                    └── 📁TainacanSearch
                        ├── CollectionCard.js
                        ├── ItemCard.js
                    ├── TainacanSearch.js
                ├── BrandFooter.js
                ├── BrandHeader.js
                ├── MappersManager.js
                ├── Dashboard.js
                ├── ProcessManager.js
                ├── ProcessModelEditor.js
                ├── ProcessTypeManager.js
                ├── ProcessViewer.js
                ├── SectorManager.js
            └── 📁redux
                ├── reducer.js
            ├── App.js
        ├── index.js
    └── 📁vendor
        └── 📁composer
            ├── autoload_classmap.php
            ├── autoload_namespaces.php
            ├── autoload_psr4.php
            ├── autoload_real.php
            ├── autoload_static.php
            ├── ClassLoader.php
            ├── installed.json
            ├── installed.php
            ├── InstalledVersions.php
            ├── LICENSE
        ├── autoload.php
    └── 📁view
        ├── archive-obatala_steps.php
        ├── archive-process_obatala.php
        ├── single-obatala_steps.php
        ├── single-process_obatala.php
    ├── .gitignore
    ├── composer.json
    ├── obatala.php
    ├── package-lock.json
    ├── package.json
    └── README.md
```

---

## 📂 Descrição dos Arquivos e Diretórios

### 📁 `.github/workflows/`
Diretório que contém os **workflows automatizados** do GitHub Actions utilizados para CI/CD (Integração Contínua e Entrega Contínua):

- `release&update.yml`: Automatiza a criação de releases e atualizações do plugin.
- `version.yml`: Gerencia o versionamento semântico do projeto.
- `notify.yml`: Envia notificações após eventos como push ou release.

---

### 📁 `classes/`
Código PHP backend estruturado em namespaces, seguindo o padrão PSR-4.

#### 📁 `Admin/`
Responsável pelas interfaces administrativas do WordPress:

- `AdminMenu.php`: Cria e organiza os menus no painel.
- `Enqueuer.php`: Carrega scripts e estilos na interface administrativa.
- `SettingsPage.php`: Gera a página de configurações do plugin.

#### 📁 `Api/`
Controladores REST para comunicação entre o frontend e o backend:

- `ObatalaAPI.php`: Controlador base que agrupa as rotas da API e define callbacks de permissão (`permission_check_edit_posts`, `permission_check_manage_options`). Todas as rotas exigem usuário autenticado com capacidade `edit_posts`.
- `CustomPostTypeApi.php`: Registro e definição de custom post types.
- `ProcessApi.php`, `ProcessTypeApi.php`, `SectorApi.php`, `ExporterApi.php`: Rotas específicas para cada domínio funcional.

#### 📁 `Entities/`
Representação orientada a objetos das entidades de domínio:

- `Process.php`: Entidade `Processo`, incluindo suas regras e estrutura.
- `ProcessType.php`: Representa o `Tipo de Processo`.
- `Sector.php`: Representa o `Setor` relacionado ao processo.

#### 📁 `Metadata/`
Gerenciadores de metadados dinâmicos:

- `ProcessMetadataManager.php`: Criação, leitura e atualização de metadados dos processos.

---

### 📁 `src/`
Código-fonte do frontend, construído em **React.js** com uso de Redux.

#### 📁 `admin/`

##### 📁 `api/`
- `apiRequests.js`: Funções para realizar requisições assíncronas à API PHP.

##### 📁 `components/`

###### 📁 `FlowEditor/`
Editor visual de fluxos curatoriais:

- `components/dragables/`: Lista de componentes com suporte a drag-and-drop.
  - Ex: `DragAndDropList.js`, `SortableField.js`.
- `components/inputControls/`: Inputs customizados (datas, upload, rádio, **StageDocumentControls** para o tipo `stage_document`, etc.).
  - Ex: `DatePickerControls.js`, `FileUploadControls.js`, `TainacanSearch.js`.
- `components/reactFlow/`: Nós e conexões para renderização do fluxo.
  - Ex: `CustomEdge.js`, `StartNode.js`, `NodeContent.js`.

###### 📁 `ProcessManager/`
Interface de gerenciamento dos processos:

- Componentes como `ProcessCreator.js`, `ProcessList.js`, `ProcessStage.js`, `CommentForm.js`.

###### 📁 `ProcessTypeManager/`
Gerencia os tipos de processos disponíveis:

- Ex: `ProcessTypeForm.js`, `ProcessTypeList.js`, `ProcessTypeFilters.js`.

###### 📁 `SectorManager/`
Administração de setores organizacionais:

- Componentes como `SectorCreator.js`, `SectorFilters.js`, `SectorList.js`.

- `UserManager/`: Subdiretório para gerenciar usuários por setor.
  - Ex: `UserManager.js`, `UserSelect.js`.

###### 📁 `Tainacan/`
Integração com o sistema de repositório digital **Tainacan**:

- `TainacanSearch.js`: Componente de busca.
- `TainacanSearch/`: Componentes de visualização como `CollectionCard.js`, `ItemCard.js`.

##### 📁 `context/`
Contextos globais para gerenciamento de estado com React Context API:

- `DrawerContext.js`: Estado do painel lateral (drawer).
- `FlowContext.js`: Estado do fluxo em edição.

##### 📁 `helpers/`
Funções auxiliares para validação e manipulação de dados:

- `dataValidator.js`

##### 📁 `redux/`
Gerenciamento centralizado de estado:

- `reducer.js`: Redutor principal do Redux.

##### Outros Arquivos
- `App.js`: Arquivo principal da aplicação React.
- `index.js`: Ponto de entrada da aplicação.

---

### 📁 `view/`
Templates PHP utilizados pelo WordPress para exibir os conteúdos dos custom post types:

- `archive-*.php`: Templates de listagem.
- `single-*.php`: Templates de exibição individual.

---

### 📁 `developer/`
Scripts utilitários usados em automações de desenvolvimento:

- `create-zip.js`: Gera o arquivo `.zip` do plugin para distribuição.
- `i18n-make-json.js`: Executa `wp i18n make-json` com mapa de `src/` para `build/index.js`, gerando JSON de traduções do frontend React. Gera `i18n-map.json` (em .gitignore).
- `update-plugin-version.js`: Atualiza a versão automaticamente.
- `updatePlugin.py`: Script auxiliar para automações diversas em Python.

---

### 📁 `languages/`
Arquivos de tradução do plugin (internacionalização):

- `obatala.pot`: Template de strings (PHP + JS).
- `obatala-pt_BR.po`: Traduções em português brasileiro.
- `obatala-pt_BR.mo`: Compilado para PHP.
- `obatala-pt_BR-obatala-admin-scripts.json`: Traduções JS (handle `obatala-admin-scripts`), geradas por `wp i18n make-json` ou `developer/po-to-mo-and-json.mjs`.

---

### 📁 `css/`
Estilos adicionais:

- `react-flow.css`: Estilo do editor de fluxo.
- `style.css`: Estilo global do plugin.

---

### 📁 `mk-docs/`
Estrutura para a documentação técnica do projeto usando MkDocs:

- `docs/`: Documentação dividida por temas como modelagem, metadados e tutoriais.
- `mkdocs.yml`: Configuração do MkDocs.
- `requirements.txt`: Dependências Python necessárias para gerar a doc.

---

### 📁 `classes/Report/`
Geração de PDF com Dompdf:

- `ProcessReportPdf.php`: relatório consolidado do processo (lista de processos).
- `StageDocumentPdf.php`: PDF de um campo `stage_document` em uma etapa.

Ambas exigem `composer install` (pacote `dompdf/dompdf`).

### 📁 `classes/Database/`
Schema de tabelas customizadas (via `dbDelta`):

- `ProcessNumberSchema.php`: tabelas `{prefix}obatala_process_sequence` e `{prefix}obatala_process_numbers` para sequencial anual atômico, unicidade e índice de busca por `numero_processo`.

### 📁 `classes/Services/`
Lógica de negócio reutilizável:

- `ProcessNumberService.php`: geração do número `AAAA-NNNNN-DV`, cálculo do DV, backfill de processos antigos e busca por número.
- `TainacanMappingService.php`, `TainacanExportService.php`: integração com exportação Tainacan.

### 📁 `tests/`
Testes unitários (sem bootstrap WordPress completo para regras puras):

- `ProcessNumberServiceTest.php` (PHPUnit)
- `run-process-number-tests.php` (runner standalone: `php tests/run-process-number-tests.php`)

### 📁 `classes/Security/`
- `Roles.php`: papéis Obatalá (`obatala_administrator`, `obatala_editor`, `obatala_author`) e capabilities (`obatala_manage_processes`, `obatala_report_generate`, etc.).

### 📁 `vendor/`
Dependências instaladas via **Composer** (autoloader PSR-4 e Dompdf). A pasta está no `.gitignore` e **não** vem no clone Git — execute `composer install` após copiar o plugin. Sem `vendor/`, o `obatala.php` não carrega.

---

### 📁 Arquivos na Raiz

- `.gitignore`: Arquivos/pastas ignorados pelo Git (`vendor/`, `node_modules/`, artefatos de `build/`).
- `obatala.php`: Arquivo principal do plugin; carrega `vendor/autoload.php` e inicializa o singleton `Nocs_ObatalaPlugin`.
- `composer.json`: Dependências (`dompdf/dompdf`), autoload PSR-4 do namespace `Obatala\` e script `composer test` (PHPUnit).
- `phpunit.xml`: Configuração de testes unitários.
- `package.json` & `package-lock.json`: Dependências e scripts de build JS.
- `README.md`: Documentação inicial do repositório.

---

### Utilização de Namespaces e Nomenclatura de Arquivos

#### Padrão PSR-4

O padrão PSR-4 é uma recomendação de autoloading para interoperabilidade de código PHP. Ele especifica uma maneira de mapear namespaces de classes diretamente para a estrutura de diretórios, facilitando a organização e o carregamento automático de classes.

#### Namespaces

Namespaces são uma maneira de encapsular itens (como classes, interfaces e funções) para evitar conflitos de nome e organizar o código de forma hierárquica. No PSR-4, os namespaces são mapeados para diretórios específicos.

#### Nomenclatura de Arquivos

- **Estrutura do Namespace**: O namespace de uma classe deve corresponder ao caminho do diretório a partir do diretório base especificado no `composer.json`.
- **Nomes de Arquivos**: O nome do arquivo deve corresponder exatamente ao nome da classe, incluindo maiúsculas e minúsculas, e ter a extensão `.php`.

#### Exemplo

Para uma classe `AdminMenu` localizada em `classes/admin/AdminMenu.php`:

1. **Namespace**: O namespace pode ser `Obatala\Admin`.
2. **Declaração da Classe**:
   ```php
   <?php
    namespace Obatala\Admin;

    class AdminMenu {
        // Conteúdo da classe
    }
   ?>
   ```

3. **Configuração no `composer.json`**:
   ```json
   {
       "autoload": {
           "psr-4": {
               "Obatala\\": "classes/"
           }
       }
   }
   ```

Com essa configuração, o Composer pode carregar automaticamente a classe `AdminMenu` a partir do arquivo `classes/admin/AdminMenu.php`.

---

## Conclusão

Este documento apresentou uma visão detalhada da estrutura de arquivos do plugin "Obatala" e explicou como usar namespaces e a nomenclatura de arquivos conforme o padrão PSR-4 para organizar o código de forma eficiente e evitar conflitos de nome. Seguir essas práticas ajuda a manter o código limpo, modular e fácil de manter.