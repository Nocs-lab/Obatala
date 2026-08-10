# Revisar permissoes e perfis de usuario

## Metadados

- **Status:** Rascunho
- **Responsavel:** Equipe Obatala
- **Data:** 2026-08-06
- **Issue/PR:** Nao informado
- **Versao alvo:** Nao informada

## Contexto e problema

O Obatala possui um modelo proprio de roles e capabilities em
`Obatala\Security\Roles`, com perfis de administrador, editor e autor do plugin.
Essas capabilities tambem sao usadas para controlar a exibicao dos menus do painel
administrativo.

Apesar disso, varias rotas REST sensiveis ainda usam a permissao generica
`permission_check_edit_posts`, que hoje delega para `Roles::can_access_obatala()`.
Essa permissao generica permite acesso quando o usuario esta logado e possui
`obatala_access`, `edit_posts` ou `manage_options`.

Na pratica, a regra de menu e a regra de API divergem: um usuario pode nao ver uma
tela no menu por falta de capability especifica, mas ainda conseguir executar a
operacao por chamada REST autenticada. Tambem ha endpoints que recebem `user_id`
por parametro e usam esse valor para autorizar acoes, em vez de usar
`get_current_user_id()`.

Principais pontos observados:

- rotas de processos podem atualizar metadados, etapa atual, tipo do processo e
  status de nodes usando permissao ampla;
- rotas de modelos podem editar `flowData`, associar setores e gerenciar anexos
  usando permissao ampla;
- rotas de grupos/setores podem criar, editar, excluir setores e associar usuarios
  usando permissao ampla;
- endpoints de comentarios confiam em `user_id` informado pelo cliente;
- endpoints operacionais de exportacao Tainacan por processo nao aplicam checagem
  contextual por processo ou capability mais especifica;
- `Sector::check_permission()` e fragil quanto ao formato de `associated_sector`
  e nao define claramente excecoes para administradores.

## Objetivo

Uniformizar o controle de acesso do plugin para que cada operacao REST seja
protegida pela capability correta e, quando aplicavel, pela permissao contextual
do usuario no processo/setor.

Ao final, a interface e a API devem seguir a mesma matriz de autorizacao, sem
confiar em identificadores de usuario enviados pelo cliente para validar acesso.

## Fora do escopo

- Redesenhar a experiencia completa de usuarios, grupos e setores.
- Migrar setores de `wp_options` para uma tabela propria ou custom post type.
- Alterar a estrutura visual das telas administrativas.
- Alterar contratos REST desnecessariamente; respostas devem permanecer
  compativeis quando a mudanca nao exigir novo formato.
- Criar um sistema completo de auditoria, alem de preservar/registrar o usuario
  real quando a operacao ja possui metadados de autoria.
- Remover imediatamente o fallback de compatibilidade com roles nativas do
  WordPress sem decisao explicita.

## Perfis e permissoes

| Perfil/ator | Pode visualizar | Pode executar | Capability necessaria |
| --- | --- | --- | --- |
| Administrador WordPress / Obatala | Todas as areas do Obatala | Gerenciar processos, modelos, grupos, mapeadores, configuracoes, relatorios e exportacoes | Todas as capabilities `obatala_*` |
| Editor Obatala | Dashboard e processos | Criar/editar processos, avancar etapas, comentar e gerar relatorios | `obatala_access`, `obatala_manage_processes`, `obatala_advance_stages`, `obatala_comment_manage`, `obatala_report_generate` |
| Autor Obatala | Dashboard e processos | Criar/editar processos permitidos, comentar e gerar relatorios permitidos | `obatala_access`, `obatala_manage_processes`, `obatala_comment_manage`, `obatala_report_generate` |
| Gestor de modelos | Modelos e editor de modelo | Criar/editar modelos e fluxo de etapas | `obatala_manage_models` |
| Gestor de grupos | Grupos e detalhes de grupo | Criar/editar/excluir setores e associar/remover usuarios | `obatala_manage_groups` |
| Gestor de mapeadores | Controles de mapeamento Tainacan | Ler/salvar mapeamentos de exportacao de modelos | `obatala_manage_mappers` |
| Usuario de setor | Processos em que seu setor participa | Ver dados permitidos do processo, comentar e avancar etapas conforme capability | Capability funcional + pertencimento ao setor |
| Usuario sem capability Obatala | Nenhuma area administrativa do Obatala | Nenhuma operacao Obatala | Nenhuma |

