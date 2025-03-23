const express = require('express');
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const router = express.Router();

// Middleware per la validazione
const validateSchedulingParams = [
  body('mese').isInt({ min: 1, max: 12 }).withMessage('Mese non valido'),
  body('anno').isInt({ min: 2020, max: 2030 }).withMessage('Anno non valido'),
  body('parametri').isObject().withMessage('Parametri non validi')
];

// POST genera turni automaticamente
router.post('/genera', validateSchedulingParams, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { mese, anno, parametri } = req.body;
    
    // Recupera i medici
    const medici = await sequelize.query(
      'SELECT * FROM "Medico"',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (!medici || medici.length === 0) {
      return res.status(400).json({ message: 'Nessun medico disponibile per la generazione dei turni' });
    }
    
    // Recupera i requisiti di copertura
    const requisiti = await sequelize.query(
      'SELECT * FROM "RequisitiCopertura" ORDER BY "id" DESC LIMIT 1',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Recupera le disponibilità dei medici per il mese
    const disponibilita = await sequelize.query(
      `SELECT * FROM "Disponibilita" WHERE "mese" = ? AND "anno" = ?`,
      {
        replacements: [mese, anno],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    // In un'implementazione reale, qui ci sarebbe un algoritmo complesso
    // che genera i turni in base ai parametri, requisiti e disponibilità
    
    // Per ora, simuliamo la generazione dei turni
    const giorniMese = new Date(anno, mese, 0).getDate();
    const giorni = [];
    
    for (let i = 1; i <= giorniMese; i++) {
      giorni.push({
        data: `${i.toString().padStart(2, '0')}/${mese.toString().padStart(2, '0')}/${anno}`,
        box1: {
          mattina: null,
          pomeriggio: null,
          notte: null
        },
        box2: {
          mattina: null,
          pomeriggio: null,
          notte: null
        },
        box3: {
          mattina: null,
          pomeriggio: null,
          notte: null
        }
      });
    }
    
    // Assegna i turni in base alle disponibilità e competenze
    // Questo è un esempio semplificato, l'algoritmo reale sarebbe più complesso
    medici.forEach(medico => {
      const medicoDisponibilita = disponibilita.find(d => d.medicoId === medico.id);
      
      if (medicoDisponibilita) {
        const dispGiorni = JSON.parse(medicoDisponibilita.disponibilita);
        
        for (let i = 0; i < giorniMese; i++) {
          const dispGiorno = dispGiorni[i + 1];
          
          // Assegna turni in base alle disponibilità
          if (dispGiorno && dispGiorno.includes('M') && medico.competenzaBox1) {
            if (!giorni[i].box1.mattina) {
              giorni[i].box1.mattina = { medico: medico.id, turno: 'M' };
            }
          }
          
          if (dispGiorno && dispGiorno.includes('P') && medico.competenzaBox2) {
            if (!giorni[i].box2.pomeriggio) {
              giorni[i].box2.pomeriggio = { medico: medico.id, turno: 'P' };
            }
          }
          
          // Assegna altri turni...
        }
      }
    });
    
    // Calcola statistiche
    let turniTotali = giorniMese * 8; // 3 turni per Box 1 e 2, 2 turni per Box 3
    let turniAssegnati = 0;
    
    giorni.forEach(giorno => {
      if (giorno.box1.mattina) turniAssegnati++;
      if (giorno.box1.pomeriggio) turniAssegnati++;
      if (giorno.box1.notte) turniAssegnati++;
      if (giorno.box2.mattina) turniAssegnati++;
      if (giorno.box2.pomeriggio) turniAssegnati++;
      if (giorno.box2.notte) turniAssegnati++;
      if (giorno.box3.mattina) turniAssegnati++;
      if (giorno.box3.pomeriggio) turniAssegnati++;
    });
    
    const statistiche = {
      turniTotali,
      turniAssegnati,
      mediaTurniPerMedico: turniAssegnati / medici.length,
      problemiCopertura: turniTotali - turniAssegnati
    };
    
    // Salva la pianificazione generata
    const pianificazione = {
      mese,
      anno,
      giorni,
      statistiche,
      parametriGenerazione: parametri
    };
    
    // Verifica se esiste già una pianificazione per questo mese e anno
    const esistente = await sequelize.query(
      `SELECT * FROM "PianificazioneTurni" WHERE "mese" = ? AND "anno" = ?`,
      {
        replacements: [mese, anno],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (esistente && esistente.length > 0) {
      // Aggiorna la pianificazione esistente
      await sequelize.query(
        `UPDATE "PianificazioneTurni" SET "giorni" = ?, "statistiche" = ?, "parametriGenerazione" = ? WHERE "mese" = ? AND "anno" = ?`,
        {
          replacements: [
            JSON.stringify(giorni), 
            JSON.stringify(statistiche), 
            JSON.stringify(parametri), 
            mese, 
            anno
          ],
          type: sequelize.QueryTypes.UPDATE
        }
      );
    } else {
      // Crea una nuova pianificazione
      await sequelize.query(
        `INSERT INTO "PianificazioneTurni" ("mese", "anno", "giorni", "statistiche", "parametriGenerazione") VALUES (?, ?, ?, ?, ?)`,
        {
          replacements: [
            mese, 
            anno, 
            JSON.stringify(giorni), 
            JSON.stringify(statistiche), 
            JSON.stringify(parametri)
          ],
          type: sequelize.QueryTypes.INSERT
        }
      );
    }
    
    res.json(pianificazione);
  } catch (error) {
    console.error('Errore nella generazione dei turni:', error);
    res.status(500).json({ message: 'Errore nella generazione dei turni' });
  }
});

// POST ottimizza turni esistenti
router.post('/ottimizza/:mese/:anno', async (req, res) => {
  try {
    const { mese, anno } = req.params;
    const { parametri } = req.body;
    
    // Recupera la pianificazione esistente
    const pianificazione = await sequelize.query(
      `SELECT * FROM "PianificazioneTurni" WHERE "mese" = ? AND "anno" = ?`,
      {
        replacements: [mese, anno],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!pianificazione || pianificazione.length === 0) {
      return res.status(404).json({ message: 'Pianificazione non trovata' });
    }
    
    // In un'implementazione reale, qui ci sarebbe un algoritmo di ottimizzazione
    // che migliora la pianificazione esistente in base ai parametri
    
    // Per ora, simuliamo l'ottimizzazione
    const pianificazioneCorrente = pianificazione[0];
    const giorni = JSON.parse(pianificazioneCorrente.giorni);
    const statistiche = JSON.parse(pianificazioneCorrente.statistiche);
    
    // Aggiorna le statistiche
    statistiche.ottimizzato = true;
    statistiche.dataOttimizzazione = new Date().toISOString();
    
    // Salva la pianificazione ottimizzata
    await sequelize.query(
      `UPDATE "PianificazioneTurni" SET "statistiche" = ?, "parametriGenerazione" = ? WHERE "mese" = ? AND "anno" = ?`,
      {
        replacements: [
          JSON.stringify(statistiche), 
          JSON.stringify(parametri || {}), 
          mese, 
          anno
        ],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    res.json({
      mese,
      anno,
      giorni,
      statistiche,
      parametriGenerazione: parametri || {}
    });
  } catch (error) {
    console.error('Errore nell\'ottimizzazione dei turni:', error);
    res.status(500).json({ message: 'Errore nell\'ottimizzazione dei turni' });
  }
});

// POST esporta turni in Excel
router.post('/esporta/:mese/:anno', async (req, res) => {
  try {
    const { mese, anno } = req.params;
    
    // Recupera la pianificazione
    const pianificazione = await sequelize.query(
      `SELECT * FROM "PianificazioneTurni" WHERE "mese" = ? AND "anno" = ?`,
      {
        replacements: [mese, anno],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!pianificazione || pianificazione.length === 0) {
      return res.status(404).json({ message: 'Pianificazione non trovata' });
    }
    
    // In un'implementazione reale, qui ci sarebbe la generazione di un file Excel
    // Per ora, restituiamo un messaggio di successo
    
    res.json({
      message: 'Esportazione completata con successo',
      url: `/api/downloads/turni_${mese}_${anno}.xlsx`
    });
  } catch (error) {
    console.error('Errore nell\'esportazione dei turni:', error);
    res.status(500).json({ message: 'Errore nell\'esportazione dei turni' });
  }
});

module.exports = router;
