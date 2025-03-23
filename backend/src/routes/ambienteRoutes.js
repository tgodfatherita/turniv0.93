// ambienteRoutes.js
// Route per la gestione degli ambienti

const express = require('express');
const router = express.Router();
const { Ambiente, Medico, Disponibilita, PianificazioneTurni } = require('../models');

// GET /api/ambienti - Recupera tutti gli ambienti
router.get('/', async (req, res) => {
  try {
    const ambienti = await Ambiente.findAll({
      order: [['nome', 'ASC']]
    });
    res.status(200).json(ambienti);
  } catch (error) {
    console.error('Errore nel recupero degli ambienti:', error);
    res.status(500).json({ message: 'Errore nel recupero degli ambienti', error: error.message });
  }
});

// GET /api/ambienti/:id - Recupera un ambiente specifico
router.get('/:id', async (req, res) => {
  try {
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    res.status(200).json(ambiente);
  } catch (error) {
    console.error('Errore nel recupero dell\'ambiente:', error);
    res.status(500).json({ message: 'Errore nel recupero dell\'ambiente', error: error.message });
  }
});

// POST /api/ambienti - Crea un nuovo ambiente
router.post('/', async (req, res) => {
  try {
    const { nome, descrizione, configurazione } = req.body;
    
    // Validazione
    if (!nome) {
      return res.status(400).json({ message: 'Il nome dell\'ambiente è obbligatorio' });
    }
    
    // Crea l'ambiente
    const nuovoAmbiente = await Ambiente.create({
      nome,
      descrizione,
      configurazione: configurazione || {
        box: [],
        turni: [],
        requisitiCopertura: {}
      }
    });
    
    res.status(201).json(nuovoAmbiente);
  } catch (error) {
    console.error('Errore nella creazione dell\'ambiente:', error);
    res.status(500).json({ message: 'Errore nella creazione dell\'ambiente', error: error.message });
  }
});

// PUT /api/ambienti/:id - Aggiorna un ambiente esistente
router.put('/:id', async (req, res) => {
  try {
    const { nome, descrizione, configurazione } = req.body;
    
    // Recupera l'ambiente
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Aggiorna l'ambiente
    await ambiente.update({
      nome: nome || ambiente.nome,
      descrizione: descrizione !== undefined ? descrizione : ambiente.descrizione,
      configurazione: configurazione || ambiente.configurazione
    });
    
    res.status(200).json(ambiente);
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'ambiente:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento dell\'ambiente', error: error.message });
  }
});

