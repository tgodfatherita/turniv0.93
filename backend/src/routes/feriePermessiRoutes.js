// Modifiche alle route delle ferie e permessi per supportare multi-ambiente
const express = require('express');
const router = express.Router();
const { FeriePermessi, Medico, Ambiente } = require('../models');

// GET /api/feriePermessi/:medicoId?ambienteId=X - Recupera le ferie e i permessi di un medico
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
    
    // Recupera le ferie e i permessi
    const feriePermessi = await FeriePermessi.findAll({
      where: { medicoId, ambienteId },
      order: [['dataInizio', 'ASC']]
    });
    
    res.status(200).json(feriePermessi);
  } catch (error) {
    console.error('Errore nel recupero delle ferie e permessi:', error);
    res.status(500).json({ message: 'Errore nel recupero delle ferie e permessi', error: error.message });
  }
});

// GET /api/feriePermessi/periodo/:dataInizio/:dataFine?ambienteId=X - Recupera le ferie e i permessi per un periodo
router.get('/periodo/:dataInizio/:dataFine', async (req, res) => {
  try {
    const { dataInizio, dataFine } = req.params;
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
    
    // Recupera le ferie e i permessi nel periodo specificato
    const feriePermessi = await FeriePermessi.findAll({
      where: {
        ambienteId,
        dataInizio: { [Op.lte]: new Date(dataFine) },
        dataFine: { [Op.gte]: new Date(dataInizio) }
      },
      include: [{ model: Medico, as: 'medico' }],
      order: [['dataInizio', 'ASC']]
    });
    
    res.status(200).json(feriePermessi);
  } catch (error) {
    console.error('Errore nel recupero delle ferie e permessi:', error);
    res.status(500).json({ message: 'Errore nel recupero delle ferie e permessi', error: error.message });
  }
});

// POST /api/feriePermessi - Salva nuove ferie o permessi
router.post('/', async (req, res) => {
  try {
    const { medicoId, ambienteId, dataInizio, dataFine, tipo, oreGiornaliere, note } = req.body;
    
    // Validazione
    if (!medicoId || !ambienteId || !dataInizio || !dataFine || !tipo) {
      return res.status(400).json({ message: 'MedicoId, ambienteId, dataInizio, dataFine e tipo sono obbligatori' });
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
    
    // Crea nuove ferie o permessi
    const nuoveFeriePermessi = await FeriePermessi.create({
      medicoId,
      ambienteId,
      dataInizio: new Date(dataInizio),
      dataFine: new Date(dataFine),
      tipo,
      oreGiornaliere: oreGiornaliere || 6, // Default 6 ore al giorno
      note
    });
    
    res.status(201).json(nuoveFeriePermessi);
  } catch (error) {
    console.error('Errore nel salvataggio delle ferie e permessi:', error);
    res.status(500).json({ message: 'Errore nel salvataggio delle ferie e permessi', error: error.message });
  }
});

// PUT /api/feriePermessi/:id - Aggiorna ferie o permessi esistenti
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { medicoId, ambienteId, dataInizio, dataFine, tipo, oreGiornaliere, note } = req.body;
    
    // Recupera le ferie o permessi
    const feriePermessi = await FeriePermessi.findByPk(id);
    if (!feriePermessi) {
      return res.status(404).json({ message: 'Ferie o permessi non trovati' });
    }
    
    // Se viene fornito un nuovo ambienteId, verifica che l'ambiente esista
    if (ambienteId && ambienteId !== feriePermessi.ambienteId) {
      const ambiente = await Ambiente.findByPk(ambienteId);
      if (!ambiente) {
        return res.status(404).json({ message: 'Ambiente non trovato' });
      }
    }
    
    // Se viene fornito un nuovo medicoId, verifica che il medico esista e appartenga all'ambiente
    if (medicoId && medicoId !== feriePermessi.medicoId) {
      const medico = await Medico.findOne({
        where: { id: medicoId, ambienteId: ambienteId || feriePermessi.ambienteId }
      });
      if (!medico) {
        return res.status(404).json({ message: 'Medico non trovato nell\'ambiente specificato' });
      }
    }
    
    // Aggiorna le ferie o permessi
    await feriePermessi.update({
      medicoId: medicoId || feriePermessi.medicoId,
      ambienteId: ambienteId || feriePermessi.ambienteId,
      dataInizio: dataInizio ? new Date(dataInizio) : feriePermessi.dataInizio,
      dataFine: dataFine ? new Date(dataFine) : feriePermessi.dataFine,
      tipo: tipo || feriePermessi.tipo,
      oreGiornaliere: oreGiornaliere !== undefined ? oreGiornaliere : feriePermessi.oreGiornaliere,
      note: note !== undefined ? note : feriePermessi.note
    });
    
    res.status(200).json(feriePermessi);
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle ferie e permessi:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento delle ferie e permessi', error: error.message });
  }
});

// DELETE /api/feriePermessi/:id - Elimina ferie o permessi
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Recupera le ferie o permessi
    const feriePermessi = await FeriePermessi.findByPk(id);
    if (!feriePermessi) {
      return res.status(404).json({ message: 'Ferie o permessi non trovati' });
    }
    
    // Elimina le ferie o permessi
    await feriePermessi.destroy();
    
    res.status(200).json({ message: 'Ferie o permessi eliminati con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione delle ferie e permessi:', error);
    res.status(500).json({ message: 'Errore nell\'eliminazione delle ferie e permessi', error: error.message });
  }
});

module.exports = router;
