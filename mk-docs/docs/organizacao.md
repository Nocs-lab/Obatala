### Estrutura de Arquivos do Plugin "Obatala"

Este documento descreve a estrutura de arquivos do plugin "Obatala", que é utilizado para gerenciar processos curatoriais no WordPress. A estrutura é organizada de forma a separar claramente a lógica de negócios, a interface de administração, os templates e outros componentes necessários para o funcionamento do plugin. Além disso, abordaremos a utilização de namespaces e a nomenclatura de arquivos conforme o padrão PSR-4.

---

#### Estrutura de Arquivos

```
└── 📁Obatala
    └── .gitignore
    └── README.md
    └── archive-process_collection.php
    └── 📁classes
        └── 📁admin
            └── AdminMenu.php
            └── SettingsPage.php
        └── 📁entities
            └── class-process-collection.php
        └── 📁repositories
            └── ProcessRepository.php
    └── composer.json
    └── 📁mk-docs
        └── 📁docs
            └── index.md
            └── interfaces.md
            └── 📁modelagem
                └── 📁classes
                    └── etapa.md
                    └── notificacao.md
                    └── pessoa.md
                    └── processo.md
                    └── setor.md
                └── classes.md
                └── index.md
                └── processos.md
        └── mkdocs.yml
        └── requirements.txt
    └── obatala.php
    └── single-process_collection.php
    └── 📁vendor
        └── autoload.php
        └── 📁composer
            └── ClassLoader.php
            └── LICENSE
            └── autoload_classmap.php
            └── autoload_namespaces.php
            └── autoload_psr4.php
            └── autoload_real.php
            └── autoload_static.php
    └── 📁view
        └── component.js
```

---

#### Descrição dos Arquivos e Diretórios

- **.gitignore**: Arquivo utilizado para especificar quais arquivos e diretórios devem ser ignorados pelo Git.
  
- **README.md**: Arquivo de documentação que fornece uma visão geral do plugin, incluindo instruções de instalação, configuração e uso.

- **archive-process_collection.php**: Template de arquivo para exibição de arquivos de processos.

- **classes/**: Diretório que contém as classes PHP principais do plugin, separadas por funcionalidade.
  - **admin/**: Contém classes relacionadas à interface de administração do plugin.
    - **AdminMenu.php**: Classe responsável por adicionar e gerenciar o menu de administração.
    - **SettingsPage.php**: Classe responsável por gerenciar a página de configurações do plugin.
  - **entities/**: Contém classes que representam entidades do plugin.
    - **class-process-collection.php**: Classe que define a coleção de processos.
  - **repositories/**: Contém classes responsáveis pela interação com o banco de dados.
    - **ProcessRepository.php**: Classe que gerencia a persistência e recuperação de dados de processos.

- **composer.json**: Arquivo de configuração do Composer, usado para gerenciar dependências PHP e autoloading.

- **mk-docs/**: Diretório que contém a documentação do plugin.
  - **docs/**: Diretório que contém os arquivos de documentação.
    - **index.md**: Página inicial da documentação.
    - **interfaces.md**: Documento que descreve as interfaces de usuário do plugin.
    - **modelagem/**: Diretório que contém a documentação da modelagem das classes.
      - **classes/**: Diretório que contém a documentação das classes individuais.
        - **etapa.md**: Documento que descreve a classe Etapa.
        - **notificacao.md**: Documento que descreve a classe Notificação.
        - **pessoa.md**: Documento que descreve a classe Pessoa.
        - **processo.md**: Documento que descreve a classe Processo.
        - **setor.md**: Documento que descreve a classe Setor.
      - **classes.md**: Documento que descreve a estrutura e interações das classes.
      - **index.md**: Índice da seção de modelagem.
      - **processos.md**: Documento que descreve o fluxo dos processos.
  - **mkdocs.yml**: Arquivo de configuração do MkDocs, utilizado para gerar a documentação do plugin.
  - **requirements.txt**: Arquivo que lista as dependências Python necessárias para gerar a documentação.

- **obatala.php**: Arquivo principal do plugin, responsável por inicializar o plugin e carregar suas dependências.

- **single-process_collection.php**: Template de arquivo para exibição de um único processo.

- **vendor/**: Diretório gerenciado pelo Composer que contém as dependências do plugin.
  - **autoload.php**: Script de autoloading gerado pelo Composer.
  - **composer/**: Diretório que contém os arquivos internos do Composer.
    - **ClassLoader.php**: Classe responsável pelo carregamento automático de classes.
    - **LICENSE**: Licença do Composer.
    - **autoload_classmap.php**: Mapa de classes para autoloading.
    - **autoload_namespaces.php**: Mapa de namespaces para autoloading.
    - **autoload_psr4.php**: Mapa de namespaces PSR-4 para autoloading.
    - **autoload_real.php**: Arquivo real de autoloading.
    - **autoload_static.php**: Mapa estático de autoloading.

- **view/**: Diretório que contém arquivos relacionados à interface de usuário.
  - **component.js**: Script JavaScript que gerencia a interação do usuário com a interface.

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
   namespace Obatala\Admin;

   class AdminMenu {
       // Conteúdo da classe
   }
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

### Conclusão

Este documento apresentou uma visão detalhada da estrutura de arquivos do plugin "Obatala" e explicou como usar namespaces e a nomenclatura de arquivos conforme o padrão PSR-4 para organizar o código de forma eficiente e evitar conflitos de nome. Seguir essas práticas ajuda a manter o código limpo, modular e fácil de manter.