const {Utilizador, Seguimento, Tweet, Comentario, Gosto, ImagemTweet}= require('../models');

// Follow
async function seguirUtilizador(req, res) {
    try{
        const seguidor_id = req.user.utilizador_id;
        const {utilizador_id} = req.params;
        const seguido_id = Number(utilizador_id);

        if(!utilizador_id){
            return res.status(400).json({ mensagem: 'ID do utilizador a seguir é obrigatório' });
        }

        if (isNaN(seguido_id)) {
            return res.status(400).json({ mensagem: 'ID do utilizador inválido' });
        }

        if (seguido_id === seguidor_id) {
            return res.status(400).json({ mensagem: 'Não podes seguir-te a ti mesmo' });
        }

        const utilizadorASeguir = await Utilizador.findOne({ where: { utilizador_id } });
        if (!utilizadorASeguir) {
            return res.status(404).json({ mensagem: 'Utilizador a seguir não encontrado' });
        }

        const seguimentoExistente = await Seguimento.findOne({ where: { seguidor_id, seguido_id: utilizador_id } });
        if (seguimentoExistente) {
            return res.status(409).json({ mensagem: 'Já segues este utilizador' });
        }

        await Seguimento.create({ seguidor_id, seguido_id: utilizador_id });
        return res.status(201).json({ mensagem: 'Seguiste o utilizador com sucesso' });

    }catch (error) {
        console.error('Erro ao seguir o utilizador:', error);
        return res.status(500).json({ mensagem: 'Erro ao seguir o utilizador' });
    }
}

// Unfollow
async function deixarDeSeguirUtilizador(req, res) {
    try{
        const seguidor_id = req.user.utilizador_id;
        const {utilizador_id} = req.params;
        const seguido_id = Number(utilizador_id);

        if(!utilizador_id){
            return res.status(400).json({ mensagem: 'ID do utilizador a deixar de seguir é obrigatório' });
        }

        if (isNaN(seguido_id)) {
            return res.status(400).json({ mensagem: 'ID do utilizador inválido' });
        }

        if (seguido_id === seguidor_id) {
            return res.status(400).json({ mensagem: 'Não podes deixar de seguir-te a ti mesmo' });
        }

        const utilizadorADeixarDeSeguir = await Utilizador.findOne({
            where: { utilizador_id : seguido_id } 
        });
        if (!utilizadorADeixarDeSeguir) {
            return res.status(404).json({ mensagem: 'Utilizador a deixar de seguir não encontrado' });
        }

        const seguimentoExistente = await Seguimento.findOne({ where: { seguidor_id, seguido_id} });
        if (!seguimentoExistente) {
            return res.status(404).json({ mensagem: 'Não segues este utilizador' });
        }

        await Seguimento.destroy({ where: { seguidor_id, seguido_id} });
        return res.status(200).json({ mensagem: 'Deixaste de seguir o utilizador com sucesso' });

    }catch (error) {
        console.error('Erro ao deixar de seguir o utilizador:', error);
        return res.status(500).json({ mensagem: 'Erro ao deixar de seguir o utilizador' });
    }
}

async function obterFeed(req, res) {
    try{
        const utilizador_id = req.user.utilizador_id;

        const seguimentos = await Seguimento.findAll({ where: { seguidor_id: utilizador_id } });
        const idsSeguidos = seguimentos.map(s => s.seguido_id);

        if (idsSeguidos.length === 0) {
            return res.status(200).json({ feed: [] });
        }

        const feed = await Tweet.findAll({
            where: { 
                utilizador_id: idsSeguidos,
                ativo: true
            },
            order: [['criado_em', 'DESC']],
        });

        return res.status(200).json({ feed });

    }catch(erro){
        console.error('Erro ao obter o feed:', erro);
        return res.status(500).json({ mensagem: 'Erro ao obter o feed' });
    }
}

module.exports = {
    seguirUtilizador,
    deixarDeSeguirUtilizador,
    obterFeed
}