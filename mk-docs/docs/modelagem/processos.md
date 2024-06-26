---
hide:
    - toc
---
# Visão geral do processo

Este documento descreve a modelagem de um processo como uma entidade dentro do WordPress, esta é a modelagem inicial do processo dentro do sistema e serve como base para ter um entendimento desta entidade, e como modelar ela dentro do sistema, os métodos aqui descritos serão ampliados e trabalhados conforme o desenvolvimento do plugin tomar forma. 

!!! nota    
    Manteremos esta documentação como está por ter sido aceita como a primeira modelagem de um processo válida.

---

### Entidade: Processo

#### Propriedades do Processo:
1. **Nome (Title)**  
      - Identificação única do processo.
   
2. **Data (Date)**
      - Data de criação ou início do processo.
   
3. **Conteúdo (Content)**
      - Descrição detalhada do processo.

4. **Etapas (Steps)**
      - Fases ou passos do processo, incluindo comentários, setores, pessoas, status, itens, coleções e notificações associadas.

5. **Status**
      - Estado atual do processo (ex: Iniciado, Em Progresso, Concluído).

6. **Prazo (Deadline)**
      - Data limite para a conclusão do processo/etapa.

7. **Notificações (Notifications)**
      - Alertas ou avisos relacionados ao processo.

8. **Pessoas (People)**
       - Usuários ou grupos de usuários envolvidos no processo.

9.  **Arquivos (Attachments)**
        - Documentos ou arquivos relacionados ao processo.

---

### Estrutura do Processo

```mermaid
classDiagram
    class Processo{
        +String nome
        +Date data
        +String conteudo
        +List<Etapa> etapas
        +String status
        +Date prazo
        +List<Notificacao> notificacoes
        +List<Arquivo> arquivos
    }

    class Setor {
        +String nome
    }

    class Colecao {
        +String nome
        +TaincanID
        +List Itens
    }

    class Item {
        +String nome
        +TaincanID
    }

    class Etapa {
        +String nome
        +List<Comentario> comentarios
        +List<Setor> setores
        +Date prazo
        +List<Pessoa> pessoas
        +String status
    }

    class Notificacao {
        +String mensagem
        +Date dataEnvio
    }

    class Pessoa {
        +String nome
        +String email
    }

    class Arquivo {
        +String nome
        +String url
        +String autor
        +String etapa
    }

    class Comentario {
        +String nome
        +String url
    }

    Etapa "*" -- "1" Setor : pertence a
    Processo "1" -- "*" Item : interage com
    Processo "1" -- "*" Colecao : interage com
    Colecao "1" -- "*" Item : possui
    Etapa "1" -- "*" Pessoa : envolvido
    Etapa "1" -- "*" Comentario : possui
    Etapa "1" -- "*" Notificacao : dispara
    Etapa "1" -- "*" Arquivo : anexa
    Pessoa "1" -- "*"  Setor: pertence a
    Processo "1" -- "*" Etapa : contém
    Processo "1" -- "*" Notificacao : possui
    Processo "1" -- "*" Arquivo : possui
```

---

### Sequência do Processo

```mermaid
sequenceDiagram
    participant Usuário
    participant Sistema
    participant Notificação
    participant Tainacan

    Usuário->>Sistema: Criar Processo
    Sistema-->>Usuário: Confirmação de Criação
    Usuário->>Sistema: Definir Setores e Etapas
    Sistema-->>Usuário: Confirmação de Definição
    
    loop Progresso do Processo
        Usuário->>Sistema: Atualizar Etapa e Status
        Sistema-->>Notificação: Disparar Notificação
        Notificação-->>Usuário: Receber Notificação
        Usuário->>Sistema: Adicionar Pessoas e Arquivos
        Sistema-->>Usuário: Confirmação de Adição
        Sistema->>Tainacan: Adiciona ou recupera Itens/Coleções
        Tainacan-->>Sistema: Confirmação de Adição
        Usuário->>Sistema: Concluir Etapa
        Sistema-->>Notificação: Disparar Notificação
        Sistema-->>Usuário: Confirmação de Conclusão
    end
    
    Usuário->>Sistema: Concluir Processo
    Sistema-->>Usuário: Confirmação de Conclusão
    Sistema-->>Notificação: Disparar Notificação
    Notificação-->>Usuário: Receber Notificação
```

### Explicação dos Diagramas:

1. **Estrutura do Processo**:
      - **Processo**: Entidade principal que representa o processo com suas várias propriedades e associações.
      - **Setor**: Representa os departamentos envolvidos.
      - **Etapa**: Fases ou passos do processo, incluindo status, setores, pessoas, comentários, e notificações.
      - **Notificação**: Mensagens enviadas durante o processo.
      - **Pessoa**: Usuários ou grupos envolvidos no processo.
      - **Arquivo**: Documentos relacionados ao processo.
      - **Comentário**: Observações e discussões associadas a cada etapa.

2. **Sequência do Processo**:
      - **Usuário** cria um processo.
      - **Sistema** confirma a criação do processo.
      - **Usuário** define os setores e etapas do processo.
      - **Sistema** confirma a definição dos setores e etapas.
      - **Usuário** adiciona pessoas e arquivos ao processo.
      - **Sistema** confirma a adição.
      - Durante o **Progresso do Processo**, o **Usuário** atualiza a etapa e o status, e o **Sistema** dispara notificações.
      - **Usuário** conclui o processo e o **Sistema** confirma a conclusão.
