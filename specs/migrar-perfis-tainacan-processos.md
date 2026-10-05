# Migrar perfis e capabilities para o Tainacan Processos

## Metadados

- **Status:** Implementada; validação manual pendente
- **Responsável:** Equipe Tainacan Processos
- **Data:** 2026-09-26
- **Issue/PR:** Não informado
- **Versão alvo:** Não informada

## Contexto e problema

Antes desta mudança, o plugin criava os perfis próprios
`obatala_administrator`, `obatala_editor` e `obatala_author`. Ao mesmo tempo,
dependia do Tainacan, que já possuía os perfis `tainacan-administrator`,
`tainacan-editor` e `tainacan-author`.

Os perfis nativos do Tainacan possuem semântica e capabilities próprias. Em
particular, `tainacan-author` representa autoria de conteúdo no repositório e
pode criar coleções e taxonomias; ele não representa adequadamente um
participante de etapas do Tainacan Processos. Esse perfil deve permanecer
inalterado.

Embora o WordPress suporte tecnicamente mais de um papel por usuário, sua
interface administrativa e o fluxo usual de gestão trabalham com um perfil
principal. Depender de um perfil Tainacan e outro perfil Obatalá para o mesmo
usuário torna a administração confusa e pode fazer uma alteração de perfil
remover permissões necessárias.

As capabilities legadas também apresentavam inconsistências:

- os menus verificam capabilities `obatala_*`;
- várias rotas REST ainda usam `edit_posts`, `manage_options` ou uma verificação
  genérica de acesso;
- algumas capabilities estão declaradas, mas ainda não protegem as operações
  correspondentes;
- a criação de modelos usa permissões nativas de posts na API, embora o menu use
  `obatala_manage_models`;
- `Roles::ensure_roles()` é executado durante o carregamento do plugin e pode
  voltar a conceder permissões que tenham sido personalizadas.

O recurso existente de grupos deve ser preservado. No backend, os grupos são
tratados como setores, armazenados em `obatala_setores`; suas associações com
usuários ficam em `associated_sector`, e etapas usam `sector_obatala` para
indicar o grupo responsável.

Esta especificação complementa e deve ser compatibilizada com
`specs/revisar-permissoes-perfis-usuario.md`.

## Objetivo

Utilizar os perfis do Tainacan como perfis principais dos usuários do Tainacan
Processos e adicionar a eles capabilities próprias do plugin, com nomes
`tainacan_processes_*`. Para representar o participante operacional sem ampliar
as permissões nativas do Tainacan Author, o Obatalá deve criar somente um novo
papel do WordPress: **Tainacan Participant**, com slug
`tainacan-processes-participant`.

Toda a implementação deve permanecer no plugin Obatalá/Tainacan Processos. Não
serão alterados arquivos, classes, rotas, migrations, perfis ou capabilities
nativas do plugin Tainacan.

A autorização deve combinar três dimensões:

1. o perfil Tainacan e suas capabilities definem o que o usuário pode fazer;
2. a participação em grupos define em quais processos o usuário pode entrar;
3. o grupo responsável pela etapa define em quais etapas o usuário pode atuar.

Menus, interface e API REST devem aplicar a mesma matriz de autorização.

## Fora do escopo

- Renomear o namespace REST `obatala/v1` nesta entrega.
- Renomear o text domain `obatala` nesta entrega.
- Migrar grupos de `wp_options` para outra estrutura de persistência.
- Redesenhar integralmente as telas de grupos e usuários.
- Criar uma nova tabela de banco de dados.
- Implementar uma interface completa de auditoria de permissões.
- Alterar qualquer arquivo ou comportamento interno do plugin Tainacan.
- Renomear, remover ou alterar os perfis `tainacan-administrator`,
  `tainacan-editor` e `tainacan-author`.
- Adicionar, remover ou redefinir capabilities nativas `tnc_*`.
- Criar outros perfis especializados além de **Tainacan Participant** nesta
  entrega.

