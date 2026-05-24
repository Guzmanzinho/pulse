const express = require('express'); 
const router = express.Router();

const { signUp, login, logout } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/signup', signUp);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);

router.get('/perfil', authMiddleware, (req, res) => {
    res.json({
        mensagem: 'Acesso ao perfil protegido!',
        user: req.user
    })
});

router.get('/teste', (req, res) => {
    res.json({ message: 'Rota de teste de autenticação!' });
});

module.exports = router;