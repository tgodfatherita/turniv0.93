// Modifiche al modello FeriePermessi per supportare multi-ambiente
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FeriePermessi extends Model {
    static associate(models) {
      // Una ferie/permesso appartiene a un medico
      FeriePermessi.belongsTo(models.Medico, {
        foreignKey: 'medicoId',
        as: 'medico'
      });
      
      // Una ferie/permesso appartiene a un ambiente
      FeriePermessi.belongsTo(models.Ambiente, {
        foreignKey: 'ambienteId',
        as: 'ambiente'
      });
    }
  }
  
  FeriePermessi.init({
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
    dataInizio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    dataFine: {
      type: DataTypes.DATE,
      allowNull: false
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ferie'
    },
    oreGiornaliere: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 6
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'FeriePermessi',
    tableName: 'ferie_permessi',
    timestamps: true
  });
  
  return FeriePermessi;
};
