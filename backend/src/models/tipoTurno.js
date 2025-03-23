const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TipoTurno = sequelize.define('TipoTurno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codice: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descrizione: {
    type: DataTypes.STRING,
    allowNull: false
  },
  oraInizio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  oraFine: {
    type: DataTypes.TIME,
    allowNull: false
  },
  durataTotaleOre: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isNotturno: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  requireSmonto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = TipoTurno;
