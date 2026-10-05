# Gestão de processos

Este documento descreve funcionalidades da tela **Processos** (`process-manager`) e o comportamento da API REST relacionado a instâncias de processo (`process_obatala`).

---

## Visão geral

Cada processo é um post do tipo `process_obatala`, criado a partir de um modelo (`process_type`). Na listagem administrativa o usuário pode:

- Visualizar o **número único** do processo (formato `AAAA-NNNNN-DV`)
- Pesquisar por título ou por número (completo, parcial ou sem máscara)
- Visualizar, editar metadados gerais e abrir o **visualizador de processo**
- Consultar o **histórico** de etapas
- **Gerar relatório PDF** do processo (requer Dompdf via `composer install`)
- **Excluir** o processo (exclusão lógica)

A interface React está em `src/admin/components/ProcessManager.js` e `ProcessList.js`. Os dados são carregados pela REST API em `/obatala/v1/process_obatala`.

---

## Numeração única do processo

Todo processo criado recebe automaticamente um identificador no formato **`AAAA-NNNNN-DV`**.

| Parte | Significado | Exemplo |
|-------|-------------|---------|
| `AAAA` | Ano de criação (4 dígitos) | `2026` |
| `NNNNN` | Sequencial anual com zeros à esquerda (5 dígitos) | `00042` |
| `DV` | Dígito verificador (1 dígito) | `6` |

**Exemplo completo:** `2026-00042-6`

### Regra do dígito verificador (DV)

O DV é calculado a partir da base numérica **AAAANNNNN** (9 dígitos, sem hífen):

```
DV = soma dos dígitos de AAAANNNNN mod 10
```

Exemplo para `2026-00042`:

1. Base: `202600042`
2. Soma: `2 + 0 + 2 + 6 + 0 + 0 + 0 + 4 + 2 = 16`
3. DV: `16 % 10 = 6`
4. Número final: **`2026-00042-6`**

Outros exemplos:

| Número | Base | Soma | DV |
|--------|------|------|-----|
| `2026-00001` | `202600001` | 11 | 1 → `2026-00001-1` |
| `2026-00002` | `202600002` | 12 | 2 → `2026-00002-2` |
| `2027-00001` | `202700001` | 12 | 2 → `2027-00001-2` |

O sequencial **reinicia a cada ano**: o primeiro processo de 2027 será `2027-00001-2`, independentemente do último número de 2026.

### Metadados registrados

| Meta | Tipo | Descrição |
|------|------|-----------|
| `numero_processo` | string | Número formatado completo (`2026-00042-6`) |
| `ano_processo` | integer | Ano (`2026`) |
| `sequencial_processo` | integer | Sequencial anual (`42`) |
| `digito_verificador_processo` | integer | Dígito verificador (`6`) |

Esses campos são expostos na REST API (`show_in_rest`) e **não podem ser alterados** pelo cliente via `POST /process_obatala/{id}/meta` (proteção em `ProcessApi::update_meta()`).

### Persistência e unicidade

Além do `post_meta`, o plugin mantém duas tabelas customizadas (criadas em `classes/Database/ProcessNumberSchema.php`):

| Tabela | Função |
|--------|--------|
| `{prefix}obatala_process_sequence` | Contador atômico do último sequencial por ano |
| `{prefix}obatala_process_numbers` | Registro definitivo com constraints de unicidade |

Constraints na tabela de registro:

- **UNIQUE** `(ano_processo, sequencial_processo)` — impede duplicidade ano + sequencial
- **UNIQUE** `numero_processo` — impede número formatado duplicado
- **UNIQUE** `post_id` — um número por processo
- **INDEX** `numero_processo` — busca rápida por número

### Geração segura (concorrência)

A atribuição ocorre no **`POST /obatala/v1/process_obatala`**, interceptado por `CustomPostTypeApi::create_process_item()`:

1. Cria o post via REST padrão do WordPress
2. Chama `ProcessNumberService::assignToProcess( $post_id )`
3. Em caso de falha na numeração, o post recém-criado é removido (rollback)

Mecanismos de segurança:

- **`GET_LOCK`** MySQL por ano durante a geração
- Incremento atômico com `INSERT ... ON DUPLICATE KEY UPDATE` na tabela de sequência
- Inserção na tabela de registro com retry em colisão de constraint

Implementação: `classes/Services/ProcessNumberService.php`.

### Processos existentes (compatibilidade)

Processos criados antes desta funcionalidade **não possuem** `numero_processo` até serem numerados:

- Na **ativação** do plugin ou na **primeira execução** após upgrade, `ProcessNumberService::backfillMissingNumbers()` gera números retroativos usando o **ano de `post_date`** de cada processo, em ordem cronológica
- Na listagem, processos sem número exibem **“Sem numeração”**

Para forçar a criação das tabelas e o backfill, reative o plugin ou acesse o admin após atualizar o código.

### Interface — coluna e busca

Na tela **Processos** (`ProcessList.js`):

- Coluna **“Nº do processo”** exibe o valor formatado (ex.: `2026-00042-6`)
- O campo de busca aceita, além do título:
  - Número completo: `2026-00042-6`
  - Parte do sequencial: `00042`
  - Ano: `2026`
  - Número sem máscara: `2026000426`

A busca ignora hífens quando comparada por dígitos. Os filtros existentes (aba, nível de acesso, modelo) continuam funcionando em conjunto.

### API REST — filtro por número

Na listagem de processos, é possível filtrar pelo parâmetro `numero_processo`:

```http
GET /wp-json/obatala/v1/process_obatala?numero_processo=2026-00042
GET /wp-json/obatala/v1/process_obatala?numero_processo=00042
GET /wp-json/obatala/v1/process_obatala?numero_processo=2026000426
```

O filtro combina correspondência no número formatado **ou** no título do processo.

Resposta de criação (`POST`) inclui os metadados de numeração em `meta` após a atribuição automática.

### Testes

Testes unitários da regra de formatação, DV e busca:

```bash
php tests/run-process-number-tests.php
```

Com PHPUnit instalado via Composer:

```bash
composer test
```

Arquivos: `tests/ProcessNumberServiceTest.php`, `tests/run-process-number-tests.php`.

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
