# Analise profunda da base de dados - Clone Twitter/X

## 1. Diagnostico executivo

A base de dados atual esta bem encaminhada e nao deve ser reescrita de raiz.
O modelo ja cobre corretamente os conceitos centrais do enunciado:

- registo e login de utilizadores;
- tweets com limite de 280 caracteres;
- gostos em tweets;
- seguimento entre utilizadores;
- feed cronologico inverso;
- imagem opcional num tweet;
- backoffice simples atraves de `is_admin` e `ativo`;
- chaves primarias, chaves estrangeiras, indices e algumas constraints.

O problema principal e objetivo: falta a entidade `comentario`.
Como os comentarios em tweets foram identificados como requisito obrigatorio, o
modelo atual ainda nao cumpre todos os requisitos funcionais e deve ser
complementado.

A recomendacao e manter a estrutura atual e acrescentar apenas:

1. tabela `comentario`;
2. indices para comentarios e listagens de tweets ativos;
3. pequenas constraints adicionais para reforcar integridade;
4. queries CRUD para comentarios.

## 2. O que esta correto

### 2.1 Utilizador

A tabela `utilizador` esta correta para o ambito do projeto.

Justificacao oral:

> A entidade Utilizador representa uma conta registada. Como cada conta deve
> poder autenticar-se, publicar tweets, seguir outros utilizadores, gostar de
> tweets e eventualmente administrar o sistema, faz sentido concentrar aqui os
> dados de identidade, autenticacao e estado da conta.

Pontos fortes:

- `utilizador_id` como PK simples e estavel;
- `nome_utilizador` unico, necessario para login e perfil publico;
- `email` unico, necessario para registo e recuperacao futura de conta;
- `password_hash`, correto porque a password nunca deve ser guardada em texto;
- `is_admin`, suficiente para backoffice simples;
- `ativo`, util para bloquear/desativar contas sem apagar historico;
- timestamps `criado_em` e `atualizado_em`, bons para auditoria basica;
- `foto_perfil` como caminho/URL, adequado para upload futuro.

Nao e necessario criar uma tabela separada `administrador` neste projeto, porque
so existe uma diferenca binaria entre utilizador normal e administrador. Uma
tabela de perfis/papeis so se justificaria se existissem varios papeis e
permissoes.

### 2.2 Tweet

A tabela `tweet` esta correta.

Justificacao oral:

> Um tweet e uma publicacao feita por exatamente um utilizador. Um utilizador
> pode publicar zero, um ou muitos tweets. Por isso, a chave estrangeira fica na
> tabela `tweet`, apontando para o autor em `utilizador`.

Pontos fortes:

- relacao 1:N entre `utilizador` e `tweet`;
- `conteudo VARCHAR(280)` e CHECK de tamanho;
- `ativo` para ocultar tweets no backoffice;
- timestamps para ordenacao do feed e auditoria;
- indice `(utilizador_id, criado_em DESC)` adequado para feed.

Nota: a constraint atual aceita strings com apenas espacos. Recomenda-se usar
`TRIM(conteudo)` na constraint para impedir tweets vazios disfarcados.

### 2.3 Imagem de tweet

A tabela `imagem_tweet` esta bem escolhida.

Justificacao oral:

> A imagem foi modelada numa tabela separada porque nem todos os tweets tem
> imagem. Assim evita-se colocar varios campos nulos diretamente em `tweet` e
> permite-se guardar metadados proprios da imagem, como URL e texto alternativo.

A relacao atual e 1:0..1:

- um tweet pode nao ter imagem;
- se tiver imagem, tem no maximo uma;
- uma imagem pertence obrigatoriamente a um tweet.

Isto esta coerente com o enunciado, que fala em publicar um tweet com uma
imagem. Nao e necessario criar uma tabela generica `ficheiro` ou `media` para
este nivel de projeto.

### 2.4 Seguimento

A tabela `seguimento` esta academicamente correta.

Justificacao oral:

> Seguir utilizadores e uma relacao muitos-para-muitos recursiva, porque um
> utilizador pode seguir muitos utilizadores e tambem pode ser seguido por
> muitos utilizadores. Como a relacao e entre a entidade Utilizador e ela
> propria, a tabela associativa tem duas FK para `utilizador`, com papeis
> diferentes: `seguidor_id` e `seguido_id`.

Pontos fortes:

- PK composta `(seguidor_id, seguido_id)` impede duplicados;
- CHECK `seguidor_id <> seguido_id` impede auto-seguimento;
- `criado_em` regista quando o follow foi criado;
- PK comecando por `seguidor_id` ajuda a query do feed.

Nao deve existir uma tabela `feed`. O feed e uma consulta derivada de
`seguimento` e `tweet`; guarda-lo numa tabela seria duplicacao e podia gerar
inconsistencias.

### 2.5 Gosto

