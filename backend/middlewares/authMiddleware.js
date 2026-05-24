const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ mensagem: 'Formato do token inválido' });
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ mensagem: 'Token inválido' });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ mensagem: 'Token de autenticação não fornecido' });
    }

};

module.exports = authMiddleware;