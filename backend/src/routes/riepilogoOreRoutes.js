const express = require('express');
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const router = express.Router();

// GET riepilogo ore per medico, mese e anno
router.get('/:medicoId/:mese/:anno', async (req, res) => {
  try {
    const { medicoId, mese, anno } = req.params;
    
    // In un'implementazione reale, qui ci sarebbe una query al database
    // che calcola le ore effettivamente lavorate dal medico nel mese specificato
    
    // Recupera la pianificazione per il mese e anno specificati
    const pianificazione = await sequelize.query(
      `SELECT * FROM "PianificazioneTurni" WHERE "mese" = ? AND "anno" = ?`,
      {
        replacements: [mese, anno],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!pianificazione || pianificazione.length === 0) {
      return res.json({ 
        medicoId, 
        mese, 
        anno, 
        oreTotali: 0,
        oreTurni: {
          mattina: 0,
          pomeriggio: 0,
          notte: 0
        },
        orePerBox: {
          box1: 0,
          box2: 0,
          box3: 0
        }
      });
    }
    
    // Calcola le ore lavorate
    const giorni = JSON.parse(pianificazione[0].giorni);
    let oreMattina = 0;
    let orePomeriggio = 0;
    let oreNotte = 0;
    let oreBox1 = 0;
    let oreBox2 = 0;
    let oreBox3 = 0;
    
    giorni.forEach(giorno => {
      // Box 1
      if (giorno.box1.mattina && giorno.box1.mattina.medico === parseInt(medicoId)) {
        oreMattina += 6; // 6 ore per turno mattina
        oreBox1 += 6;
      }
      if (giorno.box1.pomeriggio && giorno.box1.pomeriggio.medico === parseInt(medicoId)) {
        orePomeriggio += 6; // 6 ore per turno pomeriggio
        oreBox1 += 6;
      }
      if (giorno.box1.notte && giorno.box1.notte.medico === parseInt(medicoId)) {
        oreNotte += 12; // 12 ore per turno notte
        oreBox1 += 12;
      }
      
      // Box 2
      if (giorno.box2.mattina && giorno.box2.mattina.medico === parseInt(medicoId)) {
        oreMattina += 6;
        oreBox2 += 6;
      }
      if (giorno.box2.pomeriggio && giorno.box2.pomeriggio.medico === parseInt(medicoId)) {
        orePomeriggio += 6;
        oreBox2 += 6;
      }
      if (giorno.box2.notte && giorno.box2.notte.medico === parseInt(medicoId)) {
        oreNotte += 12;
        oreBox2 += 12;
      }
      
      // Box 3
      if (giorno.box3.mattina && giorno.box3.mattina.medico === parseInt(medicoId)) {
        oreMattina += 6;
        oreBox3 += 6;
      }
      if (giorno.box3.pomeriggio && giorno.box3.pomeriggio.medico === parseInt(medicoId)) {
        orePomeriggio += 6;
        oreBox3 += 6;
      }
    });
    
    const oreTotali = oreMattina + orePomeriggio + oreNotte;
    
    res.json({
      medicoId,
      mese,
      anno,
      oreTotali,
      oreTurni: {
        mattina: oreMattina,
        pomeriggio: orePomeriggio,
        notte: oreNotte
      },
      orePerBox: {
        box1: oreBox1,
        box2: oreBox2,
        box3: oreBox3
      }
    });
  } catch (error) {
    console.error('Errore nel calcolo del riepilogo ore:', error);
    res.status(500).json({ message: 'Errore nel calcolo del riepilogo ore' });
  }
});

// GET riepilogo ore per tutti i medici in un mese e anno
router.get('/tutti/:mese/:anno', async (req, res) => {
  try {
    const { mese, anno } = req.params;
    
    // Recupera tutti i medici
    const medici = await sequelize.query(
      'SELECT * FROM "Medico"',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Recupera la pianificazione per il mese e anno specificati
    const pianificazione = await sequelize.query(
      `SELECT * FROM "PianificazioneTurni" WHERE "mese" = ? AND "anno" = ?`,
      {
        replacements: [mese, anno],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!pianificazione || pianificazione.length === 0 || !medici || medici.length === 0) {
      return res.json({ mese, anno, riepilogoMedici: [] });
    }
    
    const giorni = JSON.parse(pianificazione[0].giorni);
    const riepilogoMedici = [];
    
    // Calcola le ore per ogni medico
    medici.forEach(medico => {
      let oreMattina = 0;
      let orePomeriggio = 0;
      let oreNotte = 0;
      let oreBox1 = 0;
      let oreBox2 = 0;
      let oreBox3 = 0;
      
      giorni.forEach(giorno => {
        // Box 1
        if (giorno.box1.mattina && giorno.box1.mattina.medico === medico.id) {
          oreMattina += 6;
          oreBox1 += 6;
        }
        if (giorno.box1.pomeriggio && giorno.box1.pomeriggio.medico === medico.id) {
          orePomeriggio += 6;
          oreBox1 += 6;
        }
        if (giorno.box1.notte && giorno.box1.notte.medico === medico.id) {
          oreNotte += 12;
          oreBox1 += 12;
        }
        
        // Box 2
        if (giorno.box2.mattina && giorno.box2.mattina.medico === medico.id) {
          oreMattina += 6;
          oreBox2 += 6;
        }
        if (giorno.box2.pomeriggio && giorno.box2.pomeriggio.medico === medico.id) {
          orePomeriggio += 6;
          oreBox2 += 6;
        }
        if (giorno.box2.notte && giorno.box2.notte.medico === medico.id) {
          oreNotte += 12;
          oreBox2 += 12;
        }
        
        // Box 3
        if (giorno.box3.mattina && giorno.box3.mattina.medico === medico.id) {
          oreMattina += 6;
          oreBox3 += 6;
        }
        if (giorno.box3.pomeriggio && giorno.box3.pomeriggio.medico === medico.id) {
          orePomeriggio += 6;
          oreBox3 += 6;
        }
      });
      
      const oreTotali = oreMattina + orePomeriggio + oreNotte;
      
      riepilogoMedici.push({
        medicoId: medico.id,
        nome: `${medico.nome} ${medico.cognome}`,
        oreTotali,
        oreTurni: {
          mattina: oreMattina,
          pomeriggio: orePomeriggio,
          notte: oreNotte
        },
        orePerBox: {
          box1: oreBox1,
          box2: oreBox2,
          box3: oreBox3
        }
      });
    });
    
    res.json({
      mese,
      anno,
      riepilogoMedici
    });
  } catch (error) {
    console.error('Errore nel calcolo del riepilogo ore per tutti i medici:', error);
    res.status(500).json({ message: 'Errore nel calcolo del riepilogo ore per tutti i medici' });
  }
});

module.exports = router;
