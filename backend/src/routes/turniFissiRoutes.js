// Modifiche alle route dei turni fissi per supportare multi-ambiente
const express = require('express');
const router = express.Router();
const { TurniFissi, Medico, Ambiente } = require('../models');

// GET /api/turniFissi/:medicoId?ambienteId=X - Recupera i turni fissi di un medico
router.get('/:medicoId', async (req, res) => {
  try {
    const { medicoId } = req.params;
    const { ambienteId } = req.query;
    
    // Validazione
    if (!ambienteId) {
      return res.status(400).json({ message: 'Il parametro ambienteId è obbligatorio' });
    }
    
    // Verifica che l'ambiente esista
    const ambiente = await Ambiente.findByPk(ambienteId);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Verifica che il medico esista e appartenga all'ambiente
    const medico = await Medico.findOne({
      where: { id: medicoId, ambienteId }
    });
    if (!medico) {
      return res.status(404).json({ message: 'Medico non trovato nell\'ambiente specificato' });
    }
    
    // Recupera i turni fissi
    const turniFissi = await TurniFissi.findOne({
      where: { medicoId, ambienteId, attivo: true }
    });
    
    if (!turniFissi) {
      return res.status(404).json({ message: 'Turni fissi non trovati' });
    }
    
    res.status(200).json(turniFissi);
  } catch (error) {
    console.error('Errore nel recupero dei turni fissi:', error);
    res.status(500).json({ message: 'Errore nel recupero dei turni fissi', error: error.message });
  }
});

// GET /api/turniFissi?ambienteId=X - Recupera tutti i turni fissi
router.get('/', async (req, res) => {
  try {
    const { ambienteId } = req.query;
    
    // Validazione
    if (!ambienteId) {
      return res.status(400).json({ message: 'Il parametro ambienteId è obbligatorio' });
    }
    
    // Verifica che l'ambiente esista
    const ambiente = await Ambiente.findByPk(ambienteId);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Recupera tutti i turni fissi attivi dell'ambiente
    const turniFissi = await TurniFissi.findAll({
      where: { ambienteId, attivo: true },
      include: [{ model: Medico, as: 'medico' }]
    });
    
    res.status(200).json(turniFissi);
  } catch (error) {
    console.error('Errore nel recupero dei turni fissi:', error);
    res.status(500).json({ message: 'Errore nel recupero dei turni fissi', error: error.message });
  }
});

// POST /api/turniFissi - Salva i turni fissi di un medico
router.post('/', async (req, res) => {
  try {
    const { medicoId, ambienteId, sequenza, dataInizio } = req.body;
    
    // Validazione
    if (!medicoId || !ambienteId || !sequenza) {
      return res.status(400).json({ message: 'MedicoId, ambienteId e sequenza sono obbligatori' });
    }
    
    // Verifica che l'ambiente esista
    const ambiente = await Ambiente.findByPk(ambienteId);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Verifica che il medico esista e appartenga all'ambiente
    const medico = await Medico.findOne({
      where: { id: medicoId, ambienteId }
    });
    if (!medico) {
      return res.status(404).json({ message: 'Medico non trovato nell\'ambiente specificato' });
    }
    
    // Cerca turni fissi esistenti
    let turniFissiEsistenti = await TurniFissi.findOne({
      where: { medicoId, ambienteId, attivo: true }
    });
    
    // Se esistono, disattiva i vecchi turni fissi
    if (turniFissiEsistenti) {
      await turniFissiEsistenti.update({ attivo: false });
    }
    
    // Crea nuovi turni fissi
    const nuoviTurniFissi = await TurniFissi.create({
      medicoId,
      ambienteId,
      sequenza,
      dataInizio: dataInizio || new Date(),
      attivo: true
    });
    
    res.status(201).json(nuoviTurniFissi);
  } catch (error) {
    console.error('Errore nel salvataggio dei turni fissi:', error);
    res.status(500).json({ message: 'Errore nel salvataggio dei turni fissi', error: error.message });
  }
});

// DELETE /api/turniFissi/:medicoId?ambienteId=X - Elimina i turni fissi di un medico
router.delete('/:medicoId', async (req, res) => {
  try {
    const { medicoId } = req.params;
    const { ambienteId } = req.query;
    
    // Validazione
    if (!ambienteId) {
      return res.status(400).json({ message: 'Il parametro ambienteId è obbligatorio' });
    }
    
    // Verifica che l'ambiente esista
    const ambiente = await Ambiente.findByPk(ambienteId);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Recupera i turni fissi
    const turniFissi = await TurniFissi.findOne({
      where: { medicoId, ambienteId, attivo: true }
    });
    
    if (!turniFissi) {
      return res.status(404).json({ message: 'Turni fissi non trovati' });
    }
    
    // Disattiva i turni fissi invece di eliminarli
    await turniFissi.update({ attivo: false });
    
    res.status(200).json({ message: 'Turni fissi disattivati con successo' });
  } catch (error) {
    console.error('Errore nella disattivazione dei turni fissi:', error);
    res.status(500).json({ message: 'Errore nella disattivazione dei turni fissi', error: error.message });
  }
});

module.exports = router;
