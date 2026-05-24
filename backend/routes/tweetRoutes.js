const express = require('express'); 
const router = express.Router();

const { 
    criarTweet, 
    getAllTweets, 
    comentarTweet, 
    darLike,
    removerLike,
    editarTweet,
    eliminarTweet
} = require('../controllers/tweetController');

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', getAllTweets);
router.post('/criar', authMiddleware, upload, criarTweet);
router.put('/:tweet_id', authMiddleware, editarTweet);
router.delete('/:tweet_id', authMiddleware, eliminarTweet);

router.post('/:tweet_id/comentar', authMiddleware, comentarTweet);
router.post('/:tweet_id/gosto', authMiddleware, darLike);
router.delete('/:tweet_id/gosto', authMiddleware, removerLike);

module.exports = router;