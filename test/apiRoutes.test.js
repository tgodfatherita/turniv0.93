const { expect } = require('chai');
const sinon = require('sinon');
const express = require('express');
const request = require('supertest');

// Importa le route
const medicoRoutes = require('../../backend/src/routes/medicoRoutes');
const disponibilitaRoutes = require('../../backend/src/routes/disponibilitaRoutes');
const pianificazioneTurniRoutes = require('../../backend/src/routes/pianificazioneTurniRoutes');

// Crea un'app Express per i test
const app = express();
app.use(express.json());
app.use('/api/medici', medicoRoutes);
app.use('/api/disponibilita', disponibilitaRoutes);
app.use('/api/pianificazione', pianificazioneTurniRoutes);

// Mock per il database
const mockSequelize = {
  query: sinon.stub()
};

// Mock per i modelli
const mockMedico = {
  findAll: sinon.stub(),
  findByPk: sinon.stub(),
  create: sinon.stub(),
  update: sinon.stub(),
  destroy: sinon.stub()
};

describe('API Routes', () => {
  beforeEach(() => {
    // Reset degli stub prima di ogni test
    sinon.reset();
  });

  describe('Medico Routes', () => {
    it('GET /api/medici dovrebbe restituire tutti i medici', async () => {
      // Configura il mock
      const medici = [
        { id: 1, nome: 'Mario Rossi', competenzaBox1: true, competenzaBox2: false, competenzaBox3: true },
        { id: 2, nome: 'Laura Bianchi', competenzaBox1: false, competenzaBox2: true, competenzaBox3: true }
      ];
      mockMedico.findAll.resolves(medici);

      // Esegui la richiesta
      const response = await request(app).get('/api/medici');

      // Verifica la risposta
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(medici);
      expect(mockMedico.findAll.calledOnce).to.be.true;
    });

    it('POST /api/medici dovrebbe creare un nuovo medico', async () => {
      // Configura il mock
      const nuovoMedico = { 
        id: 3, 
        nome: 'Giuseppe Verdi', 
        competenzaBox1: true, 
        competenzaBox2: true, 
        competenzaBox3: false 
      };
      mockMedico.create.resolves(nuovoMedico);

      // Esegui la richiesta
      const response = await request(app)
        .post('/api/medici')
        .send(nuovoMedico);

      // Verifica la risposta
      expect(response.status).to.equal(201);
      expect(response.body).to.deep.equal(nuovoMedico);
      expect(mockMedico.create.calledOnce).to.be.true;
      expect(mockMedico.create.calledWith(nuovoMedico)).to.be.true;
    });
  });

  describe('Disponibilita Routes', () => {
    it('GET /api/disponibilita/:medicoId/:mese/:anno dovrebbe restituire le disponibilità', async () => {
      // Configura il mock
      const disponibilita = [
        { medicoId: 1, mese: 3, anno: 2025, disponibilita: JSON.stringify({ 1: ['M', 'P'], 2: ['N'] }) }
      ];
      mockSequelize.query.resolves(disponibilita);

      // Esegui la richiesta
      const response = await request(app).get('/api/disponibilita/1/3/2025');

      // Verifica la risposta
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(disponibilita);
      expect(mockSequelize.query.calledOnce).to.be.true;
    });

    it('POST /api/disponibilita dovrebbe salvare le disponibilità', async () => {
      // Configura il mock
      mockSequelize.query.resolves([]);

      // Dati per la richiesta
      const datiDisponibilita = {
        medicoId: 1,
        mese: 3,
        anno: 2025,
        disponibilita: { 1: ['M', 'P'], 2: ['N'] }
      };

      // Esegui la richiesta
      const response = await request(app)
        .post('/api/disponibilita')
        .send(datiDisponibilita);

      // Verifica la risposta
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('message', 'Disponibilità salvata con successo');
      expect(mockSequelize.query.calledTwice).to.be.true;
    });
  });

  describe('Pianificazione Turni Routes', () => {
    it('GET /api/pianificazione/:mese/:anno dovrebbe restituire la pianificazione', async () => {
      // Configura il mock
      const pianificazione = [
        { 
          mese: 3, 
          anno: 2025, 
          giorni: JSON.stringify([
            {
              data: '01/03/2025',
              box1: { mattina: { medico: 1 }, pomeriggio: { medico: 2 }, notte: { medico: 3 } }
            }
          ]),
          statistiche: JSON.stringify({ turniTotali: 31, turniAssegnati: 28 })
        }
      ];
      mockSequelize.query.resolves(pianificazione);

      // Esegui la richiesta
      const response = await request(app).get('/api/pianificazione/3/2025');

      // Verifica la risposta
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(pianificazione[0]);
      expect(mockSequelize.query.calledOnce).to.be.true;
    });

    it('POST /api/pianificazione dovrebbe salvare la pianificazione', async () => {
      // Configura il mock
      mockSequelize.query.resolves([]);

      // Dati per la richiesta
      const datiPianificazione = {
        mese: 3,
        anno: 2025,
        giorni: [
          {
            data: '01/03/2025',
            box1: { mattina: { medico: 1 }, pomeriggio: { medico: 2 }, notte: { medico: 3 } }
          }
        ],
        statistiche: { turniTotali: 31, turniAssegnati: 28 }
      };

      // Esegui la richiesta
      const response = await request(app)
        .post('/api/pianificazione')
        .send(datiPianificazione);

      // Verifica la risposta
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('message', 'Pianificazione salvata con successo');
      expect(mockSequelize.query.calledTwice).to.be.true;
    });
  });
});
