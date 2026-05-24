var express = require('express');
var router = express.Router();

const {
    seguirUtilizador,
    deixarDeSeguirUtilizador,
    obterFeed
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/feed', authMiddleware, obterFeed);
router.post('/:utilizador_id/seguir', authMiddleware, seguirUtilizador);
router.delete('/:utilizador_id/unfollow', authMiddleware, deixarDeSeguirUtilizador);

module.exports = router;