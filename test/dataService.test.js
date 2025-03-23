const { expect } = require('chai');
const sinon = require('sinon');

// Mock per localStorage
global.localStorage = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value.toString();
  },
  clear: function() {
    this.store = {};
  }
};

// Importa il servizio DataService
const DataService = require('../../frontend/src/services/DataService').default;

describe('DataService', () => {
  beforeEach(() => {
    // Pulisce localStorage prima di ogni test
    localStorage.clear();
  });

  describe('Gestione Medici', () => {
    it('dovrebbe salvare e caricare i medici correttamente', () => {
      const medici = [
        { id: 1, nome: 'Mario Rossi', competenze: { box1: true, box2: false, box3: true } },
        { id: 2, nome: 'Laura Bianchi', competenze: { box1: false, box2: true, box3: true } }
      ];
      
      DataService.saveMedici(medici);
      const mediciCaricati = DataService.loadMedici();
      
      expect(mediciCaricati).to.deep.equal(medici);
    });
  });

  describe('Gestione Disponibilità', () => {
    it('dovrebbe salvare e caricare le disponibilità di un medico correttamente', () => {
      const medicoId = 1;
      const mese = 3;
      const anno = 2025;
      const disponibilita = {
        1: ['M', 'P'],
        2: ['N'],
        3: ['MP']
      };
      
      DataService.saveDisponibilitaMedico(medicoId, mese, anno, disponibilita);
      const disponibilitaCaricate = DataService.loadDisponibilitaMedico(medicoId, mese, anno);
      
      expect(disponibilitaCaricate).to.deep.equal(disponibilita);
    });
  });

  describe('Gestione Turni Fissi', () => {
    it('dovrebbe salvare e caricare i turni fissi di un medico correttamente', () => {
      const medicoId = 1;
      const turniFissi = ['M', 'P', 'N', 'S', 'R', 'M', 'P'];
      
      DataService.saveTurniFissiMedico(medicoId, turniFissi);
      const turniFissiCaricati = DataService.loadTurniFissiMedico(medicoId);
      
      expect(turniFissiCaricati).to.deep.equal(turniFissi);
    });
  });

  describe('Gestione Turni Generati', () => {
    it('dovrebbe salvare e caricare i turni generati correttamente', () => {
      const mese = 3;
      const anno = 2025;
      const turni = {
        mese: mese,
        anno: anno,
        giorni: [
          {
            data: '01/03/2025',
            box1: { mattina: { medico: 1 }, pomeriggio: { medico: 2 }, notte: { medico: 3 } },
            box2: { mattina: { medico: 4 }, pomeriggio: { medico: 1 }, notte: { medico: 2 } },
            box3: { mattina: { medico: 3 }, pomeriggio: { medico: 4 }, notte: null }
          }
        ]
      };
      
      DataService.saveTurniGenerati(mese, anno, turni);
      const turniCaricati = DataService.loadTurniGenerati(mese, anno);
      
      expect(turniCaricati).to.deep.equal(turni);
    });
  });

  describe('Gestione Requisiti Copertura', () => {
    it('dovrebbe salvare e caricare i requisiti di copertura correttamente', () => {
      const requisiti = {
        box1: { mattina: 2, pomeriggio: 2, notte: 2 },
        box2: { mattina: 2, pomeriggio: 2, notte: 2 },
        box3: { mattina: 1, pomeriggio: 1, notte: 0 }
      };
      
      DataService.saveRequisitiCopertura(requisiti);
      const requisitiCaricati = DataService.loadRequisitiCopertura();
      
      expect(requisitiCaricati).to.deep.equal(requisiti);
    });
  });

  describe('Gestione Ferie e Permessi', () => {
    it('dovrebbe salvare e caricare le ferie e i permessi di un medico correttamente', () => {
      const medicoId = 1;
      const feriePermessi = [
        { dataInizio: '2025-03-01', dataFine: '2025-03-07', tipo: 'ferie' },
        { dataInizio: '2025-03-15', dataFine: '2025-03-15', tipo: 'permesso104' }
      ];
      
      DataService.saveFeriePermessiMedico(medicoId, feriePermessi);
      const feriePermessiCaricati = DataService.loadFeriePermessiMedico(medicoId);
      
      expect(feriePermessiCaricati).to.deep.equal(feriePermessi);
    });
  });

  describe('Esportazione e Importazione Dati', () => {
    it('dovrebbe esportare e importare tutti i dati correttamente', () => {
      // Salva alcuni dati
      const medici = [{ id: 1, nome: 'Mario Rossi' }];
      const requisiti = { box1: { mattina: 2 } };
      
      DataService.saveMedici(medici);
      DataService.saveRequisitiCopertura(requisiti);
      
      // Esporta i dati
      const jsonData = DataService.exportAllData();
      
      // Pulisce localStorage
      localStorage.clear();
      
      // Verifica che i dati siano stati cancellati
      expect(DataService.loadMedici()).to.be.null;
      expect(DataService.loadRequisitiCopertura()).to.be.null;
      
      // Importa i dati
      const result = DataService.importAllData(jsonData);
      
      // Verifica che l'importazione sia avvenuta con successo
      expect(result).to.be.true;
      
      // Verifica che i dati siano stati ripristinati
      expect(DataService.loadMedici()).to.deep.equal(medici);
      expect(DataService.loadRequisitiCopertura()).to.deep.equal(requisiti);
    });
  });

  describe('Sincronizzazione con il Backend', () => {
    it('dovrebbe simulare la sincronizzazione con il backend', async () => {
      // Crea uno spy per console.log
      const consoleLogSpy = sinon.spy(console, 'log');
      
      // Chiama il metodo di sincronizzazione
      const result = await DataService.syncWithBackend();
      
      // Verifica che il metodo abbia restituito true
      expect(result).to.be.true;
      
      // Verifica che il messaggio di log sia stato chiamato
      expect(consoleLogSpy.calledWith('Sincronizzazione con il backend completata')).to.be.true;
      
      // Ripristina console.log
      consoleLogSpy.restore();
    });
  });
});
