# Obatalá — instruções para agentes

## Contexto do projeto

Obatalá é um plugin WordPress para gestão de processos curatoriais e depende do plugin Tainacan. O backend usa PHP e APIs do WordPress; a interface administrativa
usa React e `@wordpress/scripts`.

O plugin declara compatibilidade com WordPress 5.7 ou superior. Preserve essa compatibilidade, salvo quando uma tarefa ou especificação determinar expressamente
uma mudança de requisito.

## Estrutura relevante

- `obatala.php`: bootstrap, ativação e inicialização do plugin.
- `classes/`: backend PHP com autoload PSR-4 no namespace `Obatala\`.
- `classes/Api/`: controllers e rotas REST sob o namespace `obatala/v1`.
- `classes/Entities/`: entidades e tipos de post do domínio.
- `classes/Services/`: regras de negócio e integrações, inclusive Tainacan.
- `classes/Security/`: papéis e verificações de acesso.
- `classes/Report/`: geração de PDFs com Dompdf.
- `src/admin/`: código-fonte React da interface administrativa.
- `src/index.js`: entrada do bundle JavaScript.
- `build/`: artefatos JavaScript gerados por `npm run build`.
- `css/`: estilos carregados pelo plugin.
- `languages/`: catálogo POT e traduções PO, MO e JSON.
- `tests/`: testes PHPUnit; a cobertura atual é parcial.
- `mk-docs/docs/`: documentação MkDocs para usuários e desenvolvedores.
- `developer/`: scripts de versão, tradução e empacotamento.
- `specs/`: especificações de funcionalidades e seus critérios de aceite.

## Antes de alterar

- Leia a especificação indicada e os arquivos diretamente relacionados.
- Verifique `git status` e preserve mudanças existentes que não pertençam à tarefa.
- Não amplie o escopo apenas para reorganizar ou modernizar código adjacente.
- Se a especificação divergir do comportamento atual, registre a divergência e
  adote a interpretação de menor impacto compatível com os critérios de aceite.

## Backend PHP e WordPress

- Mantenha classes em `classes/` no namespace PSR-4 `Obatala\`.
- Proteja arquivos PHP executáveis contra acesso direto com a verificação de
  `ABSPATH`, seguindo o padrão do código próximo.
- Use APIs do WordPress para persistência, HTTP, usuários, posts, metadados e
  respostas REST.
- Valide e sanitize dados na entrada e escape dados no momento da saída.
- Toda operação privilegiada deve ter uma verificação explícita de capability.
- Rotas REST devem declarar `permission_callback`; reutilize as verificações de
  `Obatala\Security\Roles` ou de `Obatala\Api\ObatalaAPI` quando aplicáveis.
- Preserve o namespace REST `obatala/v1` e os contratos existentes, a menos que a
  especificação documente uma alteração e sua compatibilidade/migração.
- Não suponha que o Tainacan esteja disponível em testes unitários isolados. Isole
  integrações ou forneça os doubles necessários.
- Mudanças de banco de dados devem ser idempotentes e compatíveis com o mecanismo
  de instalação/upgrade existente.

## Frontend React

- Edite o código-fonte em `src/`; não edite manualmente os arquivos de `build/`.
- Siga a organização e o estilo dos componentes vizinhos antes de introduzir
  novas abstrações ou dependências.
- Use os pacotes `@wordpress/*` já adotados pelo projeto quando eles oferecerem a
  API necessária.
- Preserve os contratos entre componentes React, dados serializados pelo WordPress
  e endpoints REST.
- Estados de carregamento, vazio, sucesso e erro devem ser tratados quando a
  funcionalidade fizer chamadas assíncronas.
- Não adicione uma dependência npm quando a implementação puder reutilizar com
  clareza os pacotes ou utilitários existentes.

## Internacionalização

- Use o text domain `obatala` para todo texto visível ao usuário.
- Em PHP, use as funções de internacionalização e escape adequadas do WordPress.
- Em JavaScript, use `@wordpress/i18n`.
- Ao incluir ou alterar mensagens, atualize os catálogos necessários conforme o
  fluxo documentado em `mk-docs/docs/internacionalizacao.md`.
- Não edite binários `.mo` manualmente; gere-os pelos scripts do projeto.

## Documentação e specs

- Atualize `README.md` ou `mk-docs/docs/` quando uma mudança alterar instalação, operação, API, interface ou comportamento observável pelo usuário.
- Use `specs/templates/feature.md` como ponto de partida para novas features.
- Trate os critérios de aceite de uma spec aprovada como requisitos obrigatórios.
- Não marque um critério como atendido sem evidência no código ou na validação.
- Ao concluir uma spec, relacione os critérios atendidos, os arquivos alterados e as validações executadas; registre também o que não pôde ser validado.

## Validação

Execute somente as validações aplicáveis à mudança, ampliando-as conforme o risco:

- JavaScript: `npm run lint:js`.
- Bundle da interface: `npm run build`.
- PHP alterado: `php -l caminho/do/arquivo.php` para cada arquivo relevante.
- Testes PHP: `composer test`.
- Traduções: `npm run i18n:make-pot` e/ou `npm run i18n:po-to-mo-json`, quando
  mensagens tiverem sido modificadas e o ambiente possuir as ferramentas exigidas.

O PHPUnit atualmente cobre apenas parte do backend. Para mudanças não cobertas, descreva um teste manual reproduzível, preferencialmente incluindo perfil do
usuário, dados de entrada, ação e resultado esperado.

## Restrições de entrega

- Não altere versões em `package.json`, `obatala.php`, `README.md` ou `readme.txt`
  sem solicitação explícita; o repositório possui automação própria de versão.
- Não gere release, ZIP, commit ou push sem solicitação explícita.
- Não inclua credenciais, dados pessoais, dumps de banco ou configurações locais.
- Evite alterações em `vendor/` e `node_modules/`; dependências devem ser geridas
  por Composer ou npm e registradas nos respectivos manifests/locks.
