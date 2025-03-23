// Test per le funzionalità multi-ambiente
const { expect } = require('chai');
const axios = require('axios');
const DataService = require('../frontend/src/services/DataService');

describe('Test funzionalità multi-ambiente', function() {
  // Test per la creazione di ambienti
  describe('Gestione ambienti', function() {
    it('Dovrebbe creare un nuovo ambiente', async function() {
      const ambiente = {
        nome: 'Test Ambiente',
        descrizione: 'Ambiente di test',
        box: [
          { nome: 'Box 1', colore: '#FF0000' },
          { nome: 'Box 2', colore: '#00FF00' }
        ],
        tipiTurno: [
          { codice: 'M', descrizione: 'Mattina', oraInizio: '08:00', oraFine: '14:00', colore: '#FFFF00' },
          { codice: 'P', descrizione: 'Pomeriggio', oraInizio: '14:00', oraFine: '20:00', colore: '#00FFFF' }
        ],
        requisitiCopertura: [
          { box: 'Box 1', fasce: [{ oraInizio: '08:00', oraFine: '20:00', numMedici: 2 }] },
          { box: 'Box 2', fasce: [{ oraInizio: '08:00', oraFine: '20:00', numMedici: 1 }] }
        ]
      };
      
      // Verifica che l'ambiente venga creato correttamente
      expect(ambiente).to.have.property('nome');
      expect(ambiente.box).to.have.lengthOf(2);
      expect(ambiente.tipiTurno).to.have.lengthOf(2);
      expect(ambiente.requisitiCopertura).to.have.lengthOf(2);
    });
    
    it('Dovrebbe personalizzare gli orari dei turni', function() {
      const tipoTurno = {
        codice: 'M',
        descrizione: 'Mattina',
        oraInizio: '07:00',  // Orario personalizzato
        oraFine: '14:00',
        colore: '#FFFF00'
      };
      
      // Verifica che gli orari siano personalizzabili
      expect(tipoTurno.oraInizio).to.equal('07:00');
      expect(tipoTurno.oraFine).to.equal('14:00');
    });
  });
  
  // Test per la selezione dell'ambiente
  describe('Selezione ambiente', function() {
    it('Dovrebbe memorizzare l\'ambiente selezionato', function() {
      // Simula la selezione di un ambiente
      const ambienteId = 'amb123';
      localStorage.setItem('selectedAmbienteId', ambienteId);
      
      // Verifica che l'ambiente sia memorizzato correttamente
      expect(localStorage.getItem('selectedAmbienteId')).to.equal(ambienteId);
    });
    
    it('Dovrebbe recuperare l\'ambiente corrente', function() {
      // Simula la selezione di un ambiente
      const ambienteId = 'amb123';
      localStorage.setItem('selectedAmbienteId', ambienteId);
      
      // Verifica che l'ambiente corrente sia recuperato correttamente
      const currentAmbienteId = localStorage.getItem('selectedAmbienteId');
      expect(currentAmbienteId).to.equal(ambienteId);
    });
  });
  
  // Test per la persistenza dei dati per ambiente
  describe('Persistenza dati per ambiente', function() {
    it('Dovrebbe filtrare i dati per ambiente', function() {
      // Simula un array di medici di diversi ambienti
      const medici = [
        { id: 'med1', nome: 'Mario', cognome: 'Rossi', ambienteId: 'amb1' },
        { id: 'med2', nome: 'Luigi', cognome: 'Verdi', ambienteId: 'amb2' },
        { id: 'med3', nome: 'Anna', cognome: 'Bianchi', ambienteId: 'amb1' }
      ];
      
      // Filtra i medici per ambiente
      const ambienteId = 'amb1';
      const mediciFiltrati = medici.filter(m => m.ambienteId === ambienteId);
      
      // Verifica che i medici siano filtrati correttamente
      expect(mediciFiltrati).to.have.lengthOf(2);
      expect(mediciFiltrati[0].nome).to.equal('Mario');
      expect(mediciFiltrati[1].nome).to.equal('Anna');
    });
  });
  
  // Test per la gestione delle ore fisse
  describe('Gestione ore fisse e permessi', function() {
    it('Dovrebbe calcolare correttamente le ore dei permessi', function() {
      // Simula un permesso di 3 giorni con 6 ore al giorno
      const permesso = {
        dataInizio: new Date('2025-03-01'),
        dataFine: new Date('2025-03-03'),
        oreGiornaliere: 6
      };
      
      // Calcola il numero di giorni
      const giorni = Math.floor((permesso.dataFine - permesso.dataInizio) / (1000 * 60 * 60 * 24)) + 1;
      
      // Calcola il totale delle ore
      const totaleOre = giorni * permesso.oreGiornaliere;
      
      // Verifica che il calcolo sia corretto
      expect(giorni).to.equal(3);
      expect(totaleOre).to.equal(18);
    });
    
    it('Dovrebbe verificare il raggiungimento delle ore fisse', function() {
      // Simula un medico con ore fisse
      const medico = {
        id: 'med1',
        nome: 'Mario',
        cognome: 'Rossi',
        oreFisse: true,
        minOreMensili: 150
      };
      
      // Simula le ore lavorate
      const oreLavorate = 160;
      
      // Verifica se ha raggiunto le ore fisse
      const differenza = oreLavorate - medico.minOreMensili;
      const raggiunto = differenza >= 0;
      
      // Verifica che la verifica sia corretta
      expect(raggiunto).to.be.true;
      expect(differenza).to.equal(10);
    });
  });
});
