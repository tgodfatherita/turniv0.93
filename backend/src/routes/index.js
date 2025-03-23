const express = require('express');
const medicoRoutes = require('./medicoRoutes');
const tipoTurnoRoutes = require('./tipoTurnoRoutes');
const disponibilitaRoutes = require('./disponibilitaRoutes');
const feriePermessiRoutes = require('./feriePermessiRoutes');
const turniFissiRoutes = require('./turniFissiRoutes');
const pianificazioneTurniRoutes = require('./pianificazioneTurniRoutes');
const requisitiCoperturaRoutes = require('./requisitiCoperturaRoutes');
const riepilogoOreRoutes = require('./riepilogoOreRoutes');
const schedulingRoutes = require('./schedulingRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

// Definizione delle routes
router.use('/auth', authRoutes);
router.use('/medici', medicoRoutes);
router.use('/tipi-turno', tipoTurnoRoutes);
router.use('/disponibilita', disponibilitaRoutes);
router.use('/ferie-permessi', feriePermessiRoutes);
router.use('/turni-fissi', turniFissiRoutes);
router.use('/pianificazione-turni', pianificazioneTurniRoutes);
router.use('/requisiti-copertura', requisitiCoperturaRoutes);
router.use('/riepilogo-ore', riepilogoOreRoutes);
router.use('/scheduling', schedulingRoutes);

module.exports = router;
