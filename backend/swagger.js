const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Pulse API',
        description: 'API REST para clone Twitter/X',
    },
    host: 'localhost:3000',
    schemes: ['http'],
};

const outputFile = './swagger_output.json';
const endpointsFiles = [
    './app.js',
    './routes/authRoutes.js',
    './routes/usersRoutes.js',
    './routes/tweetRoutes.js',
    './routes/adminRoutes.js',
];

swaggerAutogen(outputFile, endpointsFiles, doc);