A tabela `gosto` esta correta.

Justificacao oral:

> Gostar de tweets tambem e uma relacao muitos-para-muitos: um utilizador pode
> gostar de muitos tweets e um tweet pode receber gostos de muitos utilizadores.
> A tabela associativa `gosto` resolve esta relacao e a chave primaria composta
> impede que o mesmo utilizador goste duas vezes do mesmo tweet.

Pontos fortes:

- PK composta `(utilizador_id, tweet_id)`;
- FKs para `utilizador` e `tweet`;
- `criado_em` permite saber quando ocorreu o gosto;
- indice por `tweet_id` facilita contar gostos por tweet.

Nao se recomenda guardar `total_gostos` na tabela `tweet` nesta fase. Esse valor
e derivado por `COUNT(*)` sobre `gosto`. Guardar o total seria desnormalizacao e
exigiria mecanismos adicionais para manter o valor sincronizado.

## 3. O que esta errado ou insuficiente

### 3.1 Falta a tabela `comentario`

Este e o ponto obrigatorio mais importante.

Sem `comentario`, a BD nao suporta "comentarios em tweets". Tentar guardar
comentarios dentro da tabela `tweet` seria incorreto porque um tweet pode ter
muitos comentarios. Guardar uma lista de comentarios num campo violaria a 1FN,
pois deixaria de haver valores atomicos.

Modelo recomendado:

- um `utilizador` pode escrever zero ou muitos `comentario`;
- um `tweet` pode receber zero ou muitos `comentario`;
- cada `comentario` pertence a exatamente um `utilizador`;
- cada `comentario` pertence a exatamente um `tweet`.

Isto torna `comentario` uma entidade propria, nao apenas uma relacao, porque tem
conteudo, estado e timestamps.

### 3.2 Falta CRUD de comentarios

O ficheiro `03_queries_crud.txt` ja tem pelo menos 7 comandos em READ, UPDATE e
DELETE, conforme a especificacao. Mas quando se adiciona `comentario`, devem
existir queries para:

- criar comentario;
- listar comentarios de um tweet;
- editar comentario;
- ocultar comentario;
- apagar comentario;
- contar comentarios por tweet;
- incluir total de comentarios no feed.

### 3.3 Algumas constraints podem ser reforcadas

O modelo ja tem boas constraints, mas pode ser melhorado:

- `BOOLEAN` em MySQL e alias de `TINYINT(1)`, por isso convem CHECK `IN (0,1)`;
- `conteudo` de tweet deve usar `TRIM` para impedir texto so com espacos;
- `comentario.conteudo` tambem deve ter 1 a 280 caracteres reais;
- `nome` do utilizador deve impedir string vazia.

Estas melhorias ajudam na defesa academica porque mostram preocupacao com
integridade de dominio, nao apenas com integridade referencial.

### 3.4 Regra "gostar tweets de outros utilizadores"

O enunciado usa a expressao "tweets de outros utilizadores". Se o professor
interpretar isto literalmente, entao um utilizador nao deve poder gostar do seu
proprio tweet.

O modelo atual nao impede isso ao nivel da BD, porque a tabela `gosto` so tem
`utilizador_id` e `tweet_id`. Para saber se o tweet pertence ao mesmo
utilizador, e necessario consultar a tabela `tweet`.

Defesa possivel:

> Esta regra e uma regra de negocio que pode ser validada no backend antes de
> inserir o gosto. Se for exigido que a BD a imponha diretamente, pode ser
> implementada com uma trigger, porque uma CHECK simples nao consegue comparar
> dados de outra tabela.

O ficheiro `05_alteracoes_recomendadas.sql` documenta uma trigger opcional para
esta interpretacao estrita.

## 4. Normalizacao

O modelo atual esta globalmente em 3FN.

### 1FN

Os atributos sao atomicos. Gostos e seguimentos nao estao guardados como listas
dentro de `utilizador` ou `tweet`; estao em tabelas proprias.

Com a nova tabela `comentario`, mantem-se a 1FN, porque cada comentario e uma
linha individual.

### 2FN

As tabelas com chave composta (`seguimento` e `gosto`) tem apenas atributos que
dependem da chave toda. O campo `criado_em` depende do par completo:

- quando A seguiu B;
- quando X gostou do tweet Y.

Nao depende apenas de uma das partes da chave.

### 3FN

Nao ha dependencias transitivas relevantes. Por exemplo:

- `tweet` nao guarda nome nem email do autor;
- `gosto` nao guarda conteudo do tweet;
- `seguimento` nao guarda nomes dos utilizadores;
- `comentario` nao deve guardar nome do autor nem texto do tweet.

Esses dados sao obtidos por JOIN. Isto reduz redundancia e evita anomalias de
atualizacao.

## 5. Integridade referencial e ON DELETE / ON UPDATE

