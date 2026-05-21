const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilizador = sequelize.define('Utilizador', {
  utilizador_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  nome_utilizador: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },

  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true
  },

  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  nome: {
    type: DataTypes.STRING(80),
    allowNull: false
  },

  biografia: {
    type: DataTypes.STRING(160),
    allowNull: true
  },

  foto_perfil: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  is_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },

  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'utilizador',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: 'atualizado_em'
});

module.exports = Utilizador;