# Documento textual por etapa

## Resumo

O componente **Documento da etapa** (`stage_document`) permite criar documentos textuais diretamente dentro de uma etapa do processo Obatalá. Ele é configurado na fase de modelagem do tipo de processo e fica disponível durante a execução da etapa.

O componente atende casos como parecer, relatório, despacho, termo, justificativa técnica ou outro documento produzido no fluxo do processo. O conteúdo pode ser formatado, exportado em PDF, assinado fora da plataforma e anexado novamente à mesma etapa.

---

## Modelagem do componente

- **Nome técnico:** `stage_document`
- **Nome na interface:** Documento da etapa
- **Local de configuração:** editor de fluxo/modelador de etapas
- **Estrutura:** `flowData.nodes[].data.fields`

Configurações disponíveis:

- título/rótulo do documento;
- tipo de documento;
- texto de ajuda;
- obrigatoriedade de preenchimento do conteúdo;
- exigência de upload do PDF assinado;
- texto modelo inicial para orientar ou padronizar o preenchimento.

O campo é definido no modelo do processo e copiado para a instância do processo junto com o restante do `flowData`.

---

## Editor de texto

Durante a execução da etapa, o usuário preenche o documento em um editor integrado ao formulário da etapa.

O editor permite:

- negrito;
- itálico;
- sublinhado;
- alinhamento à esquerda;
- centralização;
- alinhamento à direita;
- texto justificado;
- lista com marcadores;
- lista numerada;
- limpeza de formatação.

O conteúdo é salvo como HTML sanitizado. No backend, o Obatalá usa `wp_kses_post` antes de persistir o conteúdo em `stageData`.

Quando um texto modelo é configurado, ele aparece como conteúdo inicial do documento enquanto o usuário ainda não salvou ou editou o campo. O usuário pode alterar esse conteúdo antes de salvar rascunho ou enviar a etapa.

---

## Fluxo funcional

1. O modelador adiciona o campo **Documento da etapa** a uma etapa do modelo de processo.
2. O usuário responsável pela etapa redige e formata o documento durante a execução do processo.
3. O usuário pode salvar o conteúdo como rascunho, fechar a etapa e voltar depois para revisar ou continuar editando.
4. Ao salvar rascunho, o conteúdo é persistido em `stageData`, mas a etapa não é marcada como enviada e o fluxo não avança.
5. Ao submeter a etapa, o sistema valida os campos obrigatórios. Se o documento estiver marcado como obrigatório, o conteúdo precisa estar preenchido.
6. Na etapa submetida, o usuário pode gerar um PDF do documento.
7. O PDF pode ser assinado fora do Obatalá, por exemplo via GOV.BR, SEI ou outra ferramenta institucional.
8. O PDF assinado pode ser anexado de volta ao mesmo documento da mesma etapa.
9. O documento final assinado pode ser baixado diretamente pela etapa.

O botão **Enviar** fica habilitado quando as regras de obrigatoriedade da etapa estão atendidas:

- com **conteúdo obrigatório** ativo: o texto do documento precisa estar preenchido (HTML com conteúdo visível após remover tags);
- com **exigir upload do PDF assinado** ativo: o arquivo assinado precisa estar anexado antes do envio.

É possível salvar **rascunho** sem enviar a etapa; o rascunho grava `stageData` com `draftUpdateAt` e não marca a etapa como submetida.

---

## Progresso do processo e PDF assinado

O percentual de progresso exibido na lista de processos e no visualizador é calculado no backend (`ProcessApi::calculate_progress_percentage`).

Uma etapa só conta como concluída para o progresso quando:

1. o nó correspondente em `flowData` está com `node_status === 'Finished'`, **e**
2. todos os campos `stage_document` da etapa cumprem as regras configuradas no modelo (`required`, `requireSignedUpload`), com base nos dados em `stageData`.

Assim, se a etapa foi enviada mas o PDF assinado obrigatório ainda não foi anexado, o progresso **não** chega a 100%. Ao anexar o PDF assinado, o progresso é recalculado (incluindo na tela do processo, após o upload).

O status global do processo (`post_meta` `status = Finished`) ao atingir o nó **End** do fluxo também só é gravado quando o progresso calculado é 100%.

---

## Geração de PDF

A geração de PDF é feita no backend com **Dompdf** (instalado via Composer), pelo serviço `StageDocumentPdf`.

!!! warning "Dependência Composer"
    Sem `composer install` na pasta do plugin, a classe `\Dompdf\Dompdf` não existe e a API retorna erro 500 com orientação para executar o Composer. Veja [Instalação](../instalacao.md).

O PDF inclui:

