USE clone_twitter_x;

/*
Queries adicionais recomendadas para demonstrar comentarios e enriquecer o
feed. Estas queries sao exemplos CRUD e podem ser integradas no ficheiro
03_queries_crud.txt.
*/

-- CREATE: criar comentario num tweet.
INSERT INTO comentario (tweet_id, utilizador_id, conteudo)
VALUES (1, 3, 'Concordo com este tweet.');

-- READ: listar comentarios ativos de um tweet, do mais antigo para o mais recente.
SELECT
    c.comentario_id,
    c.conteudo,
    c.criado_em,
    u.utilizador_id,
    u.nome_utilizador,
    u.nome
FROM comentario c
INNER JOIN utilizador u ON u.utilizador_id = c.utilizador_id
WHERE c.tweet_id = 1
  AND c.ativo = TRUE
  AND u.ativo = TRUE
ORDER BY c.criado_em ASC;

-- READ: contar comentarios por tweet.
SELECT
    t.tweet_id,
    t.conteudo,
    COUNT(c.comentario_id) AS total_comentarios
FROM tweet t
LEFT JOIN comentario c ON c.tweet_id = t.tweet_id AND c.ativo = TRUE
WHERE t.ativo = TRUE
GROUP BY t.tweet_id, t.conteudo
ORDER BY total_comentarios DESC;

-- READ: feed cronologico inverso com imagem, gostos e comentarios.
SELECT
    t.tweet_id,
    u.utilizador_id,
    u.nome_utilizador,
    t.conteudo,
    i.url_imagem,
    t.criado_em,
    COUNT(DISTINCT g.utilizador_id) AS total_gostos,
    COUNT(DISTINCT c.comentario_id) AS total_comentarios
FROM seguimento s
INNER JOIN tweet t ON t.utilizador_id = s.seguido_id
INNER JOIN utilizador u ON u.utilizador_id = t.utilizador_id
LEFT JOIN imagem_tweet i ON i.tweet_id = t.tweet_id
LEFT JOIN gosto g ON g.tweet_id = t.tweet_id
LEFT JOIN comentario c ON c.tweet_id = t.tweet_id AND c.ativo = TRUE
WHERE s.seguidor_id = 2
  AND t.ativo = TRUE
  AND u.ativo = TRUE
GROUP BY
    t.tweet_id,
    u.utilizador_id,
    u.nome_utilizador,
    t.conteudo,
    i.url_imagem,
    t.criado_em
ORDER BY t.criado_em DESC;

-- UPDATE: editar comentario pelo proprio autor.
UPDATE comentario
SET conteudo = 'Comentario editado.'
WHERE comentario_id = 1
  AND utilizador_id = 3;

-- UPDATE: ocultar comentario pelo backoffice ou pelo proprio autor.
UPDATE comentario
SET ativo = FALSE
WHERE comentario_id = 1;

-- DELETE: apagar definitivamente um comentario.
DELETE FROM comentario
WHERE comentario_id = 1;