## Perfis e permissões

| Perfil/ator | Pode visualizar | Pode executar | Capability necessária |
| --- | --- | --- | --- |
| Administrador WordPress | Todas as áreas e todos os processos | Todas as operações; pode ignorar restrições de grupo | Todas as `tainacan_processes_*` |
| Tainacan Administrator | Todas as áreas e todos os processos | Todas as operações; pode ignorar restrições de grupo | Todas as `tainacan_processes_*` |
| Tainacan Editor | Dashboard, modelos ativos e processos autorizados por grupo | Criar e editar processos, comentar, gerar relatórios, avançar etapas do seu grupo e executar exportações autorizadas | `tainacan_processes_access`, `tainacan_processes_manage`, `tainacan_processes_advance_stages`, `tainacan_processes_manage_comments`, `tainacan_processes_generate_reports` e `tainacan_processes_execute_exports` |
| Tainacan Author | Somente o que suas capabilities nativas do Tainacan permitem | Nenhuma operação do Tainacan Processos por padrão | Nenhuma `tainacan_processes_*` automática |
| Tainacan Participant | Dashboard e processos autorizados por grupo | Preencher campos, comentar, gerar relatórios permitidos e avançar etapas do seu grupo | `read`, `tainacan_processes_access`, `tainacan_processes_advance_stages`, `tainacan_processes_manage_comments` e `tainacan_processes_generate_reports` |
| Usuário sem capability do Tainacan Processos | Nenhuma área administrativa do plugin | Nenhuma operação | Nenhuma |

O perfil **Tainacan Participant** é um papel do WordPress criado e
mantido exclusivamente pelo Obatalá. Ele pode aparecer junto aos perfis do
Tainacan, mas não exige alteração no código do Tainacan.

O perfil não substitui os grupos. Um usuário pode ter um único perfil principal
e continuar associado a vários grupos do Tainacan Processos.

## Catálogo de capabilities

### Migração das capabilities atuais

| Capability atual | Capability nova proposta | Finalidade |
| --- | --- | --- |
| `obatala_access` | `tainacan_processes_access` | Acessar o Tainacan Processos |
| `obatala_manage_processes` | `tainacan_processes_manage` | Criar e administrar processos autorizados |
| `obatala_advance_stages` | `tainacan_processes_advance_stages` | Avançar ou concluir etapas autorizadas |
| `obatala_comment_manage` | `tainacan_processes_manage_comments` | Criar e gerenciar comentários permitidos |
| `obatala_report_generate` | `tainacan_processes_generate_reports` | Gerar relatórios e PDFs permitidos |
| `obatala_manage_models` | `tainacan_processes_manage_models` | Criar, editar, ativar e desativar modelos |
| `obatala_manage_groups` | `tainacan_processes_manage_groups` | Administrar grupos e seus participantes |
| `obatala_manage_mappers` | `tainacan_processes_manage_mappings` | Configurar mapeamentos com o Tainacan |
| `obatala_settings_manage` | `tainacan_processes_manage_settings` | Alterar configurações do plugin |

### Capabilities adicionais propostas

| Capability | Finalidade |
| --- | --- |
| `tainacan_processes_delete_models` | Excluir modelos, separadamente da criação e edição |
| `tainacan_processes_delete_processes` | Excluir ou restaurar processos, conforme a regra funcional aprovada |
| `tainacan_processes_execute_exports` | Preparar, revisar e executar exportações em processos autorizados |

Os identificadores técnicos devem continuar exclusivos. Não devem ser usados
nomes genéricos como `manage_models` ou `manage_groups`, pois capabilities
compartilham o namespace global do WordPress.

## Comportamento funcional

### Fluxo principal

1. Dado um usuário com um perfil Tainacan, quando acessar o Tainacan Processos,
   o sistema deve obter as capabilities efetivas desse perfil.