As FKs atuais usam `ON DELETE CASCADE` e `ON UPDATE CASCADE`.

Isto e defensavel no projeto:

- se um utilizador for apagado fisicamente, os seus tweets, gostos e seguimentos
  deixam de ter dono valido, por isso sao removidos;
- se um tweet for apagado fisicamente, os gostos, imagem e comentarios desse
  tweet tambem devem desaparecer;
- `ON UPDATE CASCADE` e raramente acionado porque IDs auto-increment normalmente
  nao mudam, mas mantem coerencia se uma PK for atualizada.

Importante para a defesa:

> O sistema tambem tem `ativo`, logo o backoffice pode preferir desativar
> utilizadores ou tweets em vez de apagar fisicamente. O `CASCADE` existe para o
> caso de remocao fisica e evita registos orfaos.

Para `comentario`, recomenda-se o mesmo criterio:

- `comentario.tweet_id` com `ON DELETE CASCADE`;
- `comentario.utilizador_id` com `ON DELETE CASCADE`;
- `ativo` para ocultar comentario sem apagar.

## 6. Adequacao para Sequelize, Express, JWT e React

### Sequelize

O modelo e adequado para Sequelize.

Associacoes principais:

- `Utilizador.hasMany(Tweet, { foreignKey: 'utilizador_id' })`;
- `Tweet.belongsTo(Utilizador, { foreignKey: 'utilizador_id' })`;
- `Tweet.hasOne(ImagemTweet, { foreignKey: 'tweet_id' })`;
- `ImagemTweet.belongsTo(Tweet, { foreignKey: 'tweet_id' })`;
- `Utilizador.belongsToMany(Tweet, { through: Gosto, foreignKey: 'utilizador_id', otherKey: 'tweet_id' })`;
- `Tweet.belongsToMany(Utilizador, { through: Gosto, foreignKey: 'tweet_id', otherKey: 'utilizador_id' })`;
- `Utilizador.belongsToMany(Utilizador, { as: 'Seguidos', through: Seguimento, foreignKey: 'seguidor_id', otherKey: 'seguido_id' })`;
- `Utilizador.belongsToMany(Utilizador, { as: 'Seguidores', through: Seguimento, foreignKey: 'seguido_id', otherKey: 'seguidor_id' })`;
- `Utilizador.hasMany(Comentario, { foreignKey: 'utilizador_id' })`;
- `Tweet.hasMany(Comentario, { foreignKey: 'tweet_id' })`;
- `Comentario.belongsTo(Utilizador, { foreignKey: 'utilizador_id' })`;
- `Comentario.belongsTo(Tweet, { foreignKey: 'tweet_id' })`.

As PKs compostas em `gosto` e `seguimento` sao corretas academicamente. Em
Sequelize podem ser configuradas com ambos os campos como `primaryKey`. Nao e
obrigatorio adicionar `gosto_id` ou `seguimento_id`; isso simplificaria algumas
rotas, mas pioraria ligeiramente a pureza da tabela associativa se nao fosse
acompanhado por `UNIQUE`.

### JWT Authentication

Nao e necessario criar uma tabela `jwt_token` para este projeto, se forem usados
JWTs stateless.

A BD ja tem o necessario:

- `nome_utilizador` para encontrar a conta;
- `password_hash` para validar a password no backend;
- `utilizador_id` para colocar no payload do token;
- `is_admin` para autorizacao no backoffice;
- `ativo` para impedir login de contas desativadas.

Uma tabela de refresh tokens so se justificaria se o backend implementar refresh
tokens persistentes, logout global ou revogacao de sessoes. Isso e util em
producao, mas e complexidade extra para este projeto.

### Upload de imagens

A BD deve guardar o caminho/URL da imagem, nao o ficheiro binario.

Fluxo recomendado:

1. Express recebe o ficheiro com Multer ou servico equivalente;
2. backend guarda o ficheiro em pasta local, cloud storage ou servidor estatico;
3. BD guarda `url_imagem` em `imagem_tweet`;
4. React usa esse URL para mostrar a imagem.

Isto e simples, normalizado e facil de defender.

### Feed e queries futuras

O feed cronologico inverso deve continuar a ser uma query, nao uma tabela.

Query base:

- partir de `seguimento`;
- juntar `tweet` por `tweet.utilizador_id = seguimento.seguido_id`;
- filtrar `s.seguidor_id = utilizador_logado`;
- filtrar `t.ativo = TRUE` e `u.ativo = TRUE`;
- ordenar por `t.criado_em DESC`.

Indices relevantes:

- `seguimento(seguidor_id, seguido_id)` pela PK;
- `tweet(utilizador_id, criado_em DESC)`;
- `tweet(ativo, criado_em DESC)` para listagens/backoffice;
- `gosto(tweet_id)` para contagens;
- `comentario(tweet_id, criado_em DESC)` para comentarios de um tweet.

