# Detalhamento das Classes e Integração com Tainacan
Este documento representa a estruturação básica das classes do sistema, serve como template inicial, os diversos métodos e interação das classes irá variar de acordo com os desafios encontrados no desenvolvimento deste sistema.

#### Classe Processo

Esta classe representa a entidade principal do sistema. Cada processo pode ter várias etapas, pessoas envolvidas, notificações e arquivos anexados.

```php
class Processo {
    public $nome;
    public $data;
    public $conteudo;
    public $etapas = [];
    public $status;
    public $prazo;
    public $notificacoes = [];
    public $arquivos = [];

    public function __construct($nome, $data, $conteudo, $status, $prazo) {
        $this->nome = $nome;
        $this->data = $data;
        $this->conteudo = $conteudo;
        $this->status = $status;
        $this->prazo = $prazo;
    }

    public function adicionarEtapa(Etapa $etapa) {
        $this->etapas[] = $etapa;
    }

    public function adicionarNotificacao(Notificacao $notificacao) {
        $this->notificacoes[] = $notificacao;
    }

    public function adicionarArquivo(Arquivo $arquivo) {
        $this->arquivos[] = $arquivo;
    }
}
```

#### Classe Etapa

Cada etapa é uma parte do processo que pode incluir setores, pessoas, comentários e notificações.

```php
class Etapa {
    public $nome;
    public $comentarios = [];
    public $setores = [];
    public $prazo;
    public $pessoas = [];
    public $status;

    public function __construct($nome, $prazo, $status) {
        $this->nome = $nome;
        $this->prazo = $prazo;
        $this->status = $status;
    }

    public function adicionarComentario(Comentario $comentario) {
        $this->comentarios[] = $comentario;
    }

    public function adicionarSetor(Setor $setor) {
        $this->setores[] = $setor;
    }

    public function adicionarPessoa(Pessoa $pessoa) {
        $this->pessoas[] = $pessoa;
    }
}
```

#### Classe Notificacao

Representa uma notificação enviada durante o processo.

```php
class Notificacao {
    public $mensagem;
    public $dataEnvio;

    public function __construct($mensagem, $dataEnvio) {
        $this->mensagem = $mensagem;
        $this->dataEnvio = $dataEnvio;
    }
}
```

#### Classe Pessoa

Representa uma pessoa envolvida no processo.

```php
class Pessoa {
    public $nome;
    public $email;

    public function __construct($nome, $email) {
        $this->nome = $nome;
        $this->email = $email;
    }
}
```

#### Classe Arquivo

Representa um arquivo anexado ao processo.

```php
class Arquivo {
    public $nome;
    public $url;
    public $autor;
    public $etapa;

    public function __construct($nome, $url, $autor, $etapa) {
        $this->nome = $nome;
        $this->url = $url;
        $this->autor = $autor;
        $this->etapa = $etapa;
    }
}
```

#### Integração com Tainacan

Para a integração com o Tainacan, vamos utilizar as classes `Collection` e `Item` do Tainacan para gerenciar as coleções e itens dentro do processo.

```php
use Tainacan\Entities\Collection;
use Tainacan\Entities\Item;

class Colecao {
    public $nome;
    public $tainacanID;
    public $itens = [];

    public function __construct($nome, $tainacanID) {
        $this->nome = $nome;
        $this->tainacanID = $tainacanID;
    }

    public function adicionarItem(Item $item) {
        $this->itens[] = $item;
    }
}
```

### Exemplo de Criação e Gerenciamento de Processos

```php
// Criação de um novo processo
$processo = new Processo("Nome do Processo", "2023-05-14", "Descrição do Processo", "Iniciado", "2023-06-14");

// Adição de etapas
$etapa1 = new Etapa("Planejamento", "2023-05-21", "Em Progresso");
$processo->adicionarEtapa($etapa1);

// Adição de notificações
$notificacao = new Notificacao("Notificação de Teste", "2023-05-15");
$processo->adicionarNotificacao($notificacao);

// Adição de arquivos
$arquivo = new Arquivo("Documento", "http://url.com/documento.pdf", "Autor", "Planejamento");
$processo->adicionarArquivo($arquivo);

// Integração com Tainacan
$colecao = new Colecao("Coleção de Arte", 12345);
$item = new Item("Obra de Arte", 67890);
$colecao->adicionarItem($item);
$processo->adicionarColecao($colecao);
```