2. Quando o usuário tentar acessar uma área administrativa, o menu, a página e a
   API devem exigir a mesma capability funcional.
3. Quando a operação estiver vinculada a um processo, o sistema deve validar se
   o usuário pertence a algum grupo participante do processo.
4. Quando a operação alterar ou avançar uma etapa, o sistema deve validar se o
   usuário pertence especificamente ao grupo responsável pela etapa atual.
5. Quando a operação consultar ou alterar objetos do Tainacan, o sistema também
   deve respeitar `can_read()`, `can_edit()` e as capabilities nativas do
   Tainacan.
6. Administradores WordPress e Tainacan devem possuir uma exceção explícita e
   centralizada para as verificações contextuais de grupo.

### Estados e variações

- **Usuário não autenticado:** não vê menus e recebe 401 ou erro REST
  equivalente.
- **Sem capability do Tainacan Processos:** não vê a área e recebe 403 em acesso
  direto.
- **Com capability, mas sem grupo no processo:** não acessa dados contextuais do
  processo.
- **Com acesso ao processo, mas fora do grupo da etapa:** pode visualizar o que
  estiver autorizado, mas não pode alterar ou avançar a etapa.
- **Tainacan Author:** mantém somente suas permissões nativas e não recebe acesso
  automático ao Tainacan Processos.
- **Tainacan Participant:** recebe apenas `read` e as capabilities
  operacionais definidas nesta especificação; sua atuação permanece restrita por
  grupos.
- **Administrador:** possui acesso global documentado, mesmo sem grupo.
- **Migração ainda pendente:** os papéis e capabilities legados são reconhecidos
  apenas pela rotina de migração e removidos quando ela termina com sucesso.

### Casos excepcionais

- Usuários que hoje possuem mais de um papel devem terminar a migração com um
  perfil Tainacan principal definido e sem perda de acesso legítimo.
- Capabilities concedidas diretamente ao usuário devem ser inventariadas e
  migradas, sem depender apenas das capabilities do perfil.
- O novo perfil Participante deve ser criado e atualizado de forma idempotente
  pelo Obatalá, sem modificar perfis nativos do Tainacan.
- Se o perfil Participante estiver ausente, o Obatalá deve restaurá-lo sem
  alterar usuários ou capabilities nativas do Tainacan.
- Perfis antigos devem ser removidos somente depois que seus usuários forem
  transferidos para os destinos aprovados.

## Regras de negócio

1. A autorização deve ser feita por capability, não pela comparação direta do
   nome do perfil.
2. Administradores WordPress e Tainacan possuem todas as capabilities do
   Tainacan Processos.
3. Tainacan Editor não administra modelos, grupos, mapeamentos ou configurações
   por padrão.
4. Tainacan Author permanece inalterado e não recebe automaticamente nenhuma
   capability `tainacan_processes_*`.
5. Tainacan Participant não cria processos ou modelos e só atua nos
   processos e etapas permitidos pelos seus grupos.
6. Criar, editar, ativar ou desativar modelos exige
   `tainacan_processes_manage_models`.
7. Excluir modelos exige `tainacan_processes_delete_models`.
8. Editores e participantes só avançam uma etapa quando possuem
   `tainacan_processes_advance_stages` e pertencem ao grupo da etapa atual.
9. Pertencer a algum grupo participante pode conceder acesso ao processo, mas
   não concede atuação em todas as etapas.
10. Administrar grupos não concede automaticamente acesso a todos os processos.
11. Configurar mapeamentos e executar exportações são permissões diferentes.
12. Toda operação REST deve usar o usuário autenticado; identificadores de
    usuário recebidos do cliente não podem autorizar ações.
13. As regras do Tainacan para leitura e edição de itens e coleções permanecem
    obrigatórias.
14. A migração deve ser idempotente e versionada.
15. Capabilities do Tainacan Processos não devem ser reatribuídas automaticamente em
    toda requisição.
