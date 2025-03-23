// Modifiche alle route delle disponibilità per supportare multi-ambiente
const express = require('express');
const router = express.Router();
const { Disponibilita, Medico, Ambiente } = require('../models');

// GET /api/disponibilita/:medicoId/:mese/:anno?ambienteId=X - Recupera le disponibilità di un medico per un mese specifico
router.get('/:medicoId/:mese/:anno', async (req, res) => {
  try {
    const { medicoId, mese, anno } = req.params;
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
    
    // Recupera le disponibilità
    const disponibilita = await Disponibilita.findOne({
      where: { medicoId, mese, anno, ambienteId }
    });
    
    if (!disponibilita) {
      return res.status(404).json({ message: 'Disponibilità non trovate' });
    }
    
    res.status(200).json(disponibilita);
  } catch (error) {
    console.error('Errore nel recupero delle disponibilità:', error);
    res.status(500).json({ message: 'Errore nel recupero delle disponibilità', error: error.message });
  }
});

// POST /api/disponibilita - Salva le disponibilità di un medico
router.post('/', async (req, res) => {
  try {
    const { medicoId, mese, anno, ambienteId, disponibilita } = req.body;
    
    // Validazione
    if (!medicoId || !mese || !anno || !ambienteId || !disponibilita) {
      return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
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
    
    // Cerca disponibilità esistenti
    let disponibilitaEsistente = await Disponibilita.findOne({
      where: { medicoId, mese, anno, ambienteId }
    });
    
    // Se esistono, aggiorna, altrimenti crea
    if (disponibilitaEsistente) {
      await disponibilitaEsistente.update({ disponibilita });
      res.status(200).json(disponibilitaEsistente);
    } else {
      const nuovaDisponibilita = await Disponibilita.create({
        medicoId,
        mese,
        anno,
        ambienteId,
        disponibilita
      });
      res.status(201).json(nuovaDisponibilita);
    }
  } catch (error) {
    console.error('Errore nel salvataggio delle disponibilità:', error);
    res.status(500).json({ message: 'Errore nel salvataggio delle disponibilità', error: error.message });
  }
});

// DELETE /api/disponibilita/:medicoId/:mese/:anno?ambienteId=X - Elimina le disponibilità di un medico
router.delete('/:medicoId/:mese/:anno', async (req, res) => {
  try {
    const { medicoId, mese, anno } = req.params;
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
    
    // Cerca disponibilità
    const disponibilita = await Disponibilita.findOne({
      where: { medicoId, mese, anno, ambienteId }
    });
    
    if (!disponibilita) {
      return res.status(404).json({ message: 'Disponibilità non trovate' });
    }
    
    // Elimina disponibilità
    await disponibilita.destroy();
    
    res.status(200).json({ message: 'Disponibilità eliminate con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione delle disponibilità:', error);
    res.status(500).json({ message: 'Errore nell\'eliminazione delle disponibilità', error: error.message });
  }
});

// GET /api/disponibilita/medici/:mese/:anno?ambienteId=X - Recupera le disponibilità di tutti i medici per un mese specifico
router.get('/medici/:mese/:anno', async (req, res) => {
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
    
    // Recupera le disponibilità
    const disponibilita = await Disponibilita.findAll({
      where: { mese, anno, ambienteId },
      include: [{ model: Medico, as: 'medico' }]
    });
    
    res.status(200).json(disponibilita);
  } catch (error) {
    console.error('Errore nel recupero delle disponibilità:', error);
    res.status(500).json({ message: 'Errore nel recupero delle disponibilità', error: error.message });
  }
});

module.exports = router;
