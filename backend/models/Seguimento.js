const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Seguimento = sequelize.define('Seguimento', {
  seguidor_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
    },

    seguido_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
    }
}, {
    tableName: 'seguimento',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: false
});

module.exports = Seguimento;