## Comportamento funcional

### Fluxo principal

1. Dado um usuario autenticado que acessa uma tela do Obatala, quando o menu e o
   bundle administrativo sao carregados, entao a interface deve exibir somente as
   areas permitidas pelas capabilities do usuario.
2. Dado o mesmo usuario, quando ele chama diretamente uma rota REST, entao a rota
   deve aplicar a mesma regra de capability exigida pela tela ou operacao
   correspondente.
3. Dado uma operacao sobre um processo especifico, quando a operacao depende do
   setor responsavel pela etapa ou pelo processo, entao o backend deve validar o
   usuario autenticado com `get_current_user_id()` contra os setores associados.
4. Dado uma operacao de comentario, quando o comentario e criado, editado ou
   removido, entao o autor usado e o usuario autenticado real, nao um parametro
   enviado pelo cliente.
5. Dado uma operacao de exportacao Tainacan em um processo, quando o usuario tenta
   preparar, revisar, executar ou decidir a exportacao, entao o backend deve
   validar tanto a capability funcional quanto o acesso ao processo.

### Estados e variacoes

- **Usuario sem login:** rotas REST retornam 401 ou erro REST equivalente.
- **Usuario logado sem capability Obatala:** menus nao aparecem e rotas retornam
  403.
- **Usuario com capability de menu, mas sem setor no processo:** rotas
  contextuais do processo retornam 403 com mensagem clara.
- **Administrador:** deve ter acesso completo, mesmo sem estar associado a um
  setor especifico.
- **Processo publico ou privado:** regras de visibilidade devem ser explicitas e
  preservadas onde ja existirem, mas a escrita sempre deve exigir permissao
  funcional.
- **Operacao bloqueada:** nenhuma alteracao parcial deve ser persistida antes da
  validacao de permissao.

### Casos excepcionais

- Requisicoes legadas que enviam `user_id` devem continuar funcionando somente se
  o valor corresponder ao usuario autenticado; caso contrario, o backend deve
  ignorar o parametro ou retornar 403.
- Rotas publicas de schema podem continuar publicas se nao expuserem dados
  sensiveis.
- Usuarios administradores devem ter override documentado e centralizado.
- Dados antigos de `associated_sector` em formato inesperado devem ser
  normalizados antes da comparacao.

## Regras de negocio

1. A autorizacao de uma rota nunca deve depender de `user_id` enviado pelo cliente.
2. Operacoes de gestao de grupos exigem `obatala_manage_groups`.
3. Operacoes de gestao de modelos exigem `obatala_manage_models`.
4. Operacoes de configuracao de mapeador exigem `obatala_manage_mappers`.
5. Operacoes de gestao de processos exigem `obatala_manage_processes`.
6. Avancar/concluir etapas exige `obatala_advance_stages` e acesso contextual ao
   processo, exceto para administradores.
7. Comentarios exigem `obatala_comment_manage` e acesso contextual ao processo.
8. Relatorios exigem `obatala_report_generate` e acesso contextual ao processo.
9. Exportacao operacional para Tainacan exige acesso contextual ao processo; se a
   operacao alterar mapeamento de modelo, tambem exige `obatala_manage_mappers`.
10. A verificacao de setor deve aceitar somente setores efetivamente associados ao
    usuario autenticado.
11. Menus, dados localizados no frontend e rotas REST devem usar a mesma matriz de
    capabilities.

