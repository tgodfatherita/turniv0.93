// Modifiche al modello PianificazioneTurni per supportare multi-ambiente
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PianificazioneTurni extends Model {
    static associate(models) {
      // Una pianificazione turni appartiene a un ambiente
      PianificazioneTurni.belongsTo(models.Ambiente, {
        foreignKey: 'ambienteId',
        as: 'ambiente'
      });
    }
  }
  
  PianificazioneTurni.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ambienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ambienti',
        key: 'id'
      }
    },
    mese: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    anno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    giorni: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    statistiche: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    parametriGenerazione: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'PianificazioneTurni',
    tableName: 'pianificazione_turni',
    timestamps: true
  });
  
  return PianificazioneTurni;
};
