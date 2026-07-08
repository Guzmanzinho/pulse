const path = require('path');
const fs = require('fs');
const request = require('supertest');

process.env.DOTENV_CONFIG_QUIET = 'true';

jest.mock('morgan', () => () => (req, res, next) => next());

jest.mock('../config/database', () => ({
    authenticate: jest.fn(),
    sync: jest.fn()
}));

jest.mock('../models', () => ({
    Utilizador: {
        findOne: jest.fn()
    },
    Tweet: {},
    Comentario: {},
    ImagemTweet: {},
    Gosto: {},
    Seguimento: {}
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn()
}));

const originalExistsSync = fs.existsSync;

jest.spyOn(fs, 'existsSync').mockImplementation((targetPath) => {
    const normalizedTarget = path.normalize(String(targetPath));
    const normalizedUploads = path.normalize(path.join('backend', 'uploads'));

    if (normalizedTarget.endsWith(normalizedUploads)) {
        return true;
    }

    return originalExistsSync.call(fs, targetPath);
});

const app = require('../app');
const bcrypt = require('bcrypt');
const { Utilizador } = require('../models');

describe('backend API basics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        fs.existsSync.mockRestore();
    });

    describe('GET /health', () => {
        it('responds with ok status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toEqual({ status: 'ok' });
        });
    });

    describe('POST /api/auth/login', () => {
        it('returns 400 when the body is missing', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .expect(400);

            expect(response.body).toEqual({
                mensagem: 'Nome de utilizador e password s\u00e3o obrigat\u00f3rios'
            });
            expect(Utilizador.findOne).not.toHaveBeenCalled();
        });

        it('returns a generic 401 when the user does not exist', async () => {
            Utilizador.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    nome_utilizador: 'missing-user',
                    password: 'secret123'
                })
                .expect(401);

            expect(response.body).toEqual({
                mensagem: 'Credenciais inv\u00e1lidas'
            });
            expect(Utilizador.findOne).toHaveBeenCalledWith({
                where: { nome_utilizador: 'missing-user' }
            });
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });
    });

    describe('GET /api/auth/perfil', () => {
        it('rejects requests without a token', async () => {
            await request(app)
                .get('/api/auth/perfil')
                .expect(401);
        });
    });
});
