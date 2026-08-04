# Unificar a edição do modelo e o mapeamento de exportação para o Tainacan

## Metadados

- **Status:** Em validação
- **Responsável:** Equipe Obatalá
- **Data:** 2026-08-04
- **Issue/PR:** Não informado
- **Versão alvo:** Não informada

## Contexto e problema

A edição das etapas de um modelo de processo e a configuração de exportação
para o Tainacan eram apresentadas em telas distintas. Na listagem de modelos, o
usuário acessava o editor de etapas pela ação **Gerenciar etapas** e o mapeador
por uma ação separada, **Editar dados de exportação**.

Essa separação dificultava visualizar a relação entre cada campo de uma etapa e
o metadado de destino no Tainacan. Também permitia que o fluxo fosse alterado sem
que o mapeamento fosse revisado no mesmo contexto.

A alteração unifica essas atividades na tela do editor do modelo de processo. A
configuração geral da exportação passa a ficar junto ao fluxo, e o mapeamento de
cada campo passa a ser feito no mesmo drawer usado para editar esse campo.

## Objetivo

Permitir que um usuário autorizado configure as etapas, ative ou desative a
exportação para o Tainacan, selecione as coleções de destino e associe os campos
do Obatalá aos metadados do Tainacan sem sair da tela **Editar modelo de processo**.

Ao salvar o modelo, o fluxo e a configuração de mapeamento devem ser persistidos
como uma única ação da interface.

## Fora do escopo

- Alterar o processo de exportação de instâncias já concluídas.
- Alterar o formato persistido de `_obatala_mapping_data`.
- Substituir ou versionar os endpoints REST existentes do exportador.
- Remover imediatamente a página legada `mappers` ou o componente
  `MappersManager`; eles permanecem disponíveis para compatibilidade.
- Redesenhar o editor completo do fluxo ou os formulários gerais do modelo.
- Criar uma transação atômica entre a gravação do fluxo e a gravação do
  mapeamento.

## Perfis e permissões

| Perfil/ator | Pode visualizar | Pode executar | Capability necessária |
| --- | --- | --- | --- |
| Administrador do Obatalá / WordPress | Editor do modelo e configuração Tainacan | Editar etapas, configurar e salvar mapeamentos | `obatala_manage_models` e `obatala_manage_mappers` |
| Usuário que gerencia modelos, mas não mapeadores | Editor do modelo sem controles Tainacan | Editar e salvar somente o modelo | `obatala_manage_models` |
| Usuário sem permissão para modelos | Não deve acessar o editor | Nenhuma dessas operações | Sem `obatala_manage_models` |

A disponibilidade dos controles de mapeamento no frontend deve ser derivada da
capability `obatala_manage_mappers`, exposta em `window.obatalaApp` como
`can_manage_mappers`. Os endpoints REST continuam responsáveis pela autorização
efetiva; ocultar um controle no frontend não substitui a verificação no servidor.

## Comportamento funcional

### Fluxo principal

1. Dado um usuário com permissão para gerenciar modelos e mapeadores, quando ele
   seleciona **Gerenciar modelo** na listagem, então o sistema abre o editor de
   etapas do modelo.
2. No editor, o usuário aciona **Tainacan Export** para expandir ou recolher o
   painel de configuração.
3. No painel, o usuário ativa o mapeador e seleciona uma ou mais coleções de
   destino do Tainacan.
4. Ao criar ou editar um campo de uma etapa, o drawer apresenta os controles
   **Coleção de destino** e **Metadado de destino**.
5. O usuário pode associar o campo a um metadado de uma das coleções selecionadas
   ou escolher não mapear o campo.
6. O resumo ao final do editor mostra, por coleção, as associações entre campos
   do Obatalá e metadados do Tainacan.
7. Ao selecionar **Salvar alterações**, o sistema remove fields técnicos legados
   do modelo, salva o fluxo e salva a configuração do mapeador.
8. Em cada processo criado com um mapeamento ativo, um painel virtual coleta as
   decisões operacionais de exportação sem alterar as etapas do fluxo.

### Estados e variações

- **Carregamento:** enquanto coleções e mapeamento salvo são carregados, o painel
  apresenta um indicador de progresso.
