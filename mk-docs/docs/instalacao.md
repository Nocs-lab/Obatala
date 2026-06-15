# Instalação e colocação no ar

Este guia descreve como instalar o plugin Obatalá em um ambiente WordPress, com foco nos passos que costumam ser esquecidos: **Composer** (biblioteca de PDF) e **build do frontend** (painel React).

---

## Requisitos

| Componente | Versão mínima recomendada | Observação |
|------------|---------------------------|------------|
| WordPress | 5.7+ | Conforme `readme.txt` do plugin |
| PHP | 7.4+ (8.x recomendado) | Extensões usuais: `mbstring`, `dom`, `gd` ou `imagick` ajudam o Dompdf |
| Plugin **Tainacan** | Ativo | O Obatalá declara `Requires Plugins: tainacan` e é desativado na ativação se o Tainacan não estiver instalado |
| **Composer** | 2.x | Obrigatório para instalar dependências PHP e o autoload PSR-4 |
| **Node.js** | 18+ (LTS) | Necessário para compilar o painel administrativo |
| **npm** | 9+ | Scripts em `package.json` |

Para **desenvolvimento** da documentação MkDocs (opcional):

- Python 3.10+
- Dependências em `mk-docs/requirements.txt`

---

## Visão geral do que precisa existir no servidor

Após a instalação correta, a pasta do plugin deve conter pelo menos:

```text
Obatala/
├── obatala.php              # Bootstrap do plugin (carrega vendor/autoload.php)
├── vendor/                  # Gerado pelo Composer — não versionado no Git
├── build/                   # Gerado por npm run build — JS/CSS do painel
├── classes/                 # Código PHP (namespace Obatala\)
├── languages/               # Traduções .po / .mo / .json
└── ...
```

!!! warning "Composer é obrigatório"
    O arquivo `obatala.php` executa `require_once vendor/autoload.php` na inicialização. Sem `composer install`, a pasta `vendor/` não existe e o WordPress pode exibir erro fatal ao ativar o plugin.

!!! info "Build do frontend"
    Os arquivos em `build/` estão no `.gitignore`. Em clone novo do repositório, é necessário rodar `npm install` e `npm run build` antes de usar o painel Obatalá.

---

## Instalação passo a passo (produção ou homologação)

### 1. Copiar o plugin para o WordPress

Coloque a pasta do plugin em:

```text
wp-content/plugins/Obatala/
```

Pode ser via Git clone, cópia do `.zip` de release ou deploy automatizado.

### 2. Instalar dependências PHP (Composer)

No terminal, entre na pasta do plugin e execute:

```bash
cd wp-content/plugins/Obatala
composer install --no-dev --optimize-autoloader
```

Em ambiente de **desenvolvimento** (com dependências de desenvolvimento, se houver no futuro):

```bash
composer install
```

O `composer.json` declara:

- **`dompdf/dompdf` (^2.0)** — renderização de HTML em PDF
- **Autoload PSR-4** — namespace `Obatala\` mapeado para `classes/`

Após o comando, deve existir `vendor/autoload.php` e `vendor/dompdf/dompdf/`.

### 3. Compilar o painel administrativo (npm)

```bash
npm ci
npm run build
```

Isso gera (entre outros) `build/index.js`, `build/index.css` e `build/index.asset.php`, carregados pelo `Enqueuer` nas páginas do Obatalá.

Para desenvolvimento com recarregamento:

```bash
npm start
```

### 4. Ativar o Tainacan e o Obatalá

1. No painel WordPress: **Plugins** → ative o **Tainacan**.
2. Em seguida, ative o **Obatala - Gestão de Processos Curatoriais**.

Se o Tainacan não estiver ativo, a ativação do Obatalá é interrompida com mensagem de erro.

### 5. Verificar permissões de escrita

O WordPress precisa gravar em:

- `wp-content/uploads/` — uploads de arquivos de etapa e PDFs assinados em `uploads/obatala/stage-documents/...`
- Pasta do plugin — apenas se o deploy atualizar arquivos por lá (não é necessário em runtime normal)

### 6. Conferir se os PDFs estão disponíveis

Com usuário que tenha `edit_posts` (ou papel Obatalá equivalente):

1. Acesse qualquer página do menu **Obatalá** no admin.
2. Se o Dompdf **não** estiver instalado, aparece um aviso amarelo: *"PDF generation library is not available. Run: composer install"*.
3. Na lista de processos, o botão **Gerar relatório em PDF** só é exibido quando `class_exists('\Dompdf\Dompdf')` é verdadeiro (flag `pdf_report_available` injetada pelo `Enqueuer`).

Funcionalidades que **dependem do Composer / Dompdf**:

| Funcionalidade | Classe / rota |
|----------------|---------------|
| Relatório PDF do processo (lista de processos) | `ProcessReportPdf`, `GET .../process-report-pdf` |
| PDF do documento da etapa | `StageDocumentPdf`, `GET .../stage-document-pdf` |
| Inclusão do documento da etapa no relatório completo | `ProcessReportPdf` |

O upload do **PDF assinado** não usa Dompdf (apenas armazena o arquivo), mas o fluxo completo de documento da etapa pressupõe que a geração do PDF intermediário funcione.

### 7. Numeração de processos (tabelas e backfill)

Na **primeira ativação** ou **atualização** do plugin, o Obatalá cria automaticamente:

- `{prefix}obatala_process_sequence` — contador de sequencial por ano
- `{prefix}obatala_process_numbers` — registro único de cada número atribuído

Processos já existentes recebem numeração retroativa (backfill) com base no ano de criação (`post_date`), na ordem cronológica.

Após atualizar o código, **reative o plugin** ou acesse o admin uma vez para garantir que as tabelas existam. Novos processos passam a exibir o número na coluna **Nº do processo** (ex.: `2026-00042-6`).

Detalhes da regra `AAAA-NNNNN-DV`, API e busca: [Gestão de processos — Numeração](processos/gestao-processos.md#numeracao-unica-do-processo).

---

## Instalação para desenvolvimento

Além dos passos acima:

```bash
# PHP
composer install

