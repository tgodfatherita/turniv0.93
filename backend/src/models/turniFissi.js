// Modifiche al modello TurniFissi per supportare multi-ambiente
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TurniFissi extends Model {
    static associate(models) {
      // Un turno fisso appartiene a un medico
      TurniFissi.belongsTo(models.Medico, {
        foreignKey: 'medicoId',
        as: 'medico'
      });
      
      // Un turno fisso appartiene a un ambiente
      TurniFissi.belongsTo(models.Ambiente, {
        foreignKey: 'ambienteId',
        as: 'ambiente'
      });
    }
  }
  
  TurniFissi.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    medicoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medici',
        key: 'id'
      }
    },
    ambienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ambienti',
        key: 'id'
      }
    },
    sequenza: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    dataInizio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    attivo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'TurniFissi',
    tableName: 'turni_fissi',
    timestamps: true
  });
  
  return TurniFissi;
};