- **Exportação desativada:** os seletores de coleção, controles por campo e resumo
  ficam ocultos; o fluxo continua editável.
- **Sem coleção:** ao ativar o mapeador sem selecionar uma coleção, o painel
  apresenta um aviso e o salvamento da configuração não deve prosseguir.
- **Sem mapeamentos:** o resumo da coleção informa que nenhum campo foi mapeado.
- **Sem capability do mapeador:** o editor de etapas permanece utilizável, mas o
  botão, o painel, os controles por campo e o resumo Tainacan não são exibidos.
- **Sucesso:** a notificação do editor informa que o modelo foi salvo.
- **Falha de carregamento:** a tela informa que não foi possível carregar a
  configuração do Tainacan sem impedir silenciosamente a edição do fluxo.
- **Falha de salvamento:** o erro deve ser apresentado ao usuário e o editor deve
  permanecer aberto para correção ou nova tentativa.

### Casos excepcionais

- Uma URL legada no formato `?page=mappers&process_type_id=<id>` deve redirecionar
  para `?page=process-type-editor&process_type_id=<id>&section=export`.
- Ao abrir o editor com `section=export`, o painel Tainacan deve iniciar expandido.
- Ao excluir um campo do fluxo, qualquer mapeamento associado a seu identificador
  deve ser removido do estado da configuração.
- Ao adicionar um campo, seu drawer de configuração deve abrir automaticamente,
  permitindo configurar o campo e o mapeamento no mesmo fluxo.
- Processos legados podem continuar lendo os fields de controle existentes, mas
  novos modelos não devem criá-los ou sincronizá-los no `flowData`.

## Regras de negócio

1. Um mapeamento relaciona um campo do Obatalá a um metadado de uma coleção do
   Tainacan.
2. Somente coleções selecionadas na configuração geral podem ser usadas no
   mapeamento de campos.
3. Cada perfil de exportação representa uma coleção de destino e contém seus
   `field_mappings`.
4. O mapeador habilitado exige ao menos um perfil/coleção de destino.
5. A remoção de uma coleção selecionada remove seu perfil do estado que será
   persistido.
6. A remoção de um campo remove sua associação de todos os perfis.
7. O status persistido deve continuar usando `enabled` ou `disabled`.
8. A escolha de perfil e as decisões operacionais devem ser persistidas em
   `_obatala_tainacan_export_input` para cada processo.
9. O identificador legado `obatala_ctrl_collection_selector` deve continuar
   reconhecido somente para compatibilidade com processos existentes.
10. Os dados existentes em `decision_rules` que não forem substituídos pela tela
   unificada devem ser preservados no salvamento.
11. A tela legada não deve criar uma segunda configuração; ambas as interfaces
    devem ler e gravar o mesmo metadado do modelo.

## Experiência e interface

- A ação principal da listagem deve usar o rótulo **Gerenciar modelo**, pois a
  tela passa a abranger etapas e exportação.
- A ação isolada **Editar dados de exportação** deve ser removida da listagem.
- O botão **Tainacan Export** deve ficar junto aos controles do fluxo e indicar
  visualmente seu estado expandido.
- O painel expandido deve apresentar status do mapeador, coleções de destino e
  aviso quando nenhuma coleção estiver selecionada.
- O mapeamento deve aparecer dentro do formulário de edição de cada tipo de campo
  suportado pelo editor.
- O resumo deve permitir alternar entre as coleções selecionadas e mostrar uma
  tabela **Campo Obatalá × Metadado Tainacan**.
- Em telas estreitas, cabeçalho e seletor do resumo devem se reorganizar
  verticalmente.
- O drawer de campos deve respeitar a altura disponível e permitir rolagem.

## Internacionalização

- O novo rótulo **Manage model** deve usar `@wordpress/i18n` com o text domain
  `obatala` e possuir traduções em português e espanhol.
- Todos os demais textos novos do painel, controles por campo, resumo, avisos e
  erros também devem usar `@wordpress/i18n`; textos literais remanescentes devem
  ser convertidos antes de considerar esta spec concluída.
- Após ajustar as mensagens, devem ser atualizados `languages/obatala.pot`, os
  arquivos PO/MO e os JSON de tradução do bundle administrativo.

