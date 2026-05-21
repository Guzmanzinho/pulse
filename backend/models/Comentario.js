const { Datatypes } = require('sequelize');
const sequelize = require('../config/database');

const Comentario = sequelize.define('Comentario', {
  comentario_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  tweet_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  utilizador_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  conteudo: {
    type: DataTypes.STRING(280),
    allowNull: false
  },

  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
},{
    tableName: 'comentario',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
});

module.exports = Comentario;