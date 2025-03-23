// Modifiche al modello Disponibilita per supportare multi-ambiente
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Disponibilita extends Model {
    static associate(models) {
      // Una disponibilità appartiene a un medico
      Disponibilita.belongsTo(models.Medico, {
        foreignKey: 'medicoId',
        as: 'medico'
      });
      
      // Una disponibilità appartiene a un ambiente
      Disponibilita.belongsTo(models.Ambiente, {
        foreignKey: 'ambienteId',
        as: 'ambiente'
      });
    }
  }
  
  Disponibilita.init({
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
    mese: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    anno: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    disponibilita: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Disponibilita',
    tableName: 'disponibilita',
    timestamps: true
  });
  
  return Disponibilita;
};