- cabeçalho institucional do Obatalá;
- título do documento;
- tipo de documento, quando informado;
- nome do processo;
- nome da etapa;
- data de impressão/exportação;
- usuário responsável pela geração;
- conteúdo formatado do documento;
- rodapé com data e usuário.

Endpoint:

```text
GET /obatala/v1/process_obatala/{id}/stage-document-pdf?node_id={nodeId}&field_id={fieldId}
```

A resposta retorna o PDF em base64 e o nome sugerido do arquivo.

---

## PDF assinado

Depois de gerar o PDF, o usuário pode assiná-lo fora da plataforma. O arquivo assinado pode ser anexado novamente ao mesmo documento da etapa.

Quando a opção **exigir upload do PDF assinado** está ativa, a etapa exibe um aviso enquanto o documento assinado ainda não foi anexado.

Upload:

```text
POST /obatala/v1/process_obatala/{id}/stage-document-signed
```

Parâmetros enviados no `FormData`:

- `file`: PDF assinado;
- `node_id`: identificador da etapa;
- `field_id`: identificador do campo `stage_document`.

Download:

```text
GET /obatala/v1/process_obatala/{id}/stage-document-signed?node_id={nodeId}&field_id={fieldId}
```

Os PDFs assinados são armazenados em subdiretório por processo, etapa e campo:

```text
uploads/obatala/stage-documents/{processId}/{nodeId}/{fieldId}/
```

---

## Estrutura de dados

O valor do documento é salvo em `stageData[nodeId].fields[]`, dentro de `value`:

```json
{
  "fieldId": "node_stage_document-1",
  "value": [
    {
      "content": "<p><strong>Conteúdo textual</strong> do documento</p>",
      "status": "draft",
      "updatedAt": "2026-05-19T20:00:00.000Z",
      "generatedPdf": {
        "filename": "processo-documento-2026-05-19-170000.pdf",
        "generatedAt": "2026-05-19 17:00:00",
        "generatedBy": "Nome do usuário",
        "generatedById": 1
      },
      "signedFile": {
        "name": "20260519170500-documento-assinado.pdf",
        "originalName": "documento-assinado.pdf",
        "uploadedAt": "2026-05-19 17:05:00",
        "uploadedBy": "Nome do usuário",
        "uploadedById": 1,
        "sha256": "hash-do-arquivo"
      },
      "history": []
    }
  ]
}
```

---

## Sinalização visual

Na visualização do processo, a etapa exibe um badge quando possui documento associado.

Estados exibidos:

- rascunho salvo;
- rascunho do documento;
- PDF do documento gerado;
- documento assinado.

Essa sinalização permite identificar rapidamente quais etapas possuem documentos produzidos, exportados ou formalizados.

---

## Permissões e rastreabilidade

A geração de PDF e o upload/download do PDF assinado exigem usuário logado e acesso ao processo, validado por `Sector::check_permission`.

O documento registra metadados básicos de rastreabilidade:

- usuário e data do último rascunho salvo;
- usuário que gerou o PDF;
- data da geração;
- usuário que anexou o PDF assinado;
- data do upload;
- nome original do arquivo;
- hash SHA-256 do PDF assinado;
- eventos em `history`.

---

## Arquivos principais

- `src/admin/components/FlowEditor/components/reactFlow/NodeContent.js`
- `src/admin/components/FlowEditor/components/dragables/SortableField.js`
- `src/admin/components/FlowEditor/components/inputControls/StageDocumentControls.js`
- `src/admin/components/ProcessManager/MetaFieldInputs.js`
- `src/admin/components/ProcessManager/MetaFieldDisplay.js`
- `src/admin/components/ProcessViewer.js`
- `classes/Api/ProcessApi.php`
- `classes/Report/StageDocumentPdf.php`
- `classes/Report/ProcessReportPdf.php`

---

## Relatório PDF do processo

Além do PDF por documento de etapa, o Obatalá gera um **relatório consolidado** do processo (`ProcessReportPdf`), acessível na lista de processos quando o Dompdf está disponível. O relatório inclui metadados do processo e o conteúdo dos campos `stage_document` de cada etapa submetida.

---

## Limitações e evolução

A versão atual oferece formatação básica, mas ainda não inclui recursos avançados como tabelas, imagens, modelos institucionais, campos variáveis ou controle fino de estilos.

Evoluções recomendadas:

1. Criar modelos institucionais por tipo de documento.
2. Separar documentos de etapa em estrutura própria, fora de `stageData.fields`.
3. Implementar trilha de auditoria imutável.
4. Definir política de bloqueio ou reabertura após anexar PDF assinado.
5. Adicionar permissões específicas para gerar PDF, anexar PDF assinado e baixar documento final.
