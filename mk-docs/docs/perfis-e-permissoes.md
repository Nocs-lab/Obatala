# Perfis e permissões

O Tainacan Processos usa os perfis **Tainacan Administrator** e **Tainacan
Editor** como perfis principais e cria somente um perfil adicional: **Tainacan
Participant**. As permissões do plugin usam o prefixo
`tainacan_processes_`.

Toda essa integração é implementada no plugin Obatalá/Tainacan Processos. O
plugin não altera arquivos do Tainacan, não renomeia seus perfis e não adiciona,
remove ou redefine capabilities nativas `tnc_*`.

## Resumo dos perfis

| Perfil | Direitos no Tainacan Processos |
| --- | --- |
| Administrador WordPress | Acesso completo; ignora restrições de grupo |
| Tainacan Administrator | Acesso completo; ignora restrições de grupo |
| Tainacan Editor | Cria e edita processos autorizados, atua nas etapas do seu grupo, comenta, gera relatórios e executa exportações |
| Tainacan Participant | Visualiza processos dos seus grupos, preenche e avança a etapa atual do seu grupo, comenta e gera relatórios |
| Tainacan Author | Nenhum direito automático no Tainacan Processos; mantém apenas as permissões nativas do Tainacan |

O papel **Tainacan Participant**, de slug
`tainacan-processes-participant`, é o único perfil adicional criado pelo
Obatalá. O **Tainacan Author** continua aparecendo na lista de perfis porque
pertence ao Tainacan, mas não é usado como perfil operacional do Tainacan
Processos.

!!! important "Quem pode criar modelos?"
    Somente **Administrador WordPress** e **Tainacan Administrator** podem
    criar, editar ou excluir modelos de processo. **Tainacan Editor** cria e
    edita processos baseados em modelos existentes, mas não administra os
    modelos. **Tainacan Participant** e **Tainacan Author** também não criam
    modelos.

## Matriz de capabilities

| Capability | Administradores | Tainacan Editor | Tainacan Participant | Tainacan Author |
| --- | :---: | :---: | :---: | :---: |
| `tainacan_processes_access` | Sim | Sim | Sim | Não |
| `tainacan_processes_manage` | Sim | Sim | Não | Não |
| `tainacan_processes_advance_stages` | Sim | Sim | Sim | Não |
| `tainacan_processes_manage_comments` | Sim | Sim | Sim | Não |
| `tainacan_processes_generate_reports` | Sim | Sim | Sim | Não |
| `tainacan_processes_execute_exports` | Sim | Sim | Não | Não |
| `tainacan_processes_manage_models` | Sim | Não | Não | Não |
| `tainacan_processes_delete_models` | Sim | Não | Não | Não |
| `tainacan_processes_manage_groups` | Sim | Não | Não | Não |
| `tainacan_processes_manage_mappings` | Sim | Não | Não | Não |
| `tainacan_processes_manage_settings` | Sim | Não | Não | Não |
| `tainacan_processes_delete_processes` | Sim | Não | Não | Não |

Nesta tabela, **Administradores** inclui Administrador WordPress e Tainacan
Administrator. Ter uma capability funcional não elimina as verificações de
grupo descritas a seguir.

## Grupos e contexto

O perfil define **o que** uma pessoa pode fazer. Os grupos definem **onde** ela
pode atuar:

1. pertencer a um grupo presente no fluxo concede acesso ao processo;
2. pertencer ao grupo da etapa atual permite preencher e avançar essa etapa;
3. pertencer a outro grupo do mesmo processo permite visualizar, mas não atuar
   na etapa atual;
4. administradores WordPress e Tainacan possuem acesso global documentado.

Um usuário pode participar de vários grupos, independentemente de possuir um
único perfil principal. As associações continuam salvas em
`associated_sector`; os grupos continuam em `obatala_setores` e a atribuição da
etapa continua em `sector_obatala`.

## Atribuição dos perfis

Use a tela padrão **Usuários** do WordPress para escolher o perfil principal:

- use **Tainacan Administrator** para quem administra modelos, grupos,
  mapeamentos e configurações;
- use **Tainacan Editor** para quem cria e conduz processos, sem administrar
  modelos;
- use **Tainacan Participant** para quem apenas atua nas etapas dos seus grupos;
- não use **Tainacan Author** para conceder acesso ao Tainacan Processos.

Depois de escolher o perfil, associe editores e participantes aos grupos
correspondentes na área de grupos do Tainacan Processos. Somente o perfil não
concede acesso a processos fora desses grupos.

## Migração dos perfis antigos

Na primeira carga após a atualização, a migração versionada converte os perfis
antigos:

```text
obatala_administrator -> tainacan-administrator
obatala_editor        -> tainacan-editor
obatala_author        -> tainacan-processes-participant
```

As metas dos usuários, inclusive seus grupos, não são alteradas. Usuários dos
perfis legados são transferidos para o perfil de destino antes da remoção dos
papéis antigos. Concessões diretas são convertidas para o perfil equivalente e
depois removidas, para que a autorização dependa dos perfis aprovados.

Os papéis `obatala_administrator`, `obatala_editor` e `obatala_author`, assim
como todas as capabilities `obatala_*`, são removidos ao final da migração. Eles
não funcionam como alternativa ou fallback às capabilities novas.

A migração atual tem versão `3`. O resultado resumido fica na option
`tainacan_processes_roles_migration_report`; a versão aplicada fica em
`tainacan_processes_roles_version`.

Após a migração, a lista relacionada ao Tainacan deve conter **Tainacan
Administrator**, **Tainacan Editor**, **Tainacan Author** e **Tainacan
Participant**. Os três primeiros pertencem ao Tainacan; apenas o último é criado
pelo Obatalá.