## Experiencia e interface

- A interface deve continuar escondendo controles para usuarios sem permissao.
- Sempre que uma acao falhar por permissao, a UI deve mostrar uma mensagem de erro
  compreensivel e nao aparentar sucesso.
- Controles de mapeamento Tainacan devem continuar condicionados a
  `can_manage_mappers`.
- Telas de grupos devem ficar inacessiveis para usuarios sem
  `obatala_manage_groups`.
- Telas de modelo devem ficar inacessiveis para usuarios sem
  `obatala_manage_models`.
- Nenhuma tela deve depender apenas de ocultar botoes; toda operacao deve ser
  protegida no servidor.

## Internacionalizacao

- Mensagens novas ou alteradas devem usar o text domain `obatala`.
- Preferir mensagens curtas e consistentes para 401/403:
  - `You must be logged in.`
  - `You do not have permission to perform this action.`
  - `You do not have permission to access this process.`
- Atualizar `languages/obatala.pot`, PO/MO e JSON se novas mensagens forem
  adicionadas.

## Especificacao tecnica

### Backend PHP

- Criar ou ampliar helpers centralizados em `Obatala\Security\Roles`, por exemplo:
  - `can_access_obatala()`;
  - `can_manage_processes()`;
  - `can_advance_stages()`;
  - `can_manage_comments()`;
  - `can_generate_reports()`;
  - `can_manage_models()`;
  - `can_manage_groups()`;
  - `can_manage_mappers()`;
  - `can_access_process($process_id, $user_id = null)`.
- Revisar `Sector::check_permission()` para:
  - usar `get_current_user_id()` por padrao;
  - normalizar `associated_sector` de forma consistente;
  - validar existencia de chaves em `flowData`;
  - documentar override para administradores;
  - retornar sempre estrutura previsivel com `status`, `message` e `data_sector`.
- Atualizar callbacks de permissao em:
  - `classes/Api/ProcessApi.php`;
  - `classes/Api/ProcessTypeApi.php`;
  - `classes/Api/SectorApi.php`;
  - `classes/Api/ExporterApi.php`;
  - `classes/Api/CustomPostTypeApi.php`, quando a rota customizada nao deve usar
    permissao padrao de post;
  - `classes/Api/TainacanItemsApi.php`, se a rota expuser dados alem do que o
    Tainacan ja permite.
- Remover dependencia de `user_id` enviado pelo cliente nas rotas de processo e
  comentario.
- Garantir que validacao de permissao aconteca antes de qualquer
  `update_post_meta`, `wp_insert_comment`, upload, exportacao ou exclusao.

### API REST

Endpoints a revisar e proteger:

| Campo | Definicao |
| --- | --- |
| Metodo e rota | `GET/POST obatala/v1/process_obatala/<id>/current_stage` |
| Capability | GET: acesso ao processo; POST: `obatala_manage_processes` ou `obatala_advance_stages` conforme uso definido |
| Parametros | `id`, `current_stage` no POST |
| Corpo | Dados da etapa atual |
| Resposta de sucesso | Valor atual ou confirmacao de atualizacao |
| Respostas de erro | 401 sem login, 403 sem permissao, 404 processo inexistente |
| Compatibilidade | Preservar rota e formato quando possivel |

| Campo | Definicao |
| --- | --- |
| Metodo e rota | `GET/POST obatala/v1/process_obatala/<id>/meta` |
| Capability | GET: acesso ao processo; POST: `obatala_manage_processes` e acesso ao processo |
| Parametros | `id` |
| Corpo | Metadados do processo |
| Resposta de sucesso | Metadados ou `true`/confirmacao compativel |
| Respostas de erro | 401, 403, 404, 400 para dados invalidos |
| Compatibilidade | Ignorar ou rejeitar campos protegidos como ja ocorre |

