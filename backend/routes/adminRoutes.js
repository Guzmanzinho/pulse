const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const { 
    listarUtilizadores,
    editarUtilizador,
    eliminarUtilizador,
    listarTweetsAdmin,
    editarTweetAdmin,
    eliminarTweetAdmin
} = require('../controllers/adminController');

router.get('/utilizadores', authMiddleware, adminMiddleware, listarUtilizadores);
router.put('/utilizadores/:utilizador_id', authMiddleware, adminMiddleware, editarUtilizador);
router.delete('/utilizadores/:utilizador_id', authMiddleware, adminMiddleware, eliminarUtilizador);
router.get('/tweets', authMiddleware, adminMiddleware, listarTweetsAdmin);
router.put('/tweets/:tweet_id', authMiddleware, adminMiddleware, editarTweetAdmin);
router.delete('/tweets/:tweet_id', authMiddleware, adminMiddleware, eliminarTweetAdmin);

module.exports = router;