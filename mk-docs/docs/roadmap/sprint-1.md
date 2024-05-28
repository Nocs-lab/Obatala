### Roadmap para o Desenvolvimento do Plugin "Obatala"

#### Fase 1: Configuração Inicial
### Objetivo

Configurar o ambiente de desenvolvimento, definir a estrutura de arquivos, implementar custom post types, menus e submenus no painel administrativo, criar templates de arquivo, configurar páginas de administração, registrar e enfileirar estilos e scripts, configurar a internacionalização e localização, e completar a documentação e testes do plugin "Obatala".

### Tarefas Detalhadas

#### Fase 1: Configuração Inicial
   - [x] Configurar o ambiente de desenvolvimento.
   - [x] Instalar o Composer e configurar o autoloading PSR-4.
   - [x] Configurar o repositório Git.
   - [x] Criar o arquivo `.gitignore`.
   - [x] Criar o arquivo `composer.json`.
   - [x] Criar o arquivo `README.md`.

#### Fase 2: Implementação dos Custom Post Types
  - [x] Implementar a classe `ProcessCollection`.
  - [x] Implementar a classe `ProcessStepCollection`.
  - [X] Implementar a classe `AdminMenu`.
  - [x] Configurar os custom post types para aparecerem como submenus.
  - [X] Criar templates de arquivo para exibição dos posts.

#### Fase 3: Configurações e Páginas de Administração
  - [X] Implementar a classe `SettingsPage`.
  - [x] Adicionar a lógica para incluir a página de configurações no menu "Obatala".

#### Fase 4: Estilos e Scripts
  - [ ] Registrar e enfileirar estilos e scripts.
  - [ ] Integrar Gutenberg.

#### Fase 5: Internacionalização e Localização
  - [X] Configurar o carregamento de text domain.
  - [X] Adicionar arquivos de idioma.

#### Fase 6: Documentação e Testes
  - [x] Completar a documentação no diretório `mk-docs`.
  - [ ] Implementar testes unitários e funcionais.
  - [ ] Realizar testes de integração.

---