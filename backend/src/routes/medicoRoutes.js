// Modifiche alle route dei medici per supportare multi-ambiente
const express = require('express');
const router = express.Router();
const { Medico, Ambiente } = require('../models');

// GET /api/medici?ambienteId=X - Recupera tutti i medici di un ambiente
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
    
    // Recupera i medici dell'ambiente
    const medici = await Medico.findAll({
      where: { ambienteId },
      order: [['cognome', 'ASC'], ['nome', 'ASC']]
    });
    
    res.status(200).json(medici);
  } catch (error) {
    console.error('Errore nel recupero dei medici:', error);
    res.status(500).json({ message: 'Errore nel recupero dei medici', error: error.message });
  }
});

// GET /api/medici/:id - Recupera un medico specifico
router.get('/:id', async (req, res) => {
  try {
    const medico = await Medico.findByPk(req.params.id, {
      include: [{ model: Ambiente, as: 'ambiente' }]
    });
    
    if (!medico) {
      return res.status(404).json({ message: 'Medico non trovato' });
    }
    
    res.status(200).json(medico);
  } catch (error) {
    console.error('Errore nel recupero del medico:', error);
    res.status(500).json({ message: 'Errore nel recupero del medico', error: error.message });
  }
});

// POST /api/medici - Crea un nuovo medico
router.post('/', async (req, res) => {
  try {
    const { nome, cognome, specializzazione, ambienteId, competenze, priorita, minOreMensili, maxOreMensili, oreFisse, note } = req.body;
    
    // Validazione
    if (!nome || !cognome || !ambienteId) {
      return res.status(400).json({ message: 'Nome, cognome e ambienteId sono obbligatori' });
    }
    
    // Verifica che l'ambiente esista
    const ambiente = await Ambiente.findByPk(ambienteId);
    if (!ambiente) {
      return res.status(404).json({ message: 'Ambiente non trovato' });
    }
    
    // Crea il medico
    const nuovoMedico = await Medico.create({
      nome,
      cognome,
      specializzazione,
      ambienteId,
      competenze: competenze || {},
      priorita: priorita || 'Bassa',
      minOreMensili: minOreMensili || 0,
      maxOreMensili: maxOreMensili || 0,
      oreFisse: oreFisse || false,
      note
    });
    
    res.status(201).json(nuovoMedico);
  } catch (error) {
    console.error('Errore nella creazione del medico:', error);
    res.status(500).json({ message: 'Errore nella creazione del medico', error: error.message });
  }
});

// PUT /api/medici/:id - Aggiorna un medico esistente
router.put('/:id', async (req, res) => {
  try {
    const { nome, cognome, specializzazione, ambienteId, competenze, priorita, minOreMensili, maxOreMensili, oreFisse, note } = req.body;
    
    // Recupera il medico
    const medico = await Medico.findByPk(req.params.id);
    if (!medico) {
      return res.status(404).json({ message: 'Medico non trovato' });
    }
    
    // Se viene fornito un nuovo ambienteId, verifica che l'ambiente esista
    if (ambienteId && ambienteId !== medico.ambienteId) {
      const ambiente = await Ambiente.findByPk(ambienteId);
      if (!ambiente) {
        return res.status(404).json({ message: 'Ambiente non trovato' });
      }
    }
    
    // Aggiorna il medico
    await medico.update({
      nome: nome || medico.nome,
      cognome: cognome || medico.cognome,
      specializzazione: specializzazione !== undefined ? specializzazione : medico.specializzazione,
      ambienteId: ambienteId || medico.ambienteId,
      competenze: competenze || medico.competenze,
      priorita: priorita || medico.priorita,
      minOreMensili: minOreMensili !== undefined ? minOreMensili : medico.minOreMensili,
      maxOreMensili: maxOreMensili !== undefined ? maxOreMensili : medico.maxOreMensili,
      oreFisse: oreFisse !== undefined ? oreFisse : medico.oreFisse,
      note: note !== undefined ? note : medico.note
    });
    
    res.status(200).json(medico);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del medico:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento del medico', error: error.message });
  }
});

// DELETE /api/medici/:id - Elimina un medico
router.delete('/:id', async (req, res) => {
  try {
    // Recupera il medico
    const medico = await Medico.findByPk(req.params.id);
    if (!medico) {
      return res.status(404).json({ message: 'Medico non trovato' });
    }
    
    // Elimina il medico
    await medico.destroy();
    
    res.status(200).json({ message: 'Medico eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione del medico:', error);
    res.status(500).json({ message: 'Errore nell\'eliminazione del medico', error: error.message });
  }
});

module.exports = router;