## Especificação técnica

### Backend PHP

- `classes/Admin/Enqueuer.php` deve expor `can_manage_mappers` ao bundle usando o
  resultado de `current_user_can('obatala_manage_mappers')`.
- A implementação deve reutilizar `Obatala\Api\ExporterApi` e
  `Obatala\Services\TainacanMappingService`; não é necessário criar uma nova
  estrutura de persistência.
- A capability que protege a página de edição do modelo continua sendo
  `obatala_manage_models`.
- As rotas de mapeamento devem continuar protegidas no servidor por uma
  `permission_callback` compatível com `obatala_manage_mappers`.

### API REST

| Campo | Definição |
| --- | --- |
| Método e rota | `GET obatala/v1/exporter/all_collections_tainacan` |
| Capability | Estado atual: `permission_check_edit_posts`; requisito desta spec: `obatala_manage_mappers` |
| Parâmetros | Nenhum |
| Corpo | Não aplicável |
| Resposta de sucesso | Coleções Tainacan disponíveis |
| Respostas de erro | Erro REST quando a consulta não puder ser executada |
| Compatibilidade | Endpoint existente, sem alteração de contrato |

| Campo | Definição |
| --- | --- |
| Método e rota | `GET obatala/v1/exporter/get_metadata_collection/<collection_id>` |
| Capability | Estado atual: `permission_check_edit_posts`; requisito desta spec: `obatala_manage_mappers` |
| Parâmetros | Identificador da coleção |
| Corpo | Não aplicável |
| Resposta de sucesso | Metadados da coleção selecionada |
| Respostas de erro | Coleção inválida, inacessível ou erro de consulta |
| Compatibilidade | Endpoint existente, sem alteração de contrato |

| Campo | Definição |
| --- | --- |
| Método e rota | `GET obatala/v1/exporter/get_mapper_process_type/<process_model_id>` |
| Capability | Estado atual: `permission_check_edit_posts`; requisito desta spec: `obatala_manage_mappers` |
| Parâmetros | Identificador do modelo de processo |
| Corpo | Não aplicável |
| Resposta de sucesso | `mapping_data` previamente persistido |
| Respostas de erro | Modelo inválido ou acesso negado |
| Compatibilidade | Endpoint existente, incluindo dados legados normalizados pelo serviço |

| Campo | Definição |
| --- | --- |
| Método e rota | `POST obatala/v1/exporter/save_mapping_data` |
| Capability | Estado atual: `permission_check_edit_posts`; requisito desta spec: `obatala_manage_mappers` |
| Parâmetros | Não aplicável |
| Corpo | `process_model_id` e `mappings` com `status`, `profiles`, `profile_selector_field_id` e `decision_rules` |
| Resposta de sucesso | Objeto com `success: true` e mensagem |
| Respostas de erro | Modelo, coleção, perfil, campo ou regra de decisão inválida |
| Compatibilidade | Mantém a persistência em `_obatala_mapping_data` |

### Frontend React

- `ProcessModelEditor` deve hospedar um `TainacanExportProvider` dentro do
  `FlowProvider` e coordenar o salvamento do fluxo com o mapeamento.
- `TainacanExportContext` deve carregar coleções e configuração salva, controlar
  status, perfis e metadados, remover fields técnicos legados do `flowData` e
  expor a operação de salvar.
- `TainacanExportPanel` deve controlar ativação e coleções de destino.
- `TainacanFieldMappingControls` deve ser incorporado aos formulários de campos
  `text`, `email`, `textarea`, `number`, `datepicker`, `upload`,
  `stage_document`, `select`, `radio` e `search`.
- `TainacanMappingSummary` deve derivar os nomes atuais dos campos a partir dos
  nós do `FlowContext` e apresentar os mapeamentos da coleção selecionada.
- `MappersManager` deve continuar aceitando o modo independente e também oferecer
  propriedades para uso embutido, preservando compatibilidade durante a transição.
- `App.js` deve redirecionar URLs legadas que possuam `process_type_id`.

### Persistência e migração

- O fluxo continua persistido em `meta.flowData` do modelo de processo.
- O mapeamento continua persistido no post meta `_obatala_mapping_data`.
- Não há migração obrigatória de banco de dados nesta alteração.
- Configurações existentes devem ser carregadas pela tela unificada sem exigir
  novo salvamento prévio.
