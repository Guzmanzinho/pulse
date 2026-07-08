require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');

const dbSslEnabled = String(process.env.DB_SSL).toLowerCase() === 'true';

const sequelizeOptions = {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
};

if (dbSslEnabled) {
  const caPath = process.env.DB_SSL_CA_PATH;

  if (!caPath) {
    throw new Error('DB_SSL_CA_PATH is required when DB_SSL=true');
  }

  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: true
    }
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  sequelizeOptions
);

module.exports = sequelize;