| Campo | Definicao |
| --- | --- |
| Metodo e rota | `POST/GET/PUT/DELETE obatala/v1/process_obatala/...comment...` |
| Capability | `obatala_comment_manage` e acesso ao processo |
| Parametros | `id` do processo ou comentario |
| Corpo | Texto do comentario |
| Resposta de sucesso | Comentario criado/alterado/removido |
| Respostas de erro | 401, 403, 404, 400 |
| Compatibilidade | Nao confiar em `user_id`; usar usuario autenticado |

| Campo | Definicao |
| --- | --- |
| Metodo e rota | `PUT/GET obatala/v1/process_obatala/<id>/node` |
| Capability | GET: acesso ao processo; PUT: `obatala_advance_stages` e acesso ao processo |
| Parametros | `id`, `node_id` quando aplicavel |
| Corpo | Dados de alteracao de etapa |
| Resposta de sucesso | Node atualizado, proximo node, status e resultado de exportacao |
| Respostas de erro | 401, 403, 404, 400 |
| Compatibilidade | Preservar formato de resposta |

| Campo | Definicao |
| --- | --- |
| Metodo e rota | `GET/POST obatala/v1/process_obatala/<id>/report-pdf` e documentos de etapa |
| Capability | `obatala_report_generate` e acesso ao processo |
| Parametros | `id`, `node_id`, `field_id` quando aplicavel |
| Corpo | Documento sincronizado ou upload assinado |
| Resposta de sucesso | PDF/base64, download ou documento atualizado |
| Respostas de erro | 401, 403, 404, 400, 500 |
| Compatibilidade | Preservar fluxo atual de PDF |

| Campo | Definicao |
| --- | --- |
| Metodo e rota | `GET/PUT/POST obatala/v1/process_type/<id>/...` |
| Capability | `obatala_manage_models` |
| Parametros | `id`, `node_id`, `sector_id`, arquivo quando aplicavel |
| Corpo | Metadados do modelo, flowData ou upload |
| Resposta de sucesso | Dados do modelo ou confirmacao |
| Respostas de erro | 401, 403, 404, 400 |
| Compatibilidade | Preservar rotas existentes |

| Campo | Definicao |
| --- | --- |
| Metodo e rota | `GET/POST/DELETE obatala/v1/*sector*` |
| Capability | `obatala_manage_groups` |
| Parametros | `sector_id`, `user_id` quando aplicavel |
| Corpo | Dados do setor ou associacao usuario-setor |
| Resposta de sucesso | Setor, lista ou confirmacao |
| Respostas de erro | 401, 403, 404, 400, 409 |
| Compatibilidade | Preservar formato JSON atual quando possivel |

| Campo | Definicao |
| --- | --- |
| Metodo e rota | `GET/POST obatala/v1/exporter/process/<id>/...` |
| Capability | Acesso ao processo; operacoes destrutivas/executivas exigem capability funcional definida |
| Parametros | `process_id`, `preview_limit` |
| Corpo | Input de exportacao, linhas manuais, decisao ou arquivo |
| Resposta de sucesso | Runtime, input, review, resultado de exportacao ou decisao |
| Respostas de erro | 401, 403, 404, 400 |
| Compatibilidade | Preservar contratos da exportacao operacional |

### Frontend React

- Componentes afetados:
  - `ProcessManager`;
  - `ProcessViewer`;
  - `ProcessModelEditor`;
  - `SectorManager`;
  - `MappersManager`;
  - componentes de exportacao Tainacan.
- Estado e fluxo de dados:
  - remover dependencia de `currentUserId` em chamadas que hoje enviam `user_id`
    para autorizacao;
  - tratar 401/403 com mensagens claras;
  - manter ocultacao de controles por capability como melhoria de UX, nao como
    unica barreira.
- Chamadas de API:
  - atualizar wrappers em `src/admin/api/apiRequests.js` para nao enviar `user_id`
    quando a rota puder inferir o usuario autenticado.