- A normalização existente de formatos legados deve ser preservada.
- Como fluxo e mapeamento são salvos por requisições distintas, uma falha na
  segunda requisição pode ocorrer depois de o fluxo ter sido persistido. A
  interface deve comunicar essa falha; atomicidade fica fora do escopo atual.

### Segurança e privacidade

- A página do editor exige `obatala_manage_models`.
- Os controles Tainacan somente são apresentados quando
  `can_manage_mappers` for verdadeiro.
- As rotas REST de leitura e gravação do mapeador devem validar a capability no
  servidor independentemente da interface.
- Identificadores do modelo, coleção, campos e metadados devem ser validados e
  normalizados antes de persistir.
- Não são introduzidos novos dados pessoais; os dados tratados são configurações
  do modelo e referências a entidades do Tainacan.

## Compatibilidade

- **WordPress 5.7+:** preservar as APIs e o processo de build atualmente usados.
- **Tainacan:** requer plugin ativo e repositórios de coleções/metadados
  disponíveis.
- **Contratos REST existentes:** reutilizados sem renomear rotas ou propriedades.
- **Dados e configurações existentes:** continuar lendo `_obatala_mapping_data`
  e preservando regras de decisão não editadas pela nova interface.
- **Navegadores ou dispositivos relevantes:** painel administrativo responsivo no
  breakpoint WordPress de 782 px; demais requisitos não foram informados.

## Critérios de aceite

- [x] A listagem oferece uma única ação **Gerenciar modelo** para abrir o editor
  de etapas e exportação.
- [x] A ação separada **Editar dados de exportação** foi removida da listagem.
- [x] Usuários com `obatala_manage_mappers` podem expandir o painel
  **Tainacan Export** no editor do modelo.
- [x] O painel permite ativar/desativar o mapeador e selecionar uma ou mais
  coleções de destino.
- [x] O drawer de cada tipo de campo suportado permite selecionar coleção e
  metadado de destino.
- [x] A remoção de um campo remove seu mapeamento do estado a ser salvo.
- [x] O editor apresenta um resumo do mapeamento por coleção.
- [x] O comando de salvar do editor aciona a persistência do fluxo e do
  mapeamento.
- [x] URLs legadas do mapeador com um modelo identificado redirecionam para o
  editor unificado com o painel de exportação aberto.
- [x] Usuários sem `obatala_manage_mappers` não veem os controles Tainacan no
  editor do modelo.
- [x] Novos modelos não persistem os fields técnicos `obatala_ctrl_*` nas etapas.
- [x] A preparação operacional é persistida por processo em
  `_obatala_tainacan_export_input`.
- [x] Uma configuração sem fields mapeados é salva como `draft`, não como ativa.
- [x] Processos legados continuam podendo ler valores dos antigos fields de controle.
- [x] Todos os textos novos usam `@wordpress/i18n` com o text domain `obatala`.
- [x] As rotas de configuração do mapeador exigem `obatala_manage_mappers` no
  servidor, em vez da permissão genérica `permission_check_edit_posts`.
- [ ] Entradas e falhas dos endpoints foram verificadas com perfis autorizado e
  não autorizado em uma instalação WordPress com Tainacan.
- [ ] O fluxo anterior permanece funcional quando o mapeador está desativado.
- [ ] O lint global e os testes PHPUnit aplicáveis terminam sem erros.

Os itens marcados como concluídos acima possuem evidência na implementação
atual. Eles ainda devem ser confirmados pelos testes manuais antes de mudar o
status desta spec para **Concluída**.

## Plano de validação

### Automatizada

- [ ] `npm run lint:js`
- [x] `npm run build`
- [x] `php -l classes/Admin/Enqueuer.php`
- [ ] `composer test`
- [ ] Executar a geração dos catálogos depois de internacionalizar todos os
  textos novos.

`composer test` não cobre diretamente esta interface; deve ser executado como
regressão do backend existente.

### Manual

