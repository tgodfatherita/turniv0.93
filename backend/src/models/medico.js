// Modifiche al modello Medico per supportare multi-ambiente
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Medico extends Model {
    static associate(models) {
      // Un medico appartiene a un ambiente
      Medico.belongsTo(models.Ambiente, {
        foreignKey: 'ambienteId',
        as: 'ambiente'
      });
      
      // Altre associazioni esistenti...
    }
  }
  
  Medico.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cognome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    specializzazione: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ambienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ambienti',
        key: 'id'
      }
    },
    competenze: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    priorita: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Bassa'
    },
    minOreMensili: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    maxOreMensili: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    oreFisse: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Medico',
    tableName: 'medici',
    timestamps: true
  });
  
  return Medico;
};