16. Nenhuma implementação pode editar arquivos, perfis ou capabilities nativas
    do plugin Tainacan.

## Experiência e interface

- Menus devem aparecer somente quando o usuário possuir a capability exigida.
- Ocultar um menu ou botão é melhoria de experiência, não substitui a
  autorização no backend.
- A interface deve distinguir falta de autenticação, falta de capability e falta
  de acesso contextual ao grupo.
- Erros 401 e 403 devem produzir mensagens compreensíveis e não atualizar o
  estado local como se a operação tivesse funcionado.
- A interface deve apresentar somente os perfis efetivamente considerados nesta
  entrega e não sugerir que o Tainacan Author é um participante de processos.

## Internacionalização

- Todo texto novo ou alterado deve usar o text domain `obatala`.
- Nomes visíveis das permissões devem ser traduzíveis e não depender do slug
  técnico da capability.
- Mensagens de migração, acesso negado e configuração de perfis devem ser
  incluídas nos catálogos POT, PO, MO e JSON conforme o fluxo do projeto.

## Especificação técnica

### Backend PHP

- Refatorar `Obatala\Security\Roles` para manter um catálogo central das novas
  capabilities e helpers de autorização.
- Não usar o nome do perfil como condição de acesso em rotas ou regras de
  negócio.
- Criar helpers equivalentes a:
  - `can_access()`;
  - `can_manage_processes()`;
  - `can_advance_stages()`;
  - `can_manage_comments()`;
  - `can_generate_reports()`;
  - `can_manage_models()`;
  - `can_delete_models()`;
  - `can_manage_groups()`;
  - `can_manage_mappings()`;
  - `can_execute_exports()`;
  - `can_access_process($process_id, $user_id = null)`;
  - `can_act_on_stage($process_id, $stage_id, $user_id = null)`.
- Refatorar `Sector::check_permission()` ou substituí-lo pelos helpers
  contextuais separados.
- Alterar o fluxo de `Roles::ensure_roles()` para que defaults e migrações sejam
  executados somente quando necessário e não sobrescrevam personalizações.
- Criar `tainacan-processes-participant` por meio da API de papéis do WordPress,
  exclusivamente a partir do plugin Obatalá.
- Adicionar capabilities `tainacan_processes_*` aos perfis selecionados sem
  remover ou alterar suas capabilities nativas `tnc_*`.
- Implementar migração em classe ou serviço dedicado, com versão persistida.
- Preservar proteção contra acesso direto com `ABSPATH` nos arquivos PHP
  executáveis.
- Não editar nenhum arquivo localizado no diretório do plugin Tainacan.

Arquivos inicialmente afetados:

- `classes/Security/Roles.php`;
- `classes/Entities/Sector.php`;
- `classes/Entities/ProcessType.php`;
- `classes/Api/ObatalaAPI.php`;
- `classes/Api/CustomPostTypeApi.php`;
- `classes/Api/ProcessApi.php`;
- `classes/Api/ProcessTypeApi.php`;
- `classes/Api/SectorApi.php`;
- `classes/Api/ExporterApi.php`;
- `classes/Api/TainacanItemsApi.php`;
- `classes/Admin/AdminMenu.php`;
- `classes/Admin/Enqueuer.php`;
- `obatala.php`.

### API REST

As rotas existentes devem ser preservadas sempre que possível. Seus callbacks de
permissão devem ser substituídos conforme a área:

