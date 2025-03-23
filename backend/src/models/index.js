const User = require('./user');
const Medico = require('./medico');
const TipoTurno = require('./tipoTurno');
const Disponibilita = require('./disponibilita');
const FeriePermessi = require('./feriePermessi');
const TurniFissi = require('./turniFissi');
const PianificazioneTurni = require('./pianificazioneTurni');
const RequisitiCopertura = require('./requisitiCopertura');
const RiepilogoOre = require('./riepilogoOre');

// Definizione delle relazioni
Disponibilita.belongsTo(Medico, { foreignKey: 'medicoId' });
Medico.hasMany(Disponibilita, { foreignKey: 'medicoId' });

Disponibilita.belongsTo(TipoTurno, { foreignKey: 'tipoTurnoId' });
TipoTurno.hasMany(Disponibilita, { foreignKey: 'tipoTurnoId' });

FeriePermessi.belongsTo(Medico, { foreignKey: 'medicoId' });
Medico.hasMany(FeriePermessi, { foreignKey: 'medicoId' });

TurniFissi.belongsTo(Medico, { foreignKey: 'medicoId' });
Medico.hasMany(TurniFissi, { foreignKey: 'medicoId' });

PianificazioneTurni.belongsTo(Medico, { foreignKey: 'medicoId' });
Medico.hasMany(PianificazioneTurni, { foreignKey: 'medicoId' });

PianificazioneTurni.belongsTo(TipoTurno, { foreignKey: 'tipoTurnoId' });
TipoTurno.hasMany(PianificazioneTurni, { foreignKey: 'tipoTurnoId' });

RiepilogoOre.belongsTo(Medico, { foreignKey: 'medicoId' });
Medico.hasMany(RiepilogoOre, { foreignKey: 'medicoId' });

module.exports = {
  User,
  Medico,
  TipoTurno,
  Disponibilita,
  FeriePermessi,
  TurniFissi,
  PianificazioneTurni,
  RequisitiCopertura,
  RiepilogoOre
};
