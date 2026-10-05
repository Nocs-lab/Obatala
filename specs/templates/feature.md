# Nome da funcionalidade

## Metadados

- **Status:** Rascunho | Em revisão | Aprovada | Em implementação | Concluída
- **Responsável:**
- **Data:** AAAA-MM-DD
- **Issue/PR:**
- **Versão alvo:**

## Contexto e problema

Descreva o comportamento atual, quem é afetado e por que a mudança é necessária.
Inclua exemplos ou referências quando ajudarem a eliminar ambiguidades.

## Objetivo

Descreva o resultado observável que esta funcionalidade deve produzir.

## Fora do escopo

- Liste o que esta entrega não implementará.
- Registre melhorias relacionadas que devem permanecer para trabalhos futuros.

## Perfis e permissões

| Perfil/ator | Pode visualizar | Pode executar | Capability necessária |
| --- | --- | --- | --- |
|  |  |  |  |

## Comportamento funcional

### Fluxo principal

1. Dado que ...
2. Quando ...
3. Então ...

### Estados e variações

- Carregamento:
- Sem dados:
- Sucesso:
- Erro recuperável:
- Erro definitivo:

### Casos excepcionais

- ...

## Regras de negócio

1. ...
2. ...

## Experiência e interface

Descreva telas, componentes, textos, estados, acessibilidade e comportamento
responsivo. Anexe wireframes ou imagens em caminhos versionados no repositório,
quando existirem.

## Internacionalização

- Mensagens novas ou alteradas:
- Contexto necessário para tradução:
- Impacto nos catálogos PO, MO, JSON ou POT:

## Especificação técnica

### Backend PHP

- Classes/serviços afetados:
- Hooks do WordPress:
- Validação, sanitização e escape:
- Dependências do Tainacan:

### API REST

Preencha para cada endpoint novo ou alterado:

| Campo | Definição |
| --- | --- |
| Método e rota | `GET/POST/PUT/DELETE obatala/v1/...` |
| Capability |  |
| Parâmetros |  |
| Corpo |  |
| Resposta de sucesso |  |
| Respostas de erro |  |
| Compatibilidade |  |

### Frontend React

- Componentes afetados:
- Estado e fluxo de dados:
- Chamadas de API:
- Tratamento de carregamento e erros:

### Persistência e migração

- Dados criados ou alterados:
- Estratégia idempotente de instalação/upgrade:
- Tratamento dos dados existentes:
- Rollback ou recuperação:

### Segurança e privacidade

- Verificações de capability:
- Nonces ou autenticação REST:
- Validação e sanitização de entrada:
- Escape de saída:
- Dados pessoais ou sensíveis envolvidos:

## Compatibilidade

- WordPress 5.7+:
- Tainacan:
- Contratos REST existentes:
- Dados e configurações existentes:
- Navegadores ou dispositivos relevantes:

## Critérios de aceite

Use condições observáveis e verificáveis.

- [ ] Dado ..., quando ..., então ...
- [ ] Usuários sem a capability necessária não conseguem executar a operação.
- [ ] Entradas inválidas produzem uma mensagem ou resposta de erro definida.
- [ ] Textos novos usam o text domain `obatala` e possuem catálogos atualizados.
- [ ] O comportamento anterior permanece compatível, exceto onde documentado.
- [ ] As validações aplicáveis terminam sem erros.

## Plano de validação

### Automatizada

- [ ] `npm run lint:js`
- [ ] `npm run build`
- [ ] `php -l caminho/do/arquivo.php`
- [ ] `composer test`
- [ ] Outro:

Marque como não aplicável o que não fizer parte da mudança e explique o motivo.

### Manual

| Cenário | Perfil e pré-condições | Passos | Resultado esperado |
| --- | --- | --- | --- |
|  |  |  |  |

## Documentação afetada

- [ ] `README.md`
- [ ] `readme.txt`
- [ ] `mk-docs/docs/`
- [ ] Nenhuma; justificativa:

## Riscos, dependências e questões em aberto

- **Riscos:**
- **Dependências:**
- **Questões em aberto:**

## Registro da implementação

Preencher durante ou após a implementação:

- Arquivos principais alterados:
- Decisões tomadas:
- Critérios atendidos:
- Validações executadas e resultados:
- Limitações ou itens pendentes:
