const { Utilizador, Gosto, Comentario, ImagemTweet, Tweet } = require('../models');

async function listarUtilizadores(req, res) {
    try{
        const utilizadores = await Utilizador.findAll({
            attributes: { exclude: ['password_hash'] },
            order: [['nome_utilizador', 'ASC']]
        });
        res.json(utilizadores);
    }catch(error){
        console.error('Erro ao listar utilizadores:', error);
        res.status(500).json({ mensagem: 'Erro ao listar utilizadores' });
    }
}

async function editarUtilizador(req, res) {
    try{
        const { utilizador_id } = req.params;
        const dados = req.body;

        if (!utilizador_id) {
            return res.status(400).json({ mensagem: 'ID do utilizador é obrigatório' });
        }

        const utilizador = await Utilizador.findByPk(utilizador_id);

        if (!utilizador) {
            return res.status(404).json({ mensagem: 'Utilizador não encontrado' });
        }

        const camposPermitidos = {
            nome: dados.nome,
            nome_utilizador: dados.nome_utilizador,
            email: dados.email,
            biografia: dados.biografia,
            foto_perfil: dados.foto_perfil,
            is_admin: dados.is_admin,
            ativo: dados.ativo
        };

        Object.keys(camposPermitidos).forEach((campo) => {
            if (camposPermitidos[campo] === undefined) {
                delete camposPermitidos[campo];
            }
        });

        await utilizador.update(camposPermitidos);
        res.status(200).json({ mensagem: 'Utilizador atualizado com sucesso', utilizador });
    }catch(error){
        console.error('Erro ao editar utilizadores:', error);
        res.status(500).json({ mensagem: 'Erro ao editar utilizadores' });
    }
}

async function eliminarUtilizador(req, res) {
    try{
        const { utilizador_id } = req.params;

        if (!utilizador_id) {
            return res.status(400).json({ mensagem: 'ID do utilizador é obrigatório' });
        }

        const utilizador = await Utilizador.findByPk(utilizador_id);

        if (!utilizador) {
            return res.status(404).json({ mensagem: 'Utilizador não encontrado' });
        }

        if (Number(utilizador_id) === req.user.utilizador_id) {
            return res.status(400).json({ mensagem: 'Não podes eliminar a tua própria conta' });
        }

        if (!utilizador.ativo) {
            return res.status(400).json({ mensagem: 'Utilizador já está eliminado' });
        }

        await utilizador.update({ ativo: false });
        res.status(200).json({ mensagem: 'Utilizador eliminado com sucesso' });

    }catch(error){
        console.error('Erro ao eliminar utilizadores:', error);
        res.status(500).json({ mensagem: 'Erro ao eliminar utilizadores' });
    }
}

async function listarTweetsAdmin(req, res) {
    try{
        const tweets = await Tweet.findAll({
            include: [
                { model: Utilizador, as: 'Utilizador', attributes: ['utilizador_id', 'nome_utilizador'] },
                { model: Gosto, as: 'Gostos', attributes: ['utilizador_id', 'tweet_id'] },
                { model: Comentario, as: 'Comentarios', attributes: ['comentario_id'] },
                { model: ImagemTweet, as: 'ImagemTweet', attributes: ['imagem_id', 'url_imagem'] }
            ],
            order: [['criado_em', 'DESC']]
        });
        res.status(200).json(tweets);
    }catch(error){
        console.error('Erro ao listar tweets:', error);
        res.status(500).json({ mensagem: 'Erro ao listar tweets' });
    }
}

async function editarTweetAdmin(req, res) {
    try{
        const { tweet_id } = req.params;
        const dados = req.body;

        if (!tweet_id) {
            return res.status(400).json({ mensagem: 'ID do tweet é obrigatório' });
        }

        const tweet = await Tweet.findByPk(tweet_id);

        if (!tweet) {
            return res.status(404).json({ mensagem: 'Tweet não encontrado' });
        }

        const camposPermitidos = {
            conteudo: dados.conteudo,
            ativo: dados.ativo
        };

        Object.keys(camposPermitidos).forEach((campo) => {
            if (camposPermitidos[campo] === undefined) {
                delete camposPermitidos[campo];
            }
        });

        if (dados.conteudo !== undefined) {
            if (dados.conteudo.trim() === '') {
                return res.status(400).json({ mensagem: 'Conteúdo do tweet não pode ser vazio' });
            }

            if (dados.conteudo.length > 280) {
                return res.status(400).json({ mensagem: 'Conteúdo do tweet não pode exceder 280 caracteres' });
            }

            camposPermitidos.conteudo = dados.conteudo.trim();
        }

        await tweet.update(camposPermitidos);
        return res.status(200).json({ mensagem: 'Tweet atualizado com sucesso', tweet });

    } catch(error){
        console.error('Erro ao editar tweet:', error);
        return res.status(500).json({ mensagem: 'Erro ao editar tweet' });
    }
}

async function eliminarTweetAdmin(req, res) {
    try{
        const { tweet_id } = req.params;

        if (!tweet_id) {
            return res.status(400).json({ mensagem: 'ID do tweet é obrigatório' });
        }

        const tweet = await Tweet.findByPk(tweet_id);

        if (!tweet) {
            return res.status(404).json({ mensagem: 'Tweet não encontrado' });
        }   

        if (!tweet.ativo) {
            return res.status(400).json({ mensagem: 'Tweet já está eliminado' });
        }

        await tweet.update({ ativo: false });
        return res.status(200).json({ mensagem: 'Tweet eliminado com sucesso' });
    }catch(error){
        console.error('Erro ao eliminar tweet:', error);
        return res.status(500).json({ mensagem: 'Erro ao eliminar tweet' });
    }
}

module.exports = {
    listarUtilizadores,
    editarUtilizador,
    eliminarUtilizador,
    listarTweetsAdmin,
    editarTweetAdmin,
    eliminarTweetAdmin
};