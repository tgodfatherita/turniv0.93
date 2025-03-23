const express = require('express');
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const router = express.Router();

// Middleware per la validazione
const validateTipoTurno = [
  body('codice').notEmpty().withMessage('Il codice è obbligatorio'),
  body('descrizione').notEmpty().withMessage('La descrizione è obbligatoria'),
  body('oraInizio').notEmpty().withMessage('L\'ora di inizio è obbligatoria'),
  body('oraFine').notEmpty().withMessage('L\'ora di fine è obbligatoria'),
  body('durataTotaleOre').isInt({ min: 1 }).withMessage('La durata deve essere un numero positivo'),
  body('isNotturno').isBoolean().withMessage('isNotturno deve essere un booleano'),
  body('requireSmonto').isBoolean().withMessage('requireSmonto deve essere un booleano')
];

// GET tutti i tipi di turno
router.get('/', async (req, res) => {
  try {
    const tipiTurno = await sequelize.query(
      'SELECT * FROM "TipoTurno"',
      { type: sequelize.QueryTypes.SELECT }
    );
    res.json(tipiTurno);
  } catch (error) {
    console.error('Errore nel recupero dei tipi di turno:', error);
    res.status(500).json({ message: 'Errore nel recupero dei tipi di turno' });
  }
});

// GET tipo turno per ID
router.get('/:id', async (req, res) => {
  try {
    const tipoTurno = await sequelize.query(
      'SELECT * FROM "TipoTurno" WHERE id = ?',
      {
        replacements: [req.params.id],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!tipoTurno || tipoTurno.length === 0) {
      return res.status(404).json({ message: 'Tipo turno non trovato' });
    }
    
    res.json(tipoTurno[0]);
  } catch (error) {
    console.error('Errore nel recupero del tipo turno:', error);
    res.status(500).json({ message: 'Errore nel recupero del tipo turno' });
  }
});

// POST nuovo tipo turno
router.post('/', validateTipoTurno, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { codice, descrizione, oraInizio, oraFine, durataTotaleOre, isNotturno, requireSmonto } = req.body;
    
    // Verifica se esiste già un tipo turno con lo stesso codice
    const esistente = await sequelize.query(
      'SELECT * FROM "TipoTurno" WHERE codice = ?',
      {
        replacements: [codice],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (esistente && esistente.length > 0) {
      return res.status(400).json({ message: 'Esiste già un tipo turno con questo codice' });
    }
    
    // Crea un nuovo tipo turno
    const nuovoTipoTurno = await sequelize.query(
      `INSERT INTO "TipoTurno" ("codice", "descrizione", "oraInizio", "oraFine", "durataTotaleOre", "isNotturno", "requireSmonto") 
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      {
        replacements: [codice, descrizione, oraInizio, oraFine, durataTotaleOre, isNotturno, requireSmonto],
        type: sequelize.QueryTypes.INSERT
      }
    );
    
    res.status(201).json(nuovoTipoTurno[0][0]);
  } catch (error) {
    console.error('Errore nella creazione del tipo turno:', error);
    res.status(500).json({ message: 'Errore nella creazione del tipo turno' });
  }
});

// PUT aggiorna tipo turno
router.put('/:id', validateTipoTurno, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { codice, descrizione, oraInizio, oraFine, durataTotaleOre, isNotturno, requireSmonto } = req.body;
    
    // Verifica se esiste un tipo turno con lo stesso codice ma ID diverso
    const esistente = await sequelize.query(
      'SELECT * FROM "TipoTurno" WHERE codice = ? AND id != ?',
      {
        replacements: [codice, req.params.id],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (esistente && esistente.length > 0) {
      return res.status(400).json({ message: 'Esiste già un tipo turno con questo codice' });
    }
    
    // Aggiorna il tipo turno
    await sequelize.query(
      `UPDATE "TipoTurno" SET 
       "codice" = ?, "descrizione" = ?, "oraInizio" = ?, "oraFine" = ?, 
       "durataTotaleOre" = ?, "isNotturno" = ?, "requireSmonto" = ? 
       WHERE id = ?`,
      {
        replacements: [codice, descrizione, oraInizio, oraFine, durataTotaleOre, isNotturno, requireSmonto, req.params.id],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    // Recupera il tipo turno aggiornato
    const tipoTurnoAggiornato = await sequelize.query(
      'SELECT * FROM "TipoTurno" WHERE id = ?',
      {
        replacements: [req.params.id],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!tipoTurnoAggiornato || tipoTurnoAggiornato.length === 0) {
      return res.status(404).json({ message: 'Tipo turno non trovato' });
    }
    
    res.json(tipoTurnoAggiornato[0]);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del tipo turno:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento del tipo turno' });
  }
});

// DELETE tipo turno
router.delete('/:id', async (req, res) => {
  try {
    // Verifica se il tipo turno esiste
    const tipoTurno = await sequelize.query(
      'SELECT * FROM "TipoTurno" WHERE id = ?',
      {
        replacements: [req.params.id],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!tipoTurno || tipoTurno.length === 0) {
      return res.status(404).json({ message: 'Tipo turno non trovato' });
    }
    
    // Elimina il tipo turno
    await sequelize.query(
      'DELETE FROM "TipoTurno" WHERE id = ?',
      {
        replacements: [req.params.id],
        type: sequelize.QueryTypes.DELETE
      }
    );
    
    res.json({ message: 'Tipo turno eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione del tipo turno:', error);
    res.status(500).json({ message: 'Errore nell\'eliminazione del tipo turno' });
  }
});

module.exports = router;
