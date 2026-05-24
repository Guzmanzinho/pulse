const { Tweet, ImagemTweet, Comentario, Gosto, Utilizador } = require('../models');

async function getAllTweets(req, res) {
    try {
        const tweets = await Tweet.findAll({
            where: { ativo : true},
            include: [
                {
                    model: Utilizador,
                    attributes: ['utilizador_id', 'nome_utilizador', "nome", "foto_perfil"]
                },
                {
                    model: ImagemTweet,
                    attributes: ['url_imagem']
                },
                {
                    model: Comentario,
                    attributes: ['comentario_id', 'conteudo', 'utilizador_id', 'criado_em'],
                    include: [{
                        model: Utilizador,
                        attributes: ['nome', 'nome_utilizador', 'foto_perfil']
                    }]
                },
                {
                    model: Gosto,
                    attributes: ['utilizador_id', 'criado_em']
                }
            ],
            order: [['criado_em', 'DESC']]
        });
        res.json(tweets);
    } catch (error) {
        console.error('Erro ao obter tweets:', error);
        res.status(500).json({ mensagem: 'Erro ao obter tweets' });
    }
}

// Criar Tweet
async function criarTweet(req, res) {
    const { conteudo, imagem_url, texto_alt } = req.body;
    if (!conteudo) {
        return res.status(400).json({ mensagem: 'Conteúdo do tweet é obrigatório' });
    }

    if (conteudo.length > 280) {
        return res.status(400).json({ mensagem: 'Conteúdo do tweet não pode exceder 280 caracteres' });
    }

    try {
        const novoTweet = await Tweet.create({
            conteudo,
            utilizador_id: req.user.utilizador_id
        });
        if (req.file) {
            await ImagemTweet.create({
                url_imagem: `/uploads/${req.file.filename}`,
                texto_alt: texto_alt || null,
                tweet_id: novoTweet.tweet_id
            });
        }
        res.status(201).json({
            mensagem: 'Tweet criado com sucesso',
            tweet: {
                tweet_id: novoTweet.tweet_id,
                conteudo: novoTweet.conteudo,
                utilizador_id: novoTweet.utilizador_id,
                criado_em: novoTweet.criado_em,
                atualizado_em: novoTweet.atualizado_em
            }
        });

        console.log(req.file);
    } catch (error) {
        console.error('Erro ao criar tweet:', error);
        res.status(500).json({ mensagem: 'Erro ao criar tweet' });
    }
}

// Editar Tweet
async function editarTweet(req, res) {
    try{
        const { tweet_id } = req.params;
        const { conteudo } = req.body;
        const utilizador_id = req.user.utilizador_id;
        const tweet = await Tweet.findOne({ where: { tweet_id, ativo : true } });

        if (!tweet_id) {
            return res.status(400).json({ mensagem: 'ID do tweet é obrigatório' });
        }
        
        if (!tweet) {
            return res.status(404).json({ mensagem: 'Tweet não encontrado' });
        }

        if (tweet.utilizador_id !== utilizador_id) {
            return res.status(403).json({ mensagem: 'Não tens permissão para editar este tweet' });
        }

        if (!conteudo || conteudo.trim() === '') {
            return res.status(400).json({ mensagem: 'Conteúdo do tweet não pode ser vazio' });
        }

        if (conteudo.length > 280) {
            return res.status(400).json({ mensagem: 'Conteúdo do tweet não pode exceder 280 caracteres' });
        }

        await tweet.update({ conteudo });
        return res.status(200).json({ mensagem: 'Tweet editado com sucesso', tweet });

    }catch(erro){
        console.error('Erro ao editar tweet:', erro);
        return res.status(500).json({ mensagem: 'Erro ao editar tweet' });
    }
}

// Eliminar tweet
async function eliminarTweet(req, res) {
    try {
        const { tweet_id } = req.params;
        const utilizador_id = req.user.utilizador_id;
        
        if (!tweet_id) {
            return res.status(400).json({ mensagem: 'ID do tweet é obrigatório' });
        }

        const tweet = await Tweet.findOne({ where: { tweet_id, ativo : true } });
        if (!tweet) {
            return res.status(404).json({ mensagem: 'Tweet não encontrado' });
        }
        if (tweet.utilizador_id !== utilizador_id) {
            return res.status(403).json({ mensagem: 'Não tens permissão para eliminar este tweet' });
        }
        await tweet.update({ ativo: false });
        return res.status(200).json({ mensagem: 'Tweet eliminado com sucesso' });
    } catch (error) {
        console.error('Erro ao eliminar tweet:', error);
        return res.status(500).json({ mensagem: 'Erro ao eliminar tweet' });
    }
}

// Comentar Tweet
async function comentarTweet(req, res) {
    const { tweet_id } = req.params;
    const { conteudo } = req.body;

    if (!conteudo) {
        return res.status(400).json({ mensagem: 'Comentario vazio é inválido' });
    }

    if (conteudo.length > 280) {
        return res.status(400).json({ mensagem: 'Conteúdo do comentario não pode exceder 280 caracteres' });
    }

    
    if (!tweet_id){
        return res.status(400).json({ mensagem: 'ID do tweet é obrigatório' });
    } 
    
    const tweet = await Tweet.findOne({ where: { tweet_id, ativo : true } });

    if (!tweet){
        return res.status(404).json({ mensagem: 'Tweet não encontrado' });
    }

    try {
        const novoComentario = await Comentario.create({
            conteudo,
            tweet_id,
            utilizador_id: req.user.utilizador_id
        });
        res.status(201).json({
            mensagem: 'Comentario criado com sucesso',
            comentario: {
                comentario_id: novoComentario.comentario_id,
                conteudo: novoComentario.conteudo,
                tweet_id: novoComentario.tweet_id,
                utilizador_id: novoComentario.utilizador_id,
                criado_em: novoComentario.criado_em,
                atualizado_em: novoComentario.atualizado_em
            }
        });
    } catch (error) {
        console.error('Erro ao criar comentario:', error);
        res.status(500).json({ mensagem: 'Erro ao criar comentario' });
    }
}

// Dar like no tweet
async function darLike(req, res) {
    try {

        const { tweet_id } = req.params;
        const utilizador_id = req.user.utilizador_id;

        if (!tweet_id){
            return res.status(400).json({ mensagem: 'ID do tweet é obrigatório' });
        }

        const tweet = await Tweet.findOne({ where: { tweet_id, ativo : true } });
        if (!tweet){
            return res.status(404).json({ mensagem: 'Tweet não encontrado' });
        }

        const likeExistente = await Gosto.findOne({ where: { tweet_id, utilizador_id } });
        if (likeExistente) {
            return res.status(409).json({ mensagem: 'Já deste like neste tweet' });
        }

        const novoLike = await Gosto.create({
            tweet_id,
            utilizador_id
        });
        return res.status(201).json({ mensagem: 'Like adicionado com sucesso' });
    } catch (error) {
        console.error('Erro ao adicionar like:', error);
        return res.status(500).json({ mensagem: 'Erro ao adicionar like' });
    }
}

async function removerLike(req, res) {
    try {
        const { tweet_id } = req.params;
        const utilizador_id = req.user.utilizador_id;

        if (!tweet_id){
            return res.status(400).json({ mensagem: 'ID do tweet é obrigatório' });
        }

        const tweet = await Tweet.findOne({ where: { tweet_id, ativo : true } });
        if (!tweet){
            return res.status(404).json({ mensagem: 'Tweet não encontrado' });
        }

        const likeExistente = await Gosto.findOne({ where: { tweet_id, utilizador_id } });
        if (!likeExistente) {
            return res.status(404).json({ mensagem: 'Like não encontrado para remoção' });
        }

        await likeExistente.destroy();
        return res.status(200).json({ mensagem: 'Like removido com sucesso' });

    } catch (error) {
        console.error('Erro ao remover like:', error);
        return res.status(500).json({ mensagem: 'Erro ao remover like' });
    }
}

module.exports = {
    criarTweet,
    getAllTweets,
    comentarTweet,
    darLike,  
    removerLike,
    editarTweet,
    eliminarTweet
};