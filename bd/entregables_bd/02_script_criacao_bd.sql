DROP DATABASE IF EXISTS pulse;
CREATE DATABASE pulse
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE pulse;

CREATE TABLE utilizador (
    utilizador_id INT AUTO_INCREMENT PRIMARY KEY,
    nome_utilizador VARCHAR(30) NOT NULL,
    email VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    biografia VARCHAR(160) NULL,
    foto_perfil VARCHAR(255) NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uk_utilizador_nome_utilizador UNIQUE (nome_utilizador),
    CONSTRAINT uk_utilizador_email UNIQUE (email),
    CONSTRAINT chk_utilizador_nome_utilizador_len CHECK (CHAR_LENGTH(nome_utilizador) BETWEEN 3 AND 30),
    CONSTRAINT chk_utilizador_email_len CHECK (CHAR_LENGTH(email) >= 5),
    CONSTRAINT chk_utilizador_password_hash_len CHECK (CHAR_LENGTH(password_hash) >= 20)
) ENGINE = InnoDB;

CREATE TABLE tweet (
    tweet_id INT AUTO_INCREMENT PRIMARY KEY,
    utilizador_id INT NOT NULL,
    conteudo VARCHAR(280) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tweet_utilizador
        FOREIGN KEY (utilizador_id)
        REFERENCES utilizador(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_tweet_conteudo_len CHECK (CHAR_LENGTH(conteudo) BETWEEN 1 AND 280)
) ENGINE = InnoDB;

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

    CONSTRAINT chk_comentario_conteudo_len CHECK (CHAR_LENGTH(conteudo) BETWEEN 1 AND 280)
) ENGINE = InnoDB;

CREATE TABLE imagem_tweet (
    imagem_id INT AUTO_INCREMENT PRIMARY KEY,
    tweet_id INT NOT NULL,
    url_imagem VARCHAR(255) NOT NULL,
    texto_alt VARCHAR(120) NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_imagem_tweet_tweet UNIQUE (tweet_id),
    CONSTRAINT fk_imagem_tweet_tweet
        FOREIGN KEY (tweet_id)
        REFERENCES tweet(tweet_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_imagem_tweet_url_len CHECK (CHAR_LENGTH(url_imagem) >= 5)
) ENGINE = InnoDB;

CREATE TABLE seguimento (
    seguidor_id INT NOT NULL,
    seguido_id INT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (seguidor_id, seguido_id),
    CONSTRAINT fk_seguimento_seguidor
        FOREIGN KEY (seguidor_id)
        REFERENCES utilizador(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_seguimento_seguido
        FOREIGN KEY (seguido_id)
        REFERENCES utilizador(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_seguimento_nao_auto_seguir CHECK (seguidor_id <> seguido_id)
) ENGINE = InnoDB;

CREATE TABLE gosto (
    utilizador_id INT NOT NULL,
    tweet_id INT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (utilizador_id, tweet_id),
    CONSTRAINT fk_gosto_utilizador
        FOREIGN KEY (utilizador_id)
        REFERENCES utilizador(utilizador_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_gosto_tweet
        FOREIGN KEY (tweet_id)
        REFERENCES tweet(tweet_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_tweet_utilizador_data
    ON tweet (utilizador_id, criado_em DESC);

CREATE INDEX idx_tweet_data
    ON tweet (criado_em DESC);

CREATE INDEX idx_seguimento_seguido
    ON seguimento (seguido_id);

CREATE INDEX idx_gosto_tweet
    ON gosto (tweet_id);

CREATE INDEX idx_comentario_tweet_data
    ON comentario (tweet_id, criado_em DESC);

CREATE INDEX idx_comentario_utilizador
    ON comentario (utilizador_id);