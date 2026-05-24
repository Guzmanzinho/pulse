function adminMiddleware(req, res, next) {
    const user = req.user;
    if(!user) {
        return res.status(401).json({ mensagem: 'Autenticação necessária' });
    }

    if (!user.is_admin) {
        return res.status(403).json({ mensagem: 'Acesso negado. Apenas administradores podem acessar esta rota.' });
    }

    next();
}

module.exports = adminMiddleware;