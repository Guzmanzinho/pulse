USE clone_twitter_x;

/*
Alteracoes recomendadas para melhorar a base de dados sem destruir a
estrutura atual.

Objetivo principal:
- acrescentar comentarios em tweets, que e requisito obrigatorio indicado;
- reforcar algumas restricoes simples de integridade;
- melhorar indices para feed, backoffice e comentarios.

Nota:
- Se estiveres a executar o script completo de criacao do zero, podes copiar a
  tabela comentario para o ficheiro 02_script_criacao_bd.sql depois da tabela
  tweet ou depois da tabela imagem_tweet.
- Os ALTER TABLE abaixo assumem MySQL 8.0.16+ com suporte para CHECK.
*/

CREATE TABLE comentario (
    comentario_id INT AUTO_INCREMENT PRIMARY KEY,
    tweet_id INT NOT NULL,
    utilizador_id INT NOT NULL,
    conteudo VARCHAR(280) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_comentario_tweet
        FOREIGN KEY (tweet_id)
        REFERENCES tweet(tweet_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_comentario_utilizador
        FOREIGN KEY (utilizador_id)
        REFERENCES utilizador(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_comentario_conteudo_len
        CHECK (CHAR_LENGTH(TRIM(conteudo)) BETWEEN 1 AND 280),
    CONSTRAINT chk_comentario_ativo_bool
        CHECK (ativo IN (0, 1))
) ENGINE = InnoDB;

CREATE INDEX idx_comentario_tweet_data
    ON comentario (tweet_id, criado_em DESC);

CREATE INDEX idx_comentario_utilizador_data
    ON comentario (utilizador_id, criado_em DESC);

CREATE INDEX idx_comentario_ativo_data
    ON comentario (ativo, criado_em DESC);

-- Indice util para listagens globais/backoffice de tweets ativos.
CREATE INDEX idx_tweet_ativo_data
    ON tweet (ativo, criado_em DESC);

-- Reforcos simples para campos BOOLEAN, porque em MySQL BOOLEAN e TINYINT(1).
ALTER TABLE utilizador
    ADD CONSTRAINT chk_utilizador_is_admin_bool CHECK (is_admin IN (0, 1)),
    ADD CONSTRAINT chk_utilizador_ativo_bool CHECK (ativo IN (0, 1)),
    ADD CONSTRAINT chk_utilizador_nome_len CHECK (CHAR_LENGTH(TRIM(nome)) BETWEEN 1 AND 80);

ALTER TABLE tweet
    ADD CONSTRAINT chk_tweet_ativo_bool CHECK (ativo IN (0, 1));

-- Opcional, mas recomendado se quiseres impedir tweets so com espacos.
-- Se a constraint atual ja existir, primeiro remove-a e volta a cria-la.
ALTER TABLE tweet
    DROP CHECK chk_tweet_conteudo_len;

ALTER TABLE tweet
    ADD CONSTRAINT chk_tweet_conteudo_len
        CHECK (CHAR_LENGTH(TRIM(conteudo)) BETWEEN 1 AND 280);

/*
Opcional para interpretacao estrita do enunciado:
"gostar tweets de outros utilizadores" pode significar que um utilizador nao
pode gostar dos seus proprios tweets.

Isto nao pode ser garantido com uma CHECK simples, porque exige comparar a
tabela `gosto` com a tabela `tweet`. Pode ser validado no backend Express ou,
se o professor exigir integridade ao nivel da BD, com trigger.

Para aplicar no MySQL Workbench, remover este bloco de comentario.

DELIMITER $$

CREATE TRIGGER trg_gosto_nao_proprio_tweet_bi
BEFORE INSERT ON gosto
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM tweet
        WHERE tweet.tweet_id = NEW.tweet_id
          AND tweet.utilizador_id = NEW.utilizador_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Um utilizador nao pode gostar do proprio tweet.';
    END IF;
END$$

DELIMITER ;
*/
