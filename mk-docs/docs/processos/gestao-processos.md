# Gestão de processos

Este documento descreve funcionalidades da tela **Processos** (`process-manager`) e o comportamento da API REST relacionado a instâncias de processo (`process_obatala`).

---

## Visão geral

Cada processo é um post do tipo `process_obatala`, criado a partir de um modelo (`process_type`). Na listagem administrativa o usuário pode:

- Visualizar, editar metadados gerais e abrir o **visualizador de processo**
- Consultar o **histórico** de etapas
- **Gerar relatório PDF** do processo (requer Dompdf via `composer install`)
- **Excluir** o processo (exclusão lógica)

A interface React está em `src/admin/components/ProcessManager.js` e `ProcessList.js`. Os dados são carregados pela REST API em `/obatala/v1/process_obatala`.

---

## Exclusão lógica

A exclusão de processos **não remove** o post do WordPress. O registro permanece no banco para auditoria e possível recuperação futura.

### Comportamento na interface

1. O usuário clica no botão de exclusão (ícone de lixeira) na coluna **Ações**
2. Um diálogo de confirmação é exibido
3. Após confirmar, o processo desaparece da listagem, do dashboard e das consultas REST padrão
4. URLs diretas para processos excluídos retornam **404** na API

### Metadados registrados

| Meta | Tipo | Descrição |
|------|------|-----------|
| `is_deleted` | string (`0` / `1`) | Indica exclusão lógica |
| `deleted_at` | string (datetime MySQL) | Data e hora da exclusão |
| `deleted_by` | integer | ID do usuário WordPress que excluiu |
| `deleted_by_name` | string | Nome exibido do usuário no momento da exclusão |

O nome do usuário é gravado explicitamente para preservar o histórico mesmo que a conta seja removida depois.

### Implementação (PHP)

- Classe `Obatala\Entities\Process`:
  - `Process::is_deleted( $process_id )`
  - `Process::soft_delete( $process_id, $user_id = null )`
  - `Process::get_deletion_info( $process_id )`
- `CustomPostTypeApi::soft_delete_process()` intercepta `DELETE /obatala/v1/process_obatala/{id}`
- Listagens e leitura individual filtram processos com `is_deleted = 1`
- A rota genérica `POST /process_obatala/{id}/meta` **ignora** alterações nos campos de exclusão (proteção contra bypass)

### API REST

**Excluir processo (soft delete)**

```http
DELETE /wp-json/obatala/v1/process_obatala/{id}
```

Resposta de sucesso (`200`):

```json
{
  "deleted": true,
  "id": 22,
  "message": "Process deleted successfully.",
  "deleted_at": "2026-05-29 14:30:00",
  "deleted_by": 1,
  "deleted_by_name": "Admin"
}
```

Erros comuns:

| Código | Situação |
|--------|----------|
| `404` | Processo inexistente |
| `410` | Processo já excluído |
| `401` | Usuário não autenticado (impossível registrar quem excluiu) |

!!! note "Recuperação"
    Não há interface administrativa para restaurar processos excluídos. A recuperação exige alteração manual dos metadados no banco ou implementação futura de um endpoint de restauração.

---

## Relatório PDF

O botão **Gerar relatório PDF** na listagem chama:

```http
GET /wp-json/obatala/v1/process_obatala/{id}/report-pdf
```

A geração é feita por `classes/Report/ProcessReportPdf.php` com **Dompdf**. Se a biblioteca não estiver instalada, a API retorna erro traduzível.

---

## Internacionalização

Mensagens de exclusão, confirmação e er relacionados usam o domínio `obatala` em PHP e React. Após adicionar ou alterar strings, atualize os arquivos em `languages/` — veja [Internacionalização](../internacionalizacao.md).

Strings principais (inglês no código):

- `Process deleted successfully.`
- `Error deleting process.`
- `Are you sure you want to delete process %s?`
- `Delete process`
- `Process not found.`
- `Process already deleted.`