- Tratamento de carregamento e erros:
  - estados de erro devem manter a tela aberta quando a falha for recuperavel;
  - acoes bloqueadas por permissao nao devem atualizar estado local como se
    tivessem sucesso.

### Persistencia e migracao

- Nao ha nova tabela obrigatoria.
- Nao ha migracao obrigatoria de setores nesta entrega.
- Dados existentes em `associated_sector` devem continuar validos.
- Se forem encontrados valores serializados ou aninhados em formatos legados, a
  normalizacao deve preservar acesso valido.
- Capabilities devem ser garantidas por `Roles::ensure_roles()` de forma
  idempotente.

### Seguranca e privacidade

- Todas as rotas REST devem declarar `permission_callback` especifico.
- Todas as acoes devem usar o usuario autenticado real.
- Uploads devem validar permissao antes de mover arquivos.
- Downloads devem validar permissao antes de ler arquivo.
- Listagens de usuarios e emails devem exigir `obatala_manage_groups`.
- Dados sensiveis de processos privados nao devem ser retornados para usuarios
  sem acesso contextual.

## Compatibilidade

- **WordPress 5.7+:** preservar APIs compativeis com o requisito do projeto.
- **Tainacan:** respeitar `can_read`, `can_edit` e demais regras nativas do
  Tainacan quando consultar itens e colecoes.
- **Contratos REST existentes:** manter rotas e formatos sempre que possivel.
- **Dados e configuracoes existentes:** preservar roles, user meta
  `associated_sector`, `flowData`, mapeamentos e dados de exportacao.
- **Navegadores/dispositivos:** sem impacto esperado alem das mensagens de erro
  no painel administrativo.

## Criterios de aceite

- [ ] Rotas de grupos/setores exigem `obatala_manage_groups`.
- [ ] Rotas de modelos exigem `obatala_manage_models`.
- [ ] Rotas de configuracao de mapeador continuam exigindo
  `obatala_manage_mappers`.
- [ ] Rotas de processo que alteram metadados exigem `obatala_manage_processes`
  e acesso contextual ao processo.
- [ ] Rotas de avanco/conclusao de etapa exigem `obatala_advance_stages` e acesso
  contextual ao processo.
- [ ] Rotas de comentarios usam `get_current_user_id()` e nao aceitam
  impersonacao por parametro `user_id`.
- [ ] Editar e excluir comentario so e permitido ao autor autenticado ou a usuario
  com capability administrativa definida.
- [ ] Rotas de relatorio/PDF exigem `obatala_report_generate` e acesso contextual
  ao processo.
- [ ] Rotas operacionais de exportacao Tainacan validam acesso ao processo antes
  de salvar input, upload, linhas manuais, executar exportacao ou decidir
  exportacao.
- [ ] `Sector::check_permission()` lida com formatos validos de
  `associated_sector` sem warnings e com retorno previsivel.
- [ ] Um usuario sem a capability necessaria recebe 403 tanto pela UI quanto por
  chamada REST direta.
- [ ] Um usuario nao autenticado recebe 401 ou erro REST equivalente.
- [ ] Menus e dados localizados no frontend refletem a matriz de permissao
  efetiva do backend.
- [ ] Textos novos usam o text domain `obatala` e os catalogos sao atualizados
  quando aplicavel.
- [ ] O comportamento anterior permanece compativel para usuarios autorizados.
- [ ] As validacoes aplicaveis terminam sem erros.

## Plano de validacao

### Automatizada

- [ ] `php -l classes/Security/Roles.php`
- [ ] `php -l classes/Entities/Sector.php`
- [ ] `php -l classes/Api/ProcessApi.php`
- [ ] `php -l classes/Api/ProcessTypeApi.php`
- [ ] `php -l classes/Api/SectorApi.php`
- [ ] `php -l classes/Api/ExporterApi.php`
- [ ] `composer test`
- [ ] `npm run lint:js`
- [ ] `npm run build`
- [ ] Testes unitarios novos ou atualizados para helpers de permissao, quando
  viavel sem bootstrap completo do WordPress.

