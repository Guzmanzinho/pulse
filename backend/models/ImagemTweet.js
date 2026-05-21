const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImagemTweet = sequelize.define('ImagemTweet', {
  imagem_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

    tweet_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  url_imagem: {
    type: DataTypes.STRING,
    allowNull: false
  },

  texto_alt: {
    type: DataTypes.STRING,
    allowNull: true
 }
}, {
    tableName: 'imagem_tweet',
    createdAt: 'criado_em',
    updatedAt: false
});

module.exports = ImagemTweet;