// Modifiche alle route della pianificazione turni per supportare multi-ambiente
const express = require('express');
const router = express.Router();
const { PianificazioneTurni, Ambiente } = require('../models');

// GET /api/pianificazione/:mese/:anno?ambienteId=X - Recupera la pianificazione per un mese specifico
router.get('/:mese/:anno', async (req, res) => {
  try {
    const { mese, anno } = req.params;
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
    
    // Recupera la pianificazione
    const pianificazione = await PianificazioneTurni.findOne({
      where: { mese, anno, ambienteId }
    });
    
    if (!pianificazione) {
      return res.status(404).json({ message: 'Pianificazione non trovata' });
    }
    
    res.status(200).json(pianificazione);
  } catch (error) {
    console.error('Errore nel recupero della pianificazione:', error);
    res.status(500).json({ message: 'Errore nel recupero della pianificazione', error: error.message });
  }
});

// POST /api/pianificazione - Salva una pianificazione
router.post('/', async (req, res) => {
  try {
    const { mese, anno, ambienteId, giorni, statistiche, parametriGenerazione } = req.body;
    
    // Validazione
    if (!mese || !anno || !ambienteId || !giorni) {
      return res.status(400).json({ message: 'Mese, anno, ambienteId e giorni sono obbligatori' });
    }
    
    // Verifica che l'ambiente esista
    const ambiente = await Ambiente.findByPk(ambienteId);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Cerca pianificazione esistente
    let pianificazioneEsistente = await PianificazioneTurni.findOne({
      where: { mese, anno, ambienteId }
    });
    
    // Se esiste, aggiorna, altrimenti crea
    if (pianificazioneEsistente) {
      await pianificazioneEsistente.update({
        giorni,
        statistiche: statistiche || pianificazioneEsistente.statistiche,
        parametriGenerazione: parametriGenerazione || pianificazioneEsistente.parametriGenerazione
      });
      res.status(200).json(pianificazioneEsistente);
    } else {
      const nuovaPianificazione = await PianificazioneTurni.create({
        mese,
        anno,
        ambienteId,
        giorni,
        statistiche: statistiche || {},
        parametriGenerazione: parametriGenerazione || {}
      });
      res.status(201).json(nuovaPianificazione);
    }
  } catch (error) {
    console.error('Errore nel salvataggio della pianificazione:', error);
    res.status(500).json({ message: 'Errore nel salvataggio della pianificazione', error: error.message });
  }
});

// PUT /api/pianificazione/:mese/:anno/:giorno/:box/:fascia - Aggiorna un turno specifico
router.put('/:mese/:anno/:giorno/:box/:fascia', async (req, res) => {
  try {
    const { mese, anno, giorno, box, fascia } = req.params;
    const { medicoId, turno, ambienteId } = req.body;
    
    // Validazione
    if (!ambienteId) {
      return res.status(400).json({ message: 'Il parametro ambienteId è obbligatorio' });
    }
    
    // Verifica che l'ambiente esista
    const ambiente = await Ambiente.findByPk(ambienteId);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Recupera la pianificazione
    const pianificazione = await PianificazioneTurni.findOne({
      where: { mese, anno, ambienteId }
    });
    
    if (!pianificazione) {
      return res.status(404).json({ message: 'Pianificazione non trovata' });
    }
    
    // Aggiorna il turno specifico
    const giorni = pianificazione.giorni;
    const giornoIndex = giorni.findIndex(g => g.data === giorno);
    
    if (giornoIndex === -1) {
      return res.status(404).json({ message: 'Giorno non trovato nella pianificazione' });
    }
    
    // Aggiorna il turno
    if (!giorni[giornoIndex][box]) {
      giorni[giornoIndex][box] = {};
    }
    
    giorni[giornoIndex][box][fascia] = { medico: medicoId, turno };
    
    // Salva la pianificazione aggiornata
    await pianificazione.update({ giorni });
    
    res.status(200).json(pianificazione);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del turno:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento del turno', error: error.message });
  }
});

// DELETE /api/pianificazione/:mese/:anno?ambienteId=X - Elimina una pianificazione
router.delete('/:mese/:anno', async (req, res) => {
  try {
    const { mese, anno } = req.params;
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
    
    // Recupera la pianificazione
    const pianificazione = await PianificazioneTurni.findOne({
      where: { mese, anno, ambienteId }
    });
    
    if (!pianificazione) {
      return res.status(404).json({ message: 'Pianificazione non trovata' });
    }
    
    // Elimina la pianificazione
    await pianificazione.destroy();
    
    res.status(200).json({ message: 'Pianificazione eliminata con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione della pianificazione:', error);
    res.status(500).json({ message: 'Errore nell\'eliminazione della pianificazione', error: error.message });
  }
});

module.exports = router;
