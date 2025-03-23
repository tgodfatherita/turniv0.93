// ambiente.js
// Modello per la gestione degli ambienti

module.exports = (sequelize, DataTypes) => {
  const Ambiente = sequelize.define('Ambiente', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    descrizione: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    configurazione: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        box: [],
        turni: [],
        requisitiCopertura: {}
      }
    },
    dataCreazione: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dataModifica: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ambienti',
    timestamps: true,
    createdAt: 'dataCreazione',
    updatedAt: 'dataModifica',
    hooks: {
      beforeCreate: (ambiente) => {
        // Inizializza la configurazione di default se non specificata
        if (!ambiente.configurazione) {
          ambiente.configurazione = {
            box: [],
            turni: [],
            requisitiCopertura: {}
          };
        }
      }
    }
  });

  Ambiente.associate = (models) => {
    // Un ambiente ha molti medici
    Ambiente.hasMany(models.Medico, {
      foreignKey: 'ambienteId',
      as: 'medici'
    });

    // Un ambiente ha molte disponibilità
    Ambiente.hasMany(models.Disponibilita, {
      foreignKey: 'ambienteId',
      as: 'disponibilita'
    });

    // Un ambiente ha molte pianificazioni turni
    Ambiente.hasMany(models.PianificazioneTurni, {
      foreignKey: 'ambienteId',
      as: 'pianificazioniTurni'
    });

    // Un ambiente ha molti turni fissi
    Ambiente.hasMany(models.TurniFissi, {
      foreignKey: 'ambienteId',
      as: 'turniFissi'
    });

    // Un ambiente ha molte ferie e permessi
    Ambiente.hasMany(models.FeriePermessi, {
      foreignKey: 'ambienteId',
      as: 'feriePermessi'
    });
  };

  // Metodo per creare un ambiente di default
  Ambiente.createDefault = async function() {
    return await this.create({
      nome: 'Pronto Soccorso',
      descrizione: 'Ambiente di default per la gestione dei turni del pronto soccorso',
      configurazione: {
        box: [
          {
            id: 1,
            nome: 'Box 1',
            descrizione: 'Box per emergenze',
            orari: {
              apertura: '00:00',
              chiusura: '24:00'
            }
          },
          {
            id: 2,
            nome: 'Box 2',
            descrizione: 'Box per urgenze',
            orari: {
              apertura: '00:00',
              chiusura: '24:00'
            }
          },
          {
            id: 3,
            nome: 'Box 3',
            descrizione: 'Box per codici minori',
            orari: {
              apertura: '08:00',
              chiusura: '20:00'
            }
          }
        ],
        turni: [
          {
            codice: 'M',
            descrizione: 'Mattina',
            oraInizio: '08:00',
            oraFine: '14:00',
            durataTotaleOre: 6,
            isNotturno: false,
            requireSmonto: false
          },
          {
            codice: 'P',
            descrizione: 'Pomeriggio',
            oraInizio: '14:00',
            oraFine: '20:00',
            durataTotaleOre: 6,
            isNotturno: false,
            requireSmonto: false
          },
          {
            codice: 'MP',
            descrizione: 'Mattina-Pomeriggio',
            oraInizio: '08:00',
            oraFine: '20:00',
            durataTotaleOre: 12,
            isNotturno: false,
            requireSmonto: false
          },
          {
            codice: 'N',
            descrizione: 'Notte',
            oraInizio: '20:00',
            oraFine: '08:00',
            durataTotaleOre: 12,
            isNotturno: true,
            requireSmonto: true
          },
          {
            codice: 'MN',
            descrizione: 'Mattina-Notte',
            oraInizio: '08:00',
            oraFine: '08:00',
            durataTotaleOre: 24,
            isNotturno: true,
            requireSmonto: true
          },
          {
            codice: 'PN',
            descrizione: 'Pomeriggio-Notte',
            oraInizio: '14:00',
            oraFine: '08:00',
            durataTotaleOre: 18,
            isNotturno: true,
            requireSmonto: true
          },
          {
            codice: 'MPN',
            descrizione: 'Mattina-Pomeriggio-Notte',
            oraInizio: '08:00',
            oraFine: '08:00',
            durataTotaleOre: 24,
            isNotturno: true,
            requireSmonto: true
          },
          {
            codice: 'S',
            descrizione: 'Smonto',
            oraInizio: '00:00',
            oraFine: '00:00',
            durataTotaleOre: 0,
            isNotturno: false,
            requireSmonto: false
          },
          {
            codice: 'R',
            descrizione: 'Riposo',
            oraInizio: '00:00',
            oraFine: '00:00',
            durataTotaleOre: 0,
            isNotturno: false,
            requireSmonto: false
          }
        ],
        requisitiCopertura: {
          box1: { mattina: 2, pomeriggio: 2, notte: 2 },
          box2: { mattina: 2, pomeriggio: 2, notte: 2 },
          box3: { mattina: 1, pomeriggio: 1, notte: 0 }
        }
      }
    });
  };

  return Ambiente;
};