## 7. Tabelas que nao devem ser criadas agora

Para manter o projeto simples mas profissional, nao recomendo criar agora:

- `feed`: e derivado por query;
- `total_gostos` ou `total_comentarios` em `tweet`: sao valores derivados;
- `administrador`: `is_admin` e suficiente;
- `role` e `permissao`: so se justificam com varios papeis;
- `jwt_token`: nao e necessario com JWT stateless;
- `hashtag`, `mention`, `retweet`, `mensagem_privada`, `notificacao`: nao sao
  requisitos obrigatorios;
- `imagem_perfil` como tabela separada: uma foto de perfil simples pode ficar
  como atributo `foto_perfil`;
- `ficheiro` generico: so se justificaria se varias entidades partilhassem um
  sistema complexo de uploads.

## 8. Alteracao SQL obrigatoria

A alteracao obrigatoria esta no ficheiro `05_alteracoes_recomendadas.sql`.

Resumo:

```sql
CREATE TABLE comentario (
    comentario_id INT AUTO_INCREMENT PRIMARY KEY,
    tweet_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    conteudo VARCHAR(280) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tweet_id) REFERENCES tweet(tweet_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (utilizador_id) REFERENCES utilizador(utilizador_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK (CHAR_LENGTH(TRIM(conteudo)) BETWEEN 1 AND 280)
) ENGINE = InnoDB;
```

Tambem foi documentada uma trigger opcional para impedir que um utilizador goste
do proprio tweet, caso o requisito "tweets de outros utilizadores" seja
interpretado de forma estrita.

As queries CRUD adicionais para comentarios e feed estao separadas no ficheiro
`06_queries_comentarios_feed.sql`, para evitar que o ficheiro de alteracoes DDL
execute inserts, updates ou deletes de exemplo por acidente.

## 9. Modelo relacional final recomendado

```text
UTILIZADOR(
    utilizador_id PK,
    nome_utilizador UNIQUE NOT NULL,
    email UNIQUE NOT NULL,
    password_hash NOT NULL,
    nome NOT NULL,
    biografia,
    foto_perfil,
    is_admin NOT NULL,
    ativo NOT NULL,
    criado_em NOT NULL,
    atualizado_em NOT NULL
)

TWEET(
    tweet_id PK,
    utilizador_id FK -> UTILIZADOR(utilizador_id),
    conteudo NOT NULL,
    ativo NOT NULL,
    criado_em NOT NULL,
    atualizado_em NOT NULL
)

IMAGEM_TWEET(
    imagem_id PK,
    tweet_id FK -> TWEET(tweet_id) UNIQUE,
    url_imagem NOT NULL,
    texto_alt,
    criado_em NOT NULL
)

SEGUIMENTO(
    seguidor_id PK/FK -> UTILIZADOR(utilizador_id),
    seguido_id PK/FK -> UTILIZADOR(utilizador_id),
    criado_em NOT NULL
)

GOSTO(
    utilizador_id PK/FK -> UTILIZADOR(utilizador_id),
    tweet_id PK/FK -> TWEET(tweet_id),
    criado_em NOT NULL
)

COMENTARIO(
    comentario_id PK,
    tweet_id FK -> TWEET(tweet_id),
    utilizador_id FK -> UTILIZADOR(utilizador_id),
    conteudo NOT NULL,
    ativo NOT NULL,
    criado_em NOT NULL,
    atualizado_em NOT NULL
)
```

## 10. Relacoes finais

### Um-para-muitos

- `UTILIZADOR 1:N TWEET`
- `UTILIZADOR 1:N COMENTARIO`
- `TWEET 1:N COMENTARIO`

### Muitos-para-muitos

- `UTILIZADOR N:M UTILIZADOR` atraves de `SEGUIMENTO`
- `UTILIZADOR N:M TWEET` atraves de `GOSTO`

### Um-para-um / zero-ou-um

- `TWEET 1:0..1 IMAGEM_TWEET`

Nao ha uma verdadeira relacao 1:1 obrigatoria no modelo. A imagem e opcional,
por isso a cardinalidade correta e 1 para zero-ou-um.

## 11. Veredicto final

O projeto atual esta estruturalmente bom e defensavel, mas ainda nao cumpre
todos os requisitos se comentarios forem obrigatorios.

Classificacao tecnica:

- correta a modelacao de utilizadores, tweets, gostos, seguimentos e imagem;
- correta a normalizacao geral;
- corretas as PKs/FKs existentes;
- aceitavel o uso de `ON DELETE CASCADE`;
- adequada a base para Sequelize, Express, JWT e React;
- obrigatorio adicionar `comentario`;
- recomendado reforcar algumas constraints e indices.

A melhor estrategia e evoluir o modelo atual, nao substitui-lo.