| Área | Leitura | Escrita ou execução | Contexto adicional |
| --- | --- | --- | --- |
| Processos | Acesso ao processo | `tainacan_processes_manage` | Grupo participante |
| Etapas | Acesso ao processo | `tainacan_processes_advance_stages` | Grupo da etapa atual |
| Comentários | Acesso ao processo | `tainacan_processes_manage_comments` | Processo permitido e autoria para editar/excluir |
| Relatórios e PDFs | Acesso ao processo | `tainacan_processes_generate_reports` | Processo permitido |
| Modelos | Leitura necessária à operação | `tainacan_processes_manage_models` | Exclusão exige capability própria |
| Grupos e usuários | Capability administrativa | `tainacan_processes_manage_groups` | Não concede acesso implícito aos processos |
| Mapeamentos | Capability administrativa | `tainacan_processes_manage_mappings` | Respeitar objetos Tainacan envolvidos |
| Exportações operacionais | Acesso ao processo | `tainacan_processes_execute_exports` | Processo permitido e permissões Tainacan |
| Configurações | Capability administrativa | `tainacan_processes_manage_settings` | Sem contexto de grupo |

Respostas esperadas:

- 401 para usuário não autenticado;
- 403 para usuário sem capability ou sem acesso contextual;
- 404 para entidade inexistente ou deliberadamente não exposta;
- 400 para entrada inválida.

### Frontend React

- Expor ao frontend somente os indicadores de permissão necessários.
- Revisar `window.obatalaApp` para refletir as novas capabilities.
- Condicionar menus, botões e formulários às mesmas regras do backend.
- Remover dependência de `user_id` enviado pelo cliente para autorização.
- Tratar 401 e 403 sem simular sucesso local.
- Revisar componentes de processos, modelos, grupos, comentários, relatórios,
  mapeamentos e exportação.

### Persistência e migração

Mapeamento inicial de perfis:

```text
obatala_administrator -> tainacan-administrator
obatala_editor        -> tainacan-editor
obatala_author        -> tainacan-processes-participant
```

A migração deve:

1. criar de forma idempotente o perfil `tainacan-processes-participant` com
   `read` e as capabilities operacionais aprovadas;
2. usar as concessões diretas `obatala_*` para selecionar o perfil de destino;
3. migrar usuários dos perfis antigos para os destinos definidos acima;
4. preservar `associated_sector` e todas as demais metas do usuário;
5. tratar múltiplos perfis e capabilities concedidas diretamente ao usuário;
6. registrar sua versão de forma idempotente;
7. gerar um resumo de usuários e concessões migrados;
8. remover capabilities `obatala_*` de papéis e usuários após a conversão;
9. remover os papéis antigos após migrar seus usuários.

A migração não pode renomear `tainacan-author`, alterar suas capabilities ou
usá-lo como destino de `obatala_author`.

A camada central de autorização deve aceitar somente capabilities
`tainacan_processes_*`. Os nomes `obatala_*` existem no código apenas para que a
migração consiga identificá-los e removê-los.

### Segurança e privacidade

- Todas as rotas REST devem declarar `permission_callback` específico.
- A API deve usar `get_current_user_id()` como identidade autorizadora.
- Listagens de usuários e e-mails exigem
  `tainacan_processes_manage_groups`.
- Acesso ao processo e atuação na etapa devem ser verificações separadas.
- Downloads, uploads, exclusões e exportações devem validar permissão antes de
  ler, mover ou persistir dados.
- Dados de processos privados não devem ser expostos a usuários sem grupo ou
  capability adequada.

## Compatibilidade

- **WordPress 5.7+:** usar somente APIs compatíveis com o requisito atual.
- **Tainacan:** consumir somente suas APIs públicas e seus perfis existentes;
  não alterar código, migrations, rotas, perfis ou capabilities `tnc_*`; respeitar
  suas regras de leitura e edição.
- **Contratos REST:** manter namespace, rotas e formatos sempre que a correção de
  segurança não exigir alteração documentada.
- **Dados existentes:** preservar processos, modelos, grupos,
  `associated_sector`, `flowData`, comentários, relatórios e configurações de
  exportação.
- **Capabilities antigas:** converter usuários afetados e remover as concessões
  `obatala_*` ao final da migração.

## Critérios de aceite

- [x] O plugin não exige que um usuário tenha simultaneamente um perfil Obatalá
  e um perfil Tainacan.
