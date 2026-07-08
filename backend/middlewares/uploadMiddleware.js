const multer = require('multer');
const path = require('path');

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas são permitidas imagens'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_IMAGE_SIZE_BYTES
    }
}).single('imagem');

module.exports = function uploadMiddleware(req, res, next) {
    upload(req, res, function(error) {
        if (!error) {
            return next();
        }

        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ mensagem: 'Imagem demasiado grande. O limite é 2 MB.' });
        }

        return res.status(400).json({ mensagem: error.message || 'Erro ao enviar imagem' });
    });
};
