### Estrutura de Arquivos do Plugin "Obatala"

Este documento descreve a estrutura de arquivos do plugin "Obatala", que é utilizado para gerenciar processos curatoriais no WordPress. A estrutura é organizada de forma a separar claramente a lógica de negócios, a interface de administração, os templates e outros componentes necessários para o funcionamento do plugin. Além disso, abordaremos a utilização de namespaces e a nomenclatura de arquivos conforme o padrão PSR-4.

---

#### Estrutura de Arquivos

```
└── 📁Obatala
    └── 📁.github
        └── 📁workflows
            └── release.yml
            └── version.yml
    └── 📁build
        └── index.asset.php
        └── index.js
        └── index.js.map
        └── style-index-rtl.css
        └── style-index.css
        └── style-index.css.map
    └── 📁classes
        └── 📁Admin
            └── AdminMenu.php
            └── Enqueuer.php
            └── SettingsPage.php
        └── 📁Api
            └── CustomPostTypeApi.php
            └── ObatalaAPI.php
            └── ProcessApi.php
            └── ProcessTypeApi.php
            └── SectorApi.php
        └── 📁Entities
            └── Process.php
            └── ProcessType.php
            └── Sector.php
        └── 📁Metadata
            └── ProcessMetadataManager.php
    └── 📁css
        └── react-flow.css
        └── style.css
    └── 📁developer
        └── create-zip.js
        └── update-plugin-version.js
    └── 📁languages
        └── obatala-pt_BR.mo
        └── obatala-pt_BR.po
        └── obatala.pot
    └── 📁mk-docs
        └── 📁docs
            └── 📁metadados
                └── implementacao.md
                └── metadados.md
            └── 📁modelagem
                └── 📁classes
                    └── etapa.md
                    └── notificacao.md
                    └── pessoa.md
                    └── processo.md
                    └── setor.md
                └── index.md
                └── processos.md
            └── 📁roadmap
                └── sprint-1.md
                └── sprint-2.md
                └── sprint-3.md
                └── sprint-4.md
                └── sprint-5.md
                └── sprint-6.md
                └── stories.md
            └── 📁stylesheets
                └── extra.css
            └── 📁tutoriais
                └── guia-dev.md
            └── gutenberg.md
            └── index.md
            └── organizacao.md
            └── posts-customizados.md
        └── mkdocs.yml
        └── requirements.txt
    └── 📁src
        └── 📁admin
            └── 📁api
                └── apiRequests.js
            └── 📁components
                └── 📁FlowEditor
                    └── 📁components
                        └── 📁dragables
                            └── DragAndDropList.js
                            └── SortableField.js
                        └── 📁inputControls
                            └── DatePickerControls.js
                            └── FileUploadControls.js
                            └── LabelWithIcon.js
                            └── NumberFieldControls.js
                            └── SelectRadioControls.js
                            └── TainacanSearch.js
                            └── TextFieldControls.js
                        └── 📁reactFlow
                            └── CustomEdge.js
                            └── FlowButtons.js
                            └── NodeContent.js
                            └── NodeHandle.js
                        └── FieldComponents.js
                        └── SlidingDrawer.js
                    └── 📁context
                        └── DrawerContext.js
                        └── FlowContext.js
                    └── 📁helpers
                        └── dataValidator.js
                    └── mockdata.js
                    └── ProcessFlow.js
                └── 📁ProcessManager
                    └── CommentForm.js
                    └── MetaFieldInputs.js
                    └── MetroNavigation.js
                    └── ProcessCreator.js
                    └── ProcessStage.js
                └── 📁ProcessTypeManager
                    └── ProcessTypeForm.js
                    └── ProcessTypeList.js
                └── 📁SectorManager
                    └── SectorCreator.js
                    └── SectorList.js
                └── 📁Tainacan
                    └── 📁TainacanSearch
                        └── CollectionCard.js
                        └── ItemCard.js
                    └── TainacanSearch.js
                └── ProcessManager.js
                └── ProcessModelEditor.js
                └── ProcessTypeManager.js
                └── ProcessViewer.js
                └── SectorManager.js
            └── 📁redux
                └── reducer.js
            └── App.js
        └── index.js
    └── 📁vendor
        └── 📁composer
            └── autoload_classmap.php
            └── autoload_namespaces.php
            └── autoload_psr4.php
            └── autoload_real.php
            └── autoload_static.php
            └── ClassLoader.php
            └── installed.json
            └── installed.php
            └── InstalledVersions.php
            └── LICENSE
        └── autoload.php
    └── 📁view
        └── archive-obatala_steps.php
        └── archive-process_obatala.php
        └── single-obatala_steps.php
        └── single-process_obatala.php
    └── .gitignore
    └── composer.json
    └── obatala.php
    └── package-lock.json
    └── package.json
    └── README.md
```