- [x] Administradores WordPress e Tainacan possuem todas as capabilities do
  Tainacan Processos.
- [x] Tainacan Editor recebe somente as capabilities operacionais aprovadas.
- [x] Tainacan Author permanece com nome e capabilities nativas inalterados e não
  recebe automaticamente capabilities do Tainacan Processos.
- [x] O Obatalá cria de forma idempotente o perfil **Tainacan Participant**, com
  slug `tainacan-processes-participant`.
- [x] O Participante atua somente nos processos e etapas permitidos pelos seus
  grupos.
- [x] Criar ou editar modelos exige
  `tainacan_processes_manage_models` no menu e na API.
- [x] Excluir modelos exige `tainacan_processes_delete_models`.
- [x] Administrar grupos exige `tainacan_processes_manage_groups`.
- [x] Configurar mapeamentos exige
  `tainacan_processes_manage_mappings`.
- [x] Executar exportações exige `tainacan_processes_execute_exports` e acesso
  contextual ao processo.
- [x] Acesso ao processo e atuação na etapa são verificações separadas.
- [x] Menus e rotas REST usam a mesma capability para cada operação.
- [x] Nenhuma autorização confia em `user_id` recebido do cliente.
- [x] A migração preserva grupos e demais dados dos usuários.
- [x] Executar a migração mais de uma vez não duplica papéis nem remove as
  capabilities aprovadas dos perfis de destino.
- [x] Perfis e capabilities `obatala_*` são removidos depois da migração dos
  usuários afetados.
- [x] Usuários sem autorização recebem 401 ou 403 sem alteração parcial de
  dados.
- [x] As regras nativas do Tainacan continuam sendo aplicadas a itens e coleções.
- [x] Nenhum arquivo, perfil, rota, migration ou capability nativa do plugin
  Tainacan é modificado.
- [x] Textos novos usam o text domain `obatala` e os catálogos são atualizados.
- [ ] As validações aplicáveis terminam sem erros.

## Plano de ação

### Fase 1 — decisões e especificação

- [x] Aprovar o catálogo definitivo de capabilities.
- [x] Aprovar a matriz Administrador WordPress, Tainacan Administrator, Tainacan
  Editor e Tainacan Participant.
- [x] Registrar que Tainacan Author permanece inalterado e fora da matriz padrão
  do Tainacan Processos.
- [x] Definir a exceção administrativa de grupos.
- [ ] Definir direitos de criação, edição, exclusão e restauração.
- [x] Compatibilizar esta especificação com
  `revisar-permissoes-perfis-usuario.md`.

### Fase 2 — inventário de autorização

- [x] Mapear cada menu, página, botão e rota REST para uma capability.
- [x] Classificar operações de leitura, escrita, execução e exclusão.
- [x] Identificar todas as verificações genéricas `edit_posts` e
  `manage_options` que devem ser substituídas.
- [x] Identificar usos de `user_id` enviado pelo cliente para autorização.

### Fase 3 — fundação de capabilities

- [x] Refatorar `Roles` para o novo catálogo e helpers.
- [x] Associar defaults aos perfis Tainacan selecionados sem alterar capabilities
  nativas `tnc_*`.
- [x] Criar o perfil `tainacan-processes-participant` exclusivamente no Obatalá.
- [x] Criar testes unitários para a matriz de capabilities.
- [x] Remover concessão contínua de defaults em todo carregamento.

### Fase 4 — migração

- [x] Implementar migração versionada e idempotente.
- [x] Migrar `obatala_administrator` para `tainacan-administrator`.
- [x] Migrar `obatala_editor` para `tainacan-editor`.
- [x] Migrar `obatala_author` para `tainacan-processes-participant`.
- [x] Migrar capabilities de perfis e de usuários.
- [x] Preservar grupos e dados existentes.
- [x] Produzir resumo ou diagnóstico da migração.
- [x] Remover papéis e capabilities legados após migrar os usuários.

