const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gosto = sequelize.define('Gosto', {
  utilizador_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },

  tweet_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, {
    tableName: 'gosto',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: false
});

module.exports = Gosto;