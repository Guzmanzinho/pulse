const express = require('express'); 
const router = express.Router();

const { signUp } = require('../controllers/authController');

router.post('/signup', signUp);

router.get('/teste', (req, res) => {
    res.json({ message: 'Rota de teste de autenticação!' });
});

module.exports = router;