---

#### Descrição dos Arquivos e Diretórios

### 📁 .github/workflows
Contém os workflows do GitHub Actions para automação de tarefas no projeto.

- **release.yml**: Configura a automação para criar uma nova versão.
- **version.yml**: Gerencia o versionamento do projeto.

### 📁 classes

#### 📁 Admin
Classes para gerenciamento administrativo do plugin.

- **AdminMenu.php**: Gerencia o menu administrativo do WordPress.
- **Enqueuer.php**: Controla a adição de scripts e estilos no painel.
- **SettingsPage.php**: Define a página de configurações do plugin.

#### 📁 Api
Classes de API para interagir com diferentes endpoints.

- **CustomPostTypeApi.php**: API para o registro de tipos de post personalizados.
- **ObatalaAPI.php**: Gerencia as integrações de API principais.
- **ProcessApi.php**, **ProcessTypeApi.php**, **SectorApi.php**: APIs para operações específicas de processos, tipos de processo e setores.

#### 📁 Entities
Define entidades principais.

- **Process.php**: Define a entidade `Processo`.
- **ProcessType.php**: Define a entidade `Tipo de Processo`.
- **Sector.php**: Define a entidade `Setor`.

#### 📁 Metadata

- **ProcessMetadataManager.php**: Gerencia metadados de processos.

- **create-zip.js**: Cria um arquivo ZIP do plugin para distribuição.
- **update-plugin-version.js**: Atualiza a versão do plugin.

### 📁 src

#### 📁 admin

##### 📁 api
- **apiRequests.js**: Funções para chamadas de API.

##### 📁 components

###### 📁 FlowEditor
Editor de fluxo para o projeto.

- **dragables**: Componentes para arrastar e soltar, como `DragAndDropList.js`.
- **inputControls**: Controles personalizados de input, como `DatePickerControls.js`.
- **reactFlow**: Componentes de fluxo, incluindo `CustomEdge.js`, `NodeContent.js`.

###### 📁 ProcessManager
Gerenciamento de processos.

- Inclui `CommentForm.js`, `ProcessCreator.js`, entre outros.

###### 📁 ProcessTypeManager
Gerenciamento de tipos de processo.

- **ProcessTypeForm.js**, **ProcessTypeList.js**: Formulários e listas.

###### 📁 SectorManager
Gerenciamento de setores.

- **SectorCreator.js**, **SectorList.js**.

###### 📁 Tainacan
Componentes de integração com o Tainacan.

- **TainacanSearch**: Componente de busca Tainacan.
- **CollectionCard.js** e **ItemCard.js**: Cards para coleções e itens.

#### 📁 redux
- **reducer.js**: Gerenciamento do estado do Redux.

- **App.js**: Ponto de entrada do aplicativo.

### Arquivos Raiz
- **.gitignore**: Define arquivos ignorados pelo Git.
- **composer.json**: Configuração do Composer.
- **obatala.php**: Arquivo principal do plugin.
- **package-lock.json** e **package.json**: Configuração de dependências NPM.
- **README.md**: Documentação inicial do projeto.

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