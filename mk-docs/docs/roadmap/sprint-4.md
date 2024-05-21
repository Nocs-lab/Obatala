### Quarta Sprint: Interface de Interação com o Processo

#### Objetivo
Desenvolver uma interface de interação para usuários, permitindo que eles interajam com as etapas dos processos a que estão atribuídos, adicionem comentários e mudem o status das etapas.

### Tarefas Detalhadas

#### Fase 1: Interface de Interação com Etapas

Desenvolver a interface de visualização de etapas atribuídas aos usuários.

1. **Interface de Usuário para Interação com Etapas**
     - [ ] Desenvolver uma interface onde os usuários possam visualizar as etapas a que estão atribuídos.
     - [ ] Incluir informações detalhadas sobre cada etapa (nome, descrição, prazo, status atual).

2. **Ação de Mudança de Status**
     - [ ] Implementar a funcionalidade para que os usuários possam mudar o status das etapas.
     - [ ] Garantir que apenas usuários com permissões adequadas possam alterar o status.

#### Fase 2: Adição de Comentários às Etapas

Adicionar campo de texto para que os usuários possam adicionar comentários e exibir os comentários associados a cada etapa.

1. **Campo para Adicionar Comentários**
     - [ ] Adicionar um campo na interface para que os usuários possam adicionar comentários às etapas.
     - [ ] Garantir que os comentários sejam salvos e exibidos corretamente.

2. **Exibição de Comentários**
     - [ ] Implementar a exibição de comentários associados a cada etapa.
     - [ ] Garantir que os comentários sejam apresentados em uma ordem cronológica.

#### Fase 3: Validação e Segurança

Implementar validação de entradas e controles de permissão para assegurar a segurança da interface.

1. **Validação de Entradas**
     - [ ] Implementar validação para garantir que os dados inseridos pelos usuários sejam válidos.
     - [ ] Proteger a interface contra entradas maliciosas (XSS, SQL Injection).

2. **Permissões e Controle de Acesso**
     - [ ] Assegurar que apenas usuários com permissões apropriadas possam interagir com as etapas e adicionar comentários.
     - [ ] Implementar verificações de permissões em todas as ações críticas (mudança de status, adição de comentários).

---