### Fase 5 — modelos e grupos

- [x] Proteger criação e edição de modelos pela nova capability.
- [x] Separar exclusão de modelos.
- [x] Proteger todas as operações de grupos e participantes.
- [x] Alinhar menus, páginas e rotas REST.

### Fase 6 — processos, etapas e comentários

- [ ] Proteger criação, edição, exclusão e restauração de processos.
- [x] Separar acesso ao processo e atuação na etapa.
- [x] Validar o grupo responsável pela etapa atual.
- [x] Proteger comentários e validar autoria.

### Fase 7 — relatórios, mapeamentos e exportações

- [x] Proteger relatórios e documentos.
- [x] Separar configuração de mapeamento e execução de exportação.
- [x] Aplicar acesso contextual ao processo.
- [x] Respeitar permissões nativas dos objetos Tainacan.

### Fase 8 — frontend, documentação e traduções

- [x] Atualizar indicadores de permissão no bootstrap do frontend.
- [x] Atualizar visibilidade e comportamento dos controles.
- [ ] Tratar respostas 401 e 403.
- [x] Atualizar documentação operacional e técnica.
- [x] Atualizar catálogos de tradução quando aplicável.

### Fase 9 — validação e entrega gradual

- [ ] Executar testes automatizados e manuais da matriz completa.
- [ ] Validar migração em uma cópia representativa dos dados.
- [x] Aplicar a migração destrutiva dos identificadores legados somente após
  transferir seus usuários.
- [x] Registrar no relatório usuários e concessões convertidos ou removidos.
- [x] Remover perfis e capabilities antigos nesta migração.

## Plano de validação

### Automatizada

- [x] `php -l` em cada arquivo PHP alterado.
- [ ] `composer test`.
- [ ] `npm run lint:js`.
- [x] `npm run build`.
- [x] Testes da matriz perfil × capability.
- [x] Testes de migração repetida sem duplicação ou perda de dados.
- [ ] Testes de acesso ao processo e atuação na etapa.
- [ ] Testes REST para respostas 401, 403 e sucesso.
- [ ] `npm run i18n:make-pot`, quando houver mensagens alteradas.
- [x] `npm run i18n:po-to-mo-json`, quando aplicável e disponível.

### Manual

| Cenário | Perfil e pré-condições | Passos | Resultado esperado |
| --- | --- | --- | --- |
| Administrador global | Administrador WordPress sem grupo | Acessar e operar todas as áreas | Acesso completo |
| Administrador Tainacan | `tainacan-administrator` sem grupo | Acessar e operar todas as áreas | Acesso completo |
| Editor com grupo | `tainacan-editor` associado ao grupo do processo e da etapa | Editar processo e avançar etapa | Operações permitidas |
| Editor fora do grupo | `tainacan-editor` sem associação ao processo | Chamar rotas do processo | Resposta 403 |
| Tainacan Author | `tainacan-author` sem capability do Tainacan Processos | Acessar menus e rotas do plugin | Menu ausente e resposta 403; perfil nativo inalterado |
| Participante na etapa | `tainacan-processes-participant` no grupo da etapa atual | Preencher, comentar e avançar | Operações permitidas conforme capabilities |
| Participante em outro grupo | Participante acessa o processo, mas não pertence ao grupo da etapa atual | Tentar avançar etapa | Resposta 403 |
| Participante tenta criar processo | Participante autenticado e associado a um grupo | Criar processo | Resposta 403 |
| Participante tenta criar modelo | Participante autenticado | Criar modelo | Resposta 403 |
| Migração de administrador | Usuário `obatala_administrator` com grupos | Executar upgrade | Perfil e capabilities migrados; grupos preservados |
| Migração de autor antigo | Usuário `obatala_author` com grupos | Executar upgrade | Usuário recebe `tainacan-processes-participant`; grupos preservados |
| Migração repetida | Instalação já migrada | Executar novamente o upgrade | Nenhuma duplicação ou perda de dados |
| Acesso direto | Usuário sem capability | Abrir URL e chamar REST diretamente | Menu ausente e resposta 403 |