# Frontend
npm install
npm run build   # ou npm start durante o desenvolvimento

# Traduções (opcional)
npm run i18n:make-pot          # requer WP-CLI
npm run i18n:make-json         # requer WP-CLI
# Alternativa sem WP-CLI (Windows):
npm run i18n:po-to-mo-json     # compila .mo e JSON a partir do .po
```

### Documentação MkDocs local

```bash
cd mk-docs
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
mkdocs serve
```

Abra o endereço indicado (geralmente `http://127.0.0.1:8000`).

A documentação publicada está em: [Documentação oficial](https://nocs-lab.github.io/Obatala/).

---

## Checklist rápido

- [ ] Tainacan instalado e ativo
- [ ] `composer install` executado na pasta do plugin
- [ ] Pasta `vendor/` presente
- [ ] `npm run build` executado
- [ ] Pasta `build/` com `index.js` e `index.asset.php`
- [ ] Plugin Obatalá ativo sem erro fatal
- [ ] Nenhum aviso de biblioteca PDF no admin Obatalá
- [ ] Teste: gerar PDF de um processo ou documento da etapa

---

## Solução de problemas

### Erro fatal ao ativar: `Failed opening required '.../vendor/autoload.php'`

**Causa:** Composer não foi executado.

**Solução:** Na pasta do plugin, rode `composer install`. Confirme que `vendor/autoload.php` existe.

### Painel Obatalá em branco ou sem interface

**Causa:** Ausência do build frontend.

**Solução:** `npm install && npm run build`. Verifique se `build/index.js` foi criado.

### Aviso "PDF generation library is not available"

**Causa:** Dompdf não carregado (pasta `vendor` incompleta ou Composer não rodou).

**Solução:** `composer install` na raiz do plugin. Recarregue o admin.

### API retorna 500 ao gerar PDF

Resposta JSON com mensagem para executar `composer install` — mesma causa acima.

Verifique também:

- Memória PHP (`memory_limit`) para documentos grandes
- Conteúdo HTML muito complexo no documento da etapa (Dompdf tem limitações com CSS avançado)

### Plugin desativado sozinho na ativação

**Causa:** Tainacan não está ativo.

**Solução:** Ative o Tainacan antes do Obatalá.

### Progresso do processo não chega a 100% com etapa já enviada

Se o modelo exige **PDF assinado** (`requireSignedUpload`) e o arquivo ainda não foi anexado, o progresso permanece abaixo de 100% até o upload. Veja [Documento da etapa](metadados/documento-etapa.md#progresso-do-processo-e-pdf-assinado).

---

## Deploy e releases

O diretório `vendor/` está no `.gitignore`. **Todo deploy** deve incluir uma etapa `composer install` (ou empacotar o `vendor` gerado no pipeline).

O script `developer/create-zip.js` (usado em releases) deve ser executado em ambiente onde Composer e npm já rodaram, para o `.zip` conter `vendor/` e `build/`.

---

## Próximos passos

- [Organização do código](organizacao.md)
- [Documento da etapa (PDF e assinatura)](metadados/documento-etapa.md)
- [Internacionalização](internacionalizacao.md)
- [Guia do desenvolvedor (menus, REST, React)](tutoriais/guia-dev.md)