| Cenário | Perfil e pré-condições | Passos | Resultado esperado |
| --- | --- | --- | --- |
| Abrir editor unificado | Administrador; Tainacan ativo; modelo existente | Abrir Modelos e selecionar **Gerenciar modelo** | Editor exibe fluxo e botão **Tainacan Export**, sem a antiga ação separada |
| Configurar coleção | Administrador; coleção Tainacan existente | Expandir painel, ativar mapeador e selecionar a coleção | Coleção permanece selecionada e seus metadados ficam disponíveis nos campos |
| Mapear campo | Administrador; mapeador ativo e coleção selecionada | Editar um campo e selecionar coleção e metadado | Associação aparece no resumo da coleção |
| Salvar e recarregar | Administrador; mapeamento válido | Salvar, sair e reabrir o mesmo modelo | Fluxo, status, coleções e mapeamentos são restaurados |
| Excluir campo mapeado | Administrador; campo previamente mapeado | Excluir o campo, salvar e recarregar | Campo não aparece no fluxo nem no mapeamento persistido |
| Mapeador sem coleção | Administrador | Ativar mapeador sem selecionar coleção e tentar salvar | Aviso é exibido e configuração inválida não é salva |
| Usuário sem capability | Usuário com `obatala_manage_models`, sem `obatala_manage_mappers` | Abrir e salvar o editor | Controles Tainacan não aparecem e o fluxo pode ser editado sem sobrescrever o mapeamento |
| URL legada | Administrador; URL `?page=mappers&process_type_id=<id>` | Acessar a URL | Navegador redireciona ao editor do modelo com `section=export` |
| Responsividade | Administrador; viewport menor ou igual a 782 px | Abrir painel e resumo | Conteúdo permanece legível e o cabeçalho do resumo fica vertical |

## Documentação afetada

- [ ] `README.md`
- [ ] `readme.txt`
- [x] `mk-docs/docs/`
- [x] Documentar que exportação, mapeamento e preparação operacional não usam
  fields técnicos nas etapas.

## Riscos, dependências e questões em aberto

- **Riscos:** falha parcial ao salvar fluxo e mapeamento em requisições
  separadas; textos ainda não internacionalizados; rotas do mapeador atualmente
  protegidas por uma permissão mais ampla que `obatala_manage_mappers`;
  mapeamentos obsoletos caso um campo seja alterado por importação de fluxo em
  vez de removido pela interface.
- **Dependências:** Tainacan ativo; endpoints de coleções e metadados; capability
  `obatala_manage_mappers`; `@wordpress/api-fetch`, `@wordpress/components` e
  `react-select`.
- **Questões em aberto:** definir se a página/componente legado do mapeador será
  removido em versão futura; definir o comportamento desejado quando salvar o
  fluxo tem sucesso e salvar o mapeamento falha; decidir se campos mapeados devem
  poder apontar simultaneamente para metadados de mais de uma coleção pela nova
  interface.

## Registro da implementação

- **Arquivos principais alterados:** `classes/Admin/Enqueuer.php`,
  `src/admin/App.js`, `src/admin/components/ProcessModelEditor.js`,
  `src/admin/components/MappersManager.js`,
  `src/admin/components/ProcessTypeManager.js`,
  `src/admin/components/ProcessTypeManager/ProcessTypeList.js`, componentes e
  contexto Tainacan em `src/admin/components/FlowEditor/`, `css/style.css`,
  `css/react-flow.css` e catálogos em `languages/`.
- **Decisões tomadas:** reutilizar endpoints e persistência existentes; controlar
  a visibilidade pelo capability localizado no bootstrap do frontend; incorporar
  o mapeamento aos drawers dos campos; preservar e redirecionar a entrada legada.
- **Critérios atendidos:** integração estrutural e comportamentos assinalados na
  seção de critérios de aceite.
- **Validações executadas e resultados:** build concluído com avisos de tamanho
  do bundle; sintaxe PHP validada nos arquivos alterados; catálogos MO/JSON
  compilados para `pt_BR` e `es_ES`. O lint global permanece bloqueado por erros
  preexistentes e o PHPUnit não está instalado em `vendor/bin`.
- **Limitações ou itens pendentes:** completar testes manuais com WordPress e
  Tainacan, instalar dependências de desenvolvimento do Composer para executar
  PHPUnit e tratar separadamente o passivo de lint do repositório.
