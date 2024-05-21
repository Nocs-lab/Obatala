### User Stories para o Sistema de Gestão de Processos

#### Sprint 1: Configuração Inicial e Estrutura Básica

**Como desenvolvedor, quero configurar o ambiente de desenvolvimento para que o plugin possa ser desenvolvido de forma organizada e eficiente.**

**Critérios de Aceitação:**  

  - Ambiente de desenvolvimento configurado.
  - Composer instalado e autoloading PSR-4 configurado.
  - Repositório Git configurado com arquivo `.gitignore`.
  - Arquivo `composer.json` criado.
  - Arquivo `README.md` criado.

---

#### Sprint 2: Criação de Interfaces para Gerenciamento de Etapas e Processos

**Como administrador, quero criar e gerenciar processos e etapas através do painel administrativo do WordPress, com a funcionalidade de adicionar metadados dinâmicos.**

**Critérios de Aceitação:**  

  - Interface administrativa para a criação e edição de processos e etapas desenvolvida.
  - Campos de formulário para título, descrição, prazo e outros detalhes relevantes adicionados.
  - Interface para criação e gerenciamento de metadados dinâmicos implementada.
  - Campos de formulário dinâmicos renderizados e validados corretamente.
  - Metadados associados aos custom post types `process_obatala` e `step_obatala`.

---

#### Sprint 3: Gestão de Setores e Permissões de Usuários

**Como administrador, quero gerenciar setores e associar usuários a setores específicos, permitindo a atribuição de setores a etapas de processos.**

**Critérios de Aceitação:**  

  - Estrutura de dados para representar setores definida.
  - Interface administrativa para criação e edição de setores desenvolvida.
  - Funcionalidade para adicionar e remover usuários de setores implementada.
  - Permissões específicas para usuários baseadas nos setores definidas e aplicadas.
  - Setores associados a etapas de processos e lógica de interação entre setores e etapas desenvolvida.

---

#### Sprint 4: Interface de Interação com o Processo

**Como usuário, quero interagir com as etapas dos processos a que estou atribuído, adicionando comentários e mudando o status das etapas.**

**Critérios de Aceitação:**  

  - Interface onde os usuários possam visualizar as etapas a que estão atribuídos desenvolvida.
  - Funcionalidade para mudar o status das etapas implementada.
  - Campo de texto para adicionar comentários às etapas adicionado.
  - Comentários exibidos de forma cronológica.
  - Validação de entradas implementada.
  - Controles de permissão assegurando que apenas usuários autorizados possam interagir com as etapas e adicionar comentários.

---

#### Sprint 5: Implementação de Notificações

**Como usuário, quero receber notificações sempre que o status de um processo mudar, tanto via email quanto na interface de administração.**

**Critérios de Aceitação:**  

  - Estrutura de dados para armazenar notificações definida.
  - Sistema de notificações para enviar emails e exibir notificações na interface de administração configurado.
  - Gatilhos que detectem mudanças de status nos processos e acionem notificações implementados.
  - Conteúdo padrão para notificações de email e na interface de administração definido.
  - Função para enviar emails aos usuários envolvidos implementada.
  - Interface para exibir notificações na interface de administração desenvolvida.
  - Funcionalidade para marcar notificações como lidas implementada.

---

#### Sprint 6: Integração com Tainacan para Gerenciamento de Itens e Coleções

**Como administrador, quero integrar itens e coleções do Tainacan aos processos, permitindo a verificação do histórico dos itens e fornecendo uma interface para adição ou edição desses itens.**

**Critérios de Aceitação:**  

  - Plugin Tainacan instalado e ativo.
  - Dependências e configurações necessárias para integração com o Tainacan adicionadas.
  - Estrutura de dados para armazenar referências a itens e coleções do Tainacan definida.
  - Interface que permita anexar itens e coleções do Tainacan aos processos desenvolvida.
  - Funcionalidade para exibir o histórico dos itens anexados implementada.
  - Links ou botões para adição/edição de itens do Tainacan na interface de processos adicionados.
  - Lógica para sincronizar alterações feitas nos itens do Tainacan com os processos implementada.