// DELETE /api/ambienti/:id - Elimina un ambiente
router.delete('/:id', async (req, res) => {
  try {
    // Recupera l'ambiente
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Verifica se ci sono dati associati
    const mediciCount = await Medico.count({ where: { ambienteId: req.params.id } });
    const disponibilitaCount = await Disponibilita.count({ where: { ambienteId: req.params.id } });
    const pianificazioniCount = await PianificazioneTurni.count({ where: { ambienteId: req.params.id } });
    
    if (mediciCount > 0 || disponibilitaCount > 0 || pianificazioniCount > 0) {
      return res.status(400).json({ 
        message: 'Impossibile eliminare l\'ambiente perché ci sono dati associati',
        associazioni: {
          medici: mediciCount,
          disponibilita: disponibilitaCount,
          pianificazioni: pianificazioniCount
        }
      });
    }
    
    // Elimina l'ambiente
    await ambiente.destroy();
    
    res.status(200).json({ message: 'Ambiente eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'ambiente:', error);
    res.status(500).json({ message: 'Errore nell\'eliminazione dell\'ambiente', error: error.message });
  }
});

// GET /api/ambienti/:id/box - Recupera tutti i box di un ambiente
router.get('/:id/box', async (req, res) => {
  try {
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    const box = ambiente.configurazione.box || [];
    res.status(200).json(box);
  } catch (error) {
    console.error('Errore nel recupero dei box:', error);
    res.status(500).json({ message: 'Errore nel recupero dei box', error: error.message });
  }
});

// POST /api/ambienti/:id/box - Aggiunge un nuovo box a un ambiente
router.post('/:id/box', async (req, res) => {
  try {
    const { nome, descrizione, orari } = req.body;
    
    // Validazione
    if (!nome) {
      return res.status(400).json({ message: 'Il nome del box è obbligatorio' });
    }
    
    // Recupera l'ambiente
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Crea il nuovo box
    const configurazione = ambiente.configurazione || { box: [], turni: [], requisitiCopertura: {} };
    const box = configurazione.box || [];
    
    // Genera un nuovo ID per il box
    const nuovoId = box.length > 0 ? Math.max(...box.map(b => b.id)) + 1 : 1;
    
    // Aggiungi il nuovo box
    box.push({
      id: nuovoId,
      nome,
      descrizione: descrizione || '',
      orari: orari || { apertura: '00:00', chiusura: '24:00' }
    });
    
    // Aggiorna l'ambiente
    configurazione.box = box;
    await ambiente.update({ configurazione });
    
    res.status(201).json(box[box.length - 1]);
  } catch (error) {
    console.error('Errore nell\'aggiunta del box:', error);
    res.status(500).json({ message: 'Errore nell\'aggiunta del box', error: error.message });
  }
});

// PUT /api/ambienti/:id/box/:boxId - Aggiorna un box esistente
router.put('/:id/box/:boxId', async (req, res) => {
  try {
    const { nome, descrizione, orari } = req.body;
    const boxId = parseInt(req.params.boxId);
    
    // Recupera l'ambiente
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Recupera il box
    const configurazione = ambiente.configurazione || { box: [], turni: [], requisitiCopertura: {} };
    const box = configurazione.box || [];
    const boxIndex = box.findIndex(b => b.id === boxId);
    
    if (boxIndex === -1) {
      return res.status(404).json({ message: 'Box non trovato' });
    }
    
    // Aggiorna il box
    box[boxIndex] = {
      ...box[boxIndex],
      nome: nome || box[boxIndex].nome,
      descrizione: descrizione !== undefined ? descrizione : box[boxIndex].descrizione,
      orari: orari || box[boxIndex].orari
    };
    
    // Aggiorna l'ambiente
    configurazione.box = box;
    await ambiente.update({ configurazione });
    
    res.status(200).json(box[boxIndex]);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del box:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento del box', error: error.message });
  }
});

// DELETE /api/ambienti/:id/box/:boxId - Elimina un box da un ambiente
router.delete('/:id/box/:boxId', async (req, res) => {
  try {
    const boxId = parseInt(req.params.boxId);
    
    // Recupera l'ambiente
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Recupera il box
    const configurazione = ambiente.configurazione || { box: [], turni: [], requisitiCopertura: {} };
    const box = configurazione.box || [];
    const boxIndex = box.findIndex(b => b.id === boxId);
    
    if (boxIndex === -1) {
      return res.status(404).json({ message: 'Box non trovato' });
    }
    
    // Rimuovi il box
    box.splice(boxIndex, 1);
    
    // Aggiorna l'ambiente
    configurazione.box = box;
    await ambiente.update({ configurazione });
    
    res.status(200).json({ message: 'Box eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione del box:', error);
    res.status(500).json({ message: 'Errore nell\'eliminazione del box', error: error.message });
  }
});

// GET /api/ambienti/:id/turni - Recupera tutti i tipi di turno di un ambiente
router.get('/:id/turni', async (req, res) => {
  try {
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    const turni = ambiente.configurazione.turni || [];
    res.status(200).json(turni);
  } catch (error) {
    console.error('Errore nel recupero dei turni:', error);
    res.status(500).json({ message: 'Errore nel recupero dei turni', error: error.message });
  }
});

// POST /api/ambienti/:id/turni - Aggiunge un nuovo tipo di turno a un ambiente
router.post('/:id/turni', async (req, res) => {
  try {
    const { codice, descrizione, oraInizio, oraFine, durataTotaleOre, isNotturno, requireSmonto } = req.body;
    
    // Validazione
    if (!codice || !descrizione || !oraInizio || !oraFine) {
      return res.status(400).json({ message: 'Codice, descrizione, ora inizio e ora fine sono obbligatori' });
    }
    
    // Recupera l'ambiente
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Crea il nuovo turno
    const configurazione = ambiente.configurazione || { box: [], turni: [], requisitiCopertura: {} };
    const turni = configurazione.turni || [];
    
    // Verifica se il codice è già utilizzato
    if (turni.some(t => t.codice === codice)) {
      return res.status(400).json({ message: 'Codice turno già utilizzato' });
    }
    
    // Aggiungi il nuovo turno
    turni.push({
      codice,
      descrizione,
      oraInizio,
      oraFine,
      durataTotaleOre: durataTotaleOre || 0,
      isNotturno: isNotturno || false,
      requireSmonto: requireSmonto || false
    });
    
    // Aggiorna l'ambiente
    configurazione.turni = turni;
    await ambiente.update({ configurazione });
    
    res.status(201).json(turni[turni.length - 1]);
  } catch (error) {
    console.error('Errore nell\'aggiunta del turno:', error);
    res.status(500).json({ message: 'Errore nell\'aggiunta del turno', error: error.message });
  }
});

// PUT /api/ambienti/:id/turni/:codice - Aggiorna un tipo di turno esistente
router.put('/:id/turni/:codice', async (req, res) => {
  try {
    const { descrizione, oraInizio, oraFine, durataTotaleOre, isNotturno, requireSmonto } = req.body;
    const codiceTurno = req.params.codice;
    
    // Recupera l'ambiente
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Recupera il turno
    const configurazione = ambiente.configurazione || { box: [], turni: [], requisitiCopertura: {} };
    const turni = configurazione.turni || [];
    const turnoIndex = turni.findIndex(t => t.codice === codiceTurno);
    
    if (turnoIndex === -1) {
      return res.status(404).json({ message: 'Turno non trovato' });
    }
    
    // Aggiorna il turno
    turni[turnoIndex] = {
      ...turni[turnoIndex],
      descrizione: descrizione || turni[turnoIndex].descrizione,
      oraInizio: oraInizio || turni[turnoIndex].oraInizio,
      oraFine: oraFine || turni[turnoIndex].oraFine,
      durataTotaleOre: durataTotaleOre !== undefined ? durataTotaleOre : turni[turnoIndex].durataTotaleOre,
      isNotturno: isNotturno !== undefined ? isNotturno : turni[turnoIndex].isNotturno,
      requireSmonto: requireSmonto !== undefined ? requireSmonto : turni[turnoIndex].requireSmonto
    };
    
    // Aggiorna l'ambiente
    configurazione.turni = turni;
    await ambiente.update({ configurazione });
    
    res.status(200).json(turni[turnoIndex]);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del turno:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento del turno', error: error.message });
  }
});

// DELETE /api/ambienti/:id/turni/:codice - Elimina un tipo di turno da un ambiente
router.delete('/:id/turni/:codice', async (req, res) => {
  try {
    const codiceTurno = req.params.codice;
    
    // Recupera l'ambiente
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Recupera il turno
    const configurazione = ambiente.configurazione || { box: [], turni: [], requisitiCopertura: {} };
    const turni = configurazione.turni || [];
    const turnoIndex = turni.findIndex(t => t.codice === codiceTurno);
    
    if (turnoIndex === -1) {
      return res.status(404).json({ message: 'Turno non trovato' });
    }
    
    // Rimuovi il turno
    turni.splice(turnoIndex, 1);
    
    // Aggiorna l'ambiente
    configurazione.turni = turni;
    await ambiente.update({ configurazione });
    
    res.status(200).json({ message: 'Turno eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione del turno:', error);
    res.status(500).json({ message: 'Errore nell\'eliminazione del turno', error: error.message });
  }
});

// GET /api/ambienti/:id/requisitiCopertura - Recupera i requisiti di copertura di un ambiente
router.get('/:id/requisitiCopertura', async (req, res) => {
  try {
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    const requisitiCopertura = ambiente.configurazione.requisitiCopertura || {};
    res.status(200).json(requisitiCopertura);
  } catch (error) {
    console.error('Errore nel recupero dei requisiti di copertura:', error);
    res.status(500).json({ message: 'Errore nel recupero dei requisiti di copertura', error: error.message });
  }
});

// PUT /api/ambienti/:id/requisitiCopertura - Aggiorna i requisiti di copertura di un ambiente
router.put('/:id/requisitiCopertura', async (req, res) => {
  try {
    const requisitiCopertura = req.body;
    
    // Recupera l'ambiente
    const ambiente = await Ambiente.findByPk(req.params.id);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Aggiorna i requisiti di copertura
    const configurazione = ambiente.configurazione || { box: [], turni: [], requisitiCopertura: {} };
    configurazione.requisitiCopertura = requisitiCopertura;
    
    // Aggiorna l'ambiente
    await ambiente.update({ configurazione });
    
    res.status(200).json(requisitiCopertura);
  } catch (error) {
    console.error('Errore nell\'aggiornamento dei requisiti di copertura:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento dei requisiti di copertura', error: error.message });
  }
});

// POST /api/ambienti/default - Crea un ambiente di default
router.post('/default', async (req, res) => {
  try {
    const ambiente = await Ambiente.createDefault();
    res.status(201).json(ambiente);
  } catch (error) {
    console.error('Errore nella creazione dell\'ambiente di default:', error);
    res.status(500).json({ message: 'Errore nella creazione dell\'ambiente di default', error: error.message });
  }
});

module.exports = router;
