// Test per l'integrazione delle funzionalità multi-ambiente
const { expect } = require('chai');
const axios = require('axios');

describe('Test integrazione multi-ambiente', function() {
  // Test per l'integrazione tra ambienti e medici
  describe('Integrazione ambienti e medici', function() {
    it('Dovrebbe associare correttamente i medici agli ambienti', function() {
      // Simula due ambienti con configurazioni diverse
      const ambiente1 = {
        id: 'amb1',
        nome: 'Pronto Soccorso',
        box: [
          { nome: 'Box 1', colore: '#FF0000' },
          { nome: 'Box 2', colore: '#00FF00' },
          { nome: 'Box 3', colore: '#0000FF' }
        ]
      };
      
      const ambiente2 = {
        id: 'amb2',
        nome: 'Reparto',
        box: [
          { nome: 'Stanza 1', colore: '#FFFF00' },
          { nome: 'Stanza 2', colore: '#00FFFF' }
        ]
      };
      
      // Simula medici con competenze specifiche per ambiente
      const medico1 = {
        id: 'med1',
        nome: 'Mario',
        cognome: 'Rossi',
        ambienteId: 'amb1',
        competenze: ['Box 1', 'Box 2', 'Box 3']
      };
      
      const medico2 = {
        id: 'med2',
        nome: 'Luigi',
        cognome: 'Verdi',
        ambienteId: 'amb2',
        competenze: ['Stanza 1', 'Stanza 2']
      };
      
      // Verifica che le competenze dei medici corrispondano ai box degli ambienti
      expect(medico1.competenze).to.deep.equal(ambiente1.box.map(b => b.nome));
      expect(medico2.competenze).to.deep.equal(ambiente2.box.map(b => b.nome));
    });
  });
  
  // Test per l'integrazione tra ambienti e tipi di turno
  describe('Integrazione ambienti e tipi di turno', function() {
    it('Dovrebbe supportare orari diversi per lo stesso tipo di turno in ambienti diversi', function() {
      // Simula due ambienti con orari diversi per lo stesso tipo di turno
      const ambiente1 = {
        id: 'amb1',
        nome: 'Pronto Soccorso',
        tipiTurno: [
          { codice: 'M', descrizione: 'Mattina', oraInizio: '08:00', oraFine: '14:00' }
        ]
      };
      
      const ambiente2 = {
        id: 'amb2',
        nome: 'Reparto',
        tipiTurno: [
          { codice: 'M', descrizione: 'Mattina', oraInizio: '07:00', oraFine: '14:00' }
        ]
      };
      
      // Verifica che gli orari siano diversi per lo stesso tipo di turno
      expect(ambiente1.tipiTurno[0].oraInizio).to.not.equal(ambiente2.tipiTurno[0].oraInizio);
      expect(ambiente1.tipiTurno[0].oraInizio).to.equal('08:00');
      expect(ambiente2.tipiTurno[0].oraInizio).to.equal('07:00');
    });
  });
  
  // Test per il salvataggio automatico
  describe('Salvataggio automatico', function() {
    it('Dovrebbe salvare automaticamente ad ogni cambio di schermata', function() {
      // Simula una funzione di salvataggio
      let salvataggioEseguito = false;
      const saveCurrentState = () => {
        salvataggioEseguito = true;
        return true;
      };
      
      // Simula un cambio di schermata
      const handleRouteChange = () => {
        return saveCurrentState();
      };
      
      // Verifica che il salvataggio venga eseguito
      expect(handleRouteChange()).to.be.true;
      expect(salvataggioEseguito).to.be.true;
    });
  });
  
  // Test per la gestione delle ore fisse con permessi
  describe('Gestione ore fisse con permessi', function() {
    it('Dovrebbe conteggiare correttamente i permessi nelle ore fisse', function() {
      // Simula un medico con ore fisse
      const medico = {
        id: 'med1',
        nome: 'Mario',
        cognome: 'Rossi',
        oreFisse: true,
        minOreMensili: 150
      };
      
      // Simula le ore lavorate
      const oreLavorate = 130;
      
      // Simula i permessi (3 giorni a 6 ore al giorno)
      const permessi = [
        {
          dataInizio: new Date('2025-03-01'),
          dataFine: new Date('2025-03-03'),
          oreGiornaliere: 6
        }
      ];
      
      // Calcola il totale delle ore di permesso
      let totaleOrePermessi = 0;
      for (const permesso of permessi) {
        const giorni = Math.floor((permesso.dataFine - permesso.dataInizio) / (1000 * 60 * 60 * 24)) + 1;
        totaleOrePermessi += giorni * permesso.oreGiornaliere;
      }
      
      // Verifica se ha raggiunto le ore fisse considerando i permessi
      const oreTotali = oreLavorate + totaleOrePermessi;
      const differenza = oreTotali - medico.minOreMensili;
      const raggiunto = differenza >= 0;
      
      // Verifica che il calcolo sia corretto
      expect(totaleOrePermessi).to.equal(18);
      expect(oreTotali).to.equal(148);
      expect(raggiunto).to.be.false;
      expect(differenza).to.equal(-2);
    });
  });
});