## Documentação afetada

- [x] `README.md`, se a mudança alterar instruções públicas de perfis.
- [x] `readme.txt`, se a mudança alterar instruções públicas de perfis.
- [x] `mk-docs/docs/`, incluindo matriz de perfis e guia de migração.
- [x] Documentação das capabilities e do perfil Tainacan Participant.

## Riscos, dependências e questões em aberto

- **Riscos:** bloquear usuários que dependem de `edit_posts`; interpretar
  incorretamente uma concessão direta legada; alterar acidentalmente capabilities
  nativas do Tainacan; migrar incorretamente usuários com múltiplos papéis;
  permitir atuação em uma etapa apenas por participação em outro grupo do
  processo.
- **Dependências:** Tainacan ativo e com seus perfis disponíveis; ambiente com
  usuários representativos; processos com múltiplos grupos; fixtures ou cópia
  segura de dados para validar a migração.
- **Questões em aberto:**
  - O nome `tainacan_processes_manage` é suficientemente explícito ou deve ser
    substituído por `tainacan_processes_manage_processes`?
  - Tainacan Editor pode arquivar processos por padrão?
  - É necessária uma capability específica apenas para leitura/auditoria?
  - Quem pode restaurar processos excluídos logicamente?

## Registro da implementação

- **Arquivos principais alterados:** `classes/Security/Roles.php`,
  `classes/Security/RoleMigration.php`, controllers REST em `classes/Api/`,
  entidades de processos, modelos e grupos, `TainacanExportService`, bootstrap e
  menus administrativos, componentes React em `src/admin/`, catálogos em
  `languages/`, documentação e `tests/RolesTest.php`.
- **Decisões tomadas:** `tainacan_processes_manage` foi mantida como capability
  de gestão de processos; Tainacan Editor não recebe exclusão de processos nem
  gestão de modelos; administradores ignoram o contexto de grupos; somente o
  perfil adicional Tainacan Participant é criado; papéis e capabilities
  `obatala_*` são removidos depois da migração.
- **Critérios atendidos:** matriz de perfis, novo Participante, migração
  versionada, autorização contextual por grupo e etapa, separação de permissões
  administrativas, identidade obtida da sessão, verificações nativas do
  Tainacan, frontend, documentação e traduções.
- **Validações executadas e resultados:** `php -l` passou nos 17 arquivos PHP
  alterados ou criados; `npm run build` passou com três avisos de tamanho já
  informados pelo webpack; o teste isolado de numeração de processos passou; o
  smoke test da matriz de capabilities, o teste de autorização da etapa ativa e
  o smoke test da migração idempotente passaram; MO e JSON de `pt_BR` e `es_ES`
  foram regenerados. A migração de papéis versão 3 foi aplicada no WordPress
  local: removeu os três papéis legados e todas as concessões `obatala_*`,
  mantendo somente Tainacan Administrator, Tainacan Editor, Tainacan Author e
  Tainacan Participant entre os perfis relacionados ao Tainacan.
- **Limitações ou itens pendentes:** a matriz completa ainda precisa de teste
  manual em uma instalação WordPress/Tainacan representativa. `composer test`
  não pôde rodar porque `vendor/bin/phpunit` não está instalado; `npm run
  lint:js` continua falhando no baseline do repositório (17.910 ocorrências,
  principalmente formatação); `npm run i18n:make-pot` não pôde rodar por falta
  do executável `wp`, por isso os catálogos-fonte foram atualizados e os binários
  foram gerados pelo script disponível. Não existe rota de restauração de
  processos nesta versão; a política de restauração permanece para uma entrega
  posterior.
