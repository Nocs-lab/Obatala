# Implementação: Geração de relatório em PDF da listagem de processos

## Resumo

Foi implementada a funcionalidade de **gerar relatório em PDF** por processo a partir da tabela de listagem de processos. O botão **"Gerar relatório PDF"** (ícone de download) foi adicionado na coluna **Ações**. A geração do PDF é feita no **backend**; o frontend apenas chama o endpoint e dispara o download do arquivo.

---

## Arquivos alterados/criados

### 1. **composer.json**
- **Alteração:** Inclusão da dependência `dompdf/dompdf` (^2.0) para geração do PDF no PHP.
- **Ação necessária:** Executar `composer install` ou `composer update` na raiz do plugin para instalar a biblioteca.

### 2. **classes/Report/ProcessReportPdf.php** (novo)
- **Responsabilidade:** Serviço de montagem do relatório PDF.
- **Funções principais:**
  - `loadProcessData()`: Carrega post do processo, `flowData`, `stageData`, `submittedStages` e setores; calcula a ordem das etapas (respeitando condicionais quando há dados preenchidos).
  - `getOrderedSteps()`: Obtém a lista de etapas em ordem sequencial (exclui Start, End e nós condicionais da listagem; segue o fluxo e resolve condicionais a partir de `stageData`).
  - `buildHtml()`: Monta o HTML do relatório (cabeçalho, dados gerais, seções por etapa com campos preenchidos).
  - `formatFieldValue()`: Formata valor de campo (texto, data, upload, array, “Não informado”).
  - `generatePdfBinary()`: Usa Dompdf para gerar o binário do PDF a partir do HTML.
- **Estrutura do relatório:** Cabeçalho (título, processo, data/hora, usuário), tabela de dados gerais, para cada etapa: nome, ordem, status, responsável, última atualização, usuário e lista de campos preenchidos; rodapé com nome do sistema e data.

### 3. **classes/Api/ProcessApi.php**
- **Alteração:** Nova rota `GET /obatala/v1/process_obatala/(?P<id>\d+)/report-pdf`.
- **Callback `generate_report_pdf`:**
  - Valida usuário logado e permissão com `Sector::check_permission($user_id, $process_id)` (mesmo critério de acesso ao processo).
  - Instancia `ProcessReportPdf`, carrega dados, gera PDF.
  - Retorna JSON com `pdf` (base64) e `filename` para o frontend fazer o download (não envia dados sensíveis além do PDF gerado).

### 4. **src/admin/api/apiRequests.js**
- **Alteração:** Nova função `fetchProcessReportPdf(processId)` que chama o endpoint de relatório PDF e retorna a resposta (objeto com `pdf` e `filename`).

### 5. **src/admin/components/ProcessManager/ProcessList.js**
- **Alterações:**
  - Estados `pdfLoadingId` e `pdfError`.
  - Função `handlePdfDownload(processId)`: chama `fetchProcessReportPdf`, decodifica base64, cria `Blob`, dispara download e trata erros.
  - Novo botão na coluna Ações (ícone `download`, tooltip e texto “Generate PDF report”), com `isBusy`/`disabled` durante a geração.
  - Exibição de `Notice` de erro quando `pdfError` está preenchido.

---

## Suposições sobre o modelo de dados

- **Processo:** Post type `process_obatala`; metadados usados: `flowData` (nodes/edges), `stageData` (por node: `fields` com `fieldId`/`value`, `updateAt`, `user`), `submittedStages`, `current_stage`, `process_title`, `status`, `groupResponsible`, `access_level`.
- **Etapas:** Nós em `flowData.nodes` com `id`, `data.stageName`, `data.fields` (definição dos campos: `id`, `type`, `config.label`, `title`), `node_status`, `sector_obatala`. Nós “Start”, “End” e com `id` começando por “Condicional” não são listados como etapas de conteúdo; condicionais são usadas apenas para definir o fluxo.
- **Ordem das etapas:** Calculada no backend percorrendo o grafo a partir de “Start”, resolvendo condicionais com base em `stageData` do nó de entrada e na configuração da condicional (`outputNodes` / `conditionValue`). Se não houver valor preenchido que defina o ramo, usa-se o primeiro destino da condicional como fallback.
- **Setores:** Opção `obatala_setores` em JSON; chave é o ID do setor; valor contém `nome` (usado como “responsável” da etapa).
- **Permissão:** Apenas usuários que passam em `Sector::check_permission($user_id, $process_id)` podem gerar o relatório (consistente com comentários e outras ações no processo).

---

## Distribuição: reduzir dependência de Composer para usuários finais

O plugin continua usando **Composer no desenvolvimento** e em servidores onde é possível rodar CLI. Para **instalações sem Composer** (ex.: upload por ZIP na hospedagem):

1. **Pacotes oficiais (recomendado):** ao publicar uma release, rodar `composer install --no-dev --optimize-autoloader` na raiz do plugin e **incluir a pasta `vendor/` no ZIP** entregue aos usuários. Quem instala só o ZIP não precisa do Composer no servidor.
2. **Repositório Git:** `vendor/` permanece no `.gitignore`; desenvolvedores executam `composer install` localmente ou na pipeline.
3. **Interface:** quando o Dompdf não está disponível, o botão **“Gerar relatório PDF”** não é exibido na listagem (evita clique que falharia); permanece o aviso no admin Obatalá para quem tiver permissão, explicando a necessidade de dependências PHP.

---

## Como usar

1. **Backend:** Na raiz do plugin, executar `composer install` (ou `composer update`) para instalar o Dompdf — **ou** usar um pacote de release que já inclua `vendor/`.
2. **Frontend:** Rodar `npm run build` após alterações no JS.
3. Na tela de listagem de processos, na coluna **Ações**, clicar no botão com ícone de download (tooltip “Generate PDF report”), se o Dompdf estiver instalado. O PDF será gerado no servidor e o download será iniciado no navegador. Em caso de erro (permissão, processo não encontrado, falha na geração), uma mensagem é exibida acima da tabela.

---

## Requisitos atendidos

- Botão na coluna Ações da tabela de processos com rótulo/tooltip para gerar relatório PDF.
- Geração do PDF no backend; frontend apenas dispara a ação e baixa o arquivo.
- Endpoint REST com validação de autenticação e permissão (`Sector::check_permission`).
- Dados do processo, etapas e campos preenchidos obtidos no backend a partir do ID do processo.
- Retorno em JSON (base64 + filename) para download seguro no frontend.
- Separação: componente da tabela, ação do botão, serviço de API no frontend, endpoint no plugin, serviço de montagem do PDF (ProcessReportPdf).
- Padrão visual da coluna de ações (botão secundário com ícone); feedback de carregamento (isBusy/disabled); mensagem de erro amigável.
- Relatório organizado: cabeçalho, dados gerais, etapas em ordem, campos por etapa, formatação de valores e rodapé.
