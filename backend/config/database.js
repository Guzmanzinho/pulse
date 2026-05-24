require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const caPath = process.env.DB_SSL_CA_PATH;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialectOptions: {
      ssl: {
        require: true,
        ca: fs.readFileSync(caPath),
        rejectUnauthorized: true
      }
    }
  }
);

module.exports = sequelize;