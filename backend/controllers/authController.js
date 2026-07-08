const { Utilizador } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_CREDENTIALS_MESSAGE = 'Credenciais inválidas';

// SignUp 
async function signUp(req, res) {
    const { nome_utilizador, email, password, nome } = req.body;
    if (!nome_utilizador || !email || !password || !nome) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ mensagem: 'Email inválido' });
    }

    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ mensagem: 'A password deve ter pelo menos 6 caracteres' });
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

// Login 
async function login(req, res) {
    const { nome_utilizador, password } = req.body || {};
    if (!nome_utilizador || !password) {
        return res.status(400).json({ mensagem: 'Nome de utilizador e password são obrigatórios' });
    }

    const utilizador = await Utilizador.findOne({
        where: { nome_utilizador: nome_utilizador } 
    });
    if (!utilizador) {
        return res.status(401).json({ mensagem: INVALID_CREDENTIALS_MESSAGE });
    }

    const passwordMatch = await bcrypt.compare(password, utilizador.password_hash);
    if (!passwordMatch) {
        return res.status(401).json({ mensagem: INVALID_CREDENTIALS_MESSAGE });
    }

    // Gerar token JWT
    const token = jwt.sign(
        {
            utilizador_id: utilizador.utilizador_id,
            nome_utilizador: utilizador.nome_utilizador,
            is_admin: utilizador.is_admin
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return res.status(200).json({
        mensagem: 'Login bem-sucedido',
        token,
        utilizador: {
            utilizador_id: utilizador.utilizador_id,
            nome_utilizador: utilizador.nome_utilizador,
            email: utilizador.email,
            nome: utilizador.nome,
            is_admin: utilizador.is_admin,
            ativo: utilizador.ativo
        }
    });
}

// Logout
async function logout(req, res) {
    try{
        return res.status(200).json({ mensagem: 'Logout bem-sucedido' });
    }catch(error){
        console.error('Erro ao fazer logout:', error);
        return res.status(500).json({ mensagem: 'Erro ao fazer logout' });
    }
}

module.exports = {
    signUp,
    login,
    logout
}
