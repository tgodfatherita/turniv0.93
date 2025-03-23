const express = require('express');
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const router = express.Router();

// Middleware per la validazione
const validateRequisiti = [
  body('box1.mattina').isInt({ min: 0 }).withMessage('Il numero di medici per Box 1 mattina deve essere un numero positivo'),
  body('box1.pomeriggio').isInt({ min: 0 }).withMessage('Il numero di medici per Box 1 pomeriggio deve essere un numero positivo'),
  body('box1.notte').isInt({ min: 0 }).withMessage('Il numero di medici per Box 1 notte deve essere un numero positivo'),
  body('box2.mattina').isInt({ min: 0 }).withMessage('Il numero di medici per Box 2 mattina deve essere un numero positivo'),
  body('box2.pomeriggio').isInt({ min: 0 }).withMessage('Il numero di medici per Box 2 pomeriggio deve essere un numero positivo'),
  body('box2.notte').isInt({ min: 0 }).withMessage('Il numero di medici per Box 2 notte deve essere un numero positivo'),
  body('box3.mattina').isInt({ min: 0 }).withMessage('Il numero di medici per Box 3 mattina deve essere un numero positivo'),
  body('box3.pomeriggio').isInt({ min: 0 }).withMessage('Il numero di medici per Box 3 pomeriggio deve essere un numero positivo')
];

// GET requisiti di copertura
router.get('/', async (req, res) => {
  try {
    // In un'implementazione reale, qui ci sarebbe una query al database
    // Per ora restituiamo dati di esempio
    const requisitiDefault = {
      box1: {
        mattina: 2,
        pomeriggio: 2,
        notte: 2
      },
      box2: {
        mattina: 2,
        pomeriggio: 2,
        notte: 2
      },
      box3: {
        mattina: 1,
        pomeriggio: 1,
        notte: 0 // Box 3 non ha copertura notturna
      }
    };
    
    const requisiti = await sequelize.query(
      'SELECT * FROM "RequisitiCopertura" ORDER BY "id" DESC LIMIT 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (!requisiti || requisiti.length === 0) {
      return res.json(requisitiDefault);
    }
    
    res.json(requisiti[0]);
  } catch (error) {
    console.error('Errore nel recupero dei requisiti di copertura:', error);
    res.status(500).json({ message: 'Errore nel recupero dei requisiti di copertura' });
  }
});

// POST aggiorna requisiti di copertura
router.post('/', validateRequisiti, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { box1, box2, box3 } = req.body;
    
    // In un'implementazione reale, qui ci sarebbe un'operazione di insert/update nel database
    await sequelize.query(
      `INSERT INTO "RequisitiCopertura" ("box1", "box2", "box3") VALUES (?, ?, ?)`,
      {
        replacements: [JSON.stringify(box1), JSON.stringify(box2), JSON.stringify(box3)],
        type: sequelize.QueryTypes.INSERT
      }
    );
    
    res.status(201).json({ message: 'Requisiti di copertura aggiornati con successo' });
  } catch (error) {
    console.error('Errore nell\'aggiornamento dei requisiti di copertura:', error);
    res.status(500).json({ message: 'Errore nell\'aggiornamento dei requisiti di copertura' });
  }
});

module.exports = router;