### Manual

| Cenario | Perfil e pre-condicoes | Passos | Resultado esperado |
| --- | --- | --- | --- |
| Usuario sem login | Nao autenticado | Chamar rota REST de processo | Resposta 401/403 sem dados sensiveis |
| Usuario sem capability Obatala | Usuario WP comum sem capabilities Obatala | Acessar menus e chamar rotas REST | Menus ausentes e rotas bloqueadas |
| Gestor de grupos | Usuario com `obatala_manage_groups` | Criar setor e associar usuario | Operacao concluida |
| Usuario sem gestor de grupos | Usuario com `obatala_access`, sem `obatala_manage_groups` | Chamar rotas de setor | Resposta 403 |
| Gestor de modelos | Usuario com `obatala_manage_models` | Editar `flowData` de modelo | Modelo salvo |
| Usuario sem gestor de modelos | Usuario com acesso ao Obatala, sem `obatala_manage_models` | Chamar update de modelo via REST | Resposta 403 |
| Comentario sem impersonacao | Usuario A e Usuario B no mesmo processo | Usuario A tenta comentar enviando `user_id` de B | Comentario fica como A ou requisicao e rejeitada |
| Editar comentario alheio | Usuario A tenta editar comentario de B | Chamar PUT do comentario | Resposta 403 |
| Avancar etapa permitida | Usuario com `obatala_advance_stages` e setor da etapa | Avancar node | Node avanca |
| Avancar etapa sem setor | Usuario com capability, mas sem setor do processo | Avancar node | Resposta 403 |
| Relatorio permitido | Usuario com `obatala_report_generate` e acesso ao processo | Gerar PDF | PDF gerado |
| Relatorio sem acesso | Usuario sem setor do processo | Gerar PDF | Resposta 403 |
| Exportacao operacional permitida | Usuario autorizado no processo | Salvar input e executar exportacao | Operacao permitida |
| Exportacao operacional bloqueada | Usuario sem acesso ao processo | Chamar execute/decision | Resposta 403 |
| Administrador | Administrador WP/Obatala sem setor associado | Acessar processos, modelos, grupos e mapeadores | Acesso completo |

## Documentacao afetada

- [ ] `README.md`
- [ ] `readme.txt`
- [x] `mk-docs/docs/`
- [ ] Nenhuma; justificativa:

Documentar a matriz de permissoes em `mk-docs/docs/` e revisar README/readme.txt
somente se a mudanca alterar requisitos de instalacao, operacao ou papeis
publicamente descritos.

## Riscos, dependencias e questoes em aberto

- **Riscos:** bloquear usuarios que hoje dependem de permissoes amplas de
  `edit_posts`; revelar inconsistencias antigas em `associated_sector`; exigir
  ajuste de testes manuais com varios perfis.
- **Dependencias:** WordPress com usuarios/roles configurados; Tainacan ativo para
  validar exportacao e itens; dados reais ou fixtures com processos, modelos,
  setores e comentarios.
- **Questoes em aberto:**
  - `edit_posts` deve continuar como fallback de acesso ao Obatala ou deve ser
    removido de `can_access_obatala()`?
  - Autores devem poder avancar etapas ou somente comentar/gerenciar processos?
  - Administradores devem ignorar sempre a checagem de setor?
  - Operacoes de exportacao operacional devem exigir somente acesso ao processo
    ou tambem uma capability dedicada?
  - Usuarios com `obatala_manage_processes` devem ver todos os processos ou
    somente os de seus setores?

## Registro da implementacao

Preencher durante ou apos a implementacao:

- Arquivos principais alterados:
- Decisoes tomadas:
- Criterios atendidos:
- Validacoes executadas e resultados:
- Limitacoes ou itens pendentes:
