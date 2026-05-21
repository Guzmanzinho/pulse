const { Utilizador } = require('../models');
const bcrypt = require('bcrypt');

// SignUp 
async function signUp(req, res) {
    const { nome_utilizador, email, password, nome } = req.body;
    if (!nome_utilizador || !email || !password || !nome) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }

    if (await Utilizador.findOne({
        where: { nome_utilizador: nome_utilizador } 
        })
    ){
        return res.status(400).json({ mensagem: 'Nome de utilizador já existe' });
    } else if (await Utilizador.findOne({
        where: { email: email } 
        })
    ){
        return res.status(400).json({ mensagem: 'Email já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const novoUtilizador = await Utilizador.create({
            nome_utilizador,
            email,
            password_hash: hashedPassword,
            nome
        });
        res.status(201).json({
            mensagem: 'Utilizador criado com sucesso',
            utilizador: {
                utilizador_id: novoUtilizador.utilizador_id,
                nome_utilizador: novoUtilizador.nome_utilizador,
                email: novoUtilizador.email,
                nome: novoUtilizador.nome,
                is_admin: novoUtilizador.is_admin,
                ativo: novoUtilizador.ativo
            }
        });
    } catch (error) {
        console.error('Erro ao criar utilizador:', error);
        res.status(500).json({ mensagem: 'Erro ao criar utilizador' });
    }
}

module.exports = {
    signUp
}