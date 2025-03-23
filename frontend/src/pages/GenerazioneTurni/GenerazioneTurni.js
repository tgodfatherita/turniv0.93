import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
  Tabs,
  Tab,
  Popover
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InfoIcon from '@mui/icons-material/Info';
import TableViewIcon from '@mui/icons-material/TableView';
import ViewListIcon from '@mui/icons-material/ViewList';
import DataService from '../../services/DataService';

// Turni disponibili con codifica specifica
const turniCodici = ['M', 'P', 'MP', 'N', 'MN', 'PN', 'MPN', 'S', 'R'];

// Descrizioni dei turni
const turniDescrizioni = {
  'M': 'Mattina (08:00-14:00)',
  'P': 'Pomeriggio (14:00-20:00)',
  'MP': 'Mattina+Pomeriggio (08:00-20:00)',
  'N': 'Notte (20:00-08:00)',
  'MN': 'Mattina+Notte (08:00-14:00 + 20:00-08:00)',
  'PN': 'Pomeriggio+Notte (14:00-20:00 + 20:00-08:00)',
  'MPN': 'Mattina+Pomeriggio+Notte (08:00-20:00 + 20:00-08:00)',
  'S': 'Smonto (riposo dopo notte)',
  'R': 'Riposo'
};

// Colori per i turni
const turniColori = {
  'M': '#90CAF9', // Azzurro chiaro
  'P': '#FFD54F', // Giallo chiaro
  'MP': '#AED581', // Verde chiaro
  'N': '#7986CB', // Blu
  'MN': '#9575CD', // Viola chiaro
  'PN': '#F06292', // Rosa
  'MPN': '#FF8A65', // Arancione
  'S': '#E0E0E0', // Grigio chiaro
  'R': '#FFFFFF', // Bianco
};

// Colori per i box
const boxColori = {
  'box1': '#4CAF50', // Verde
  'box2': '#2196F3', // Blu
  'box3': '#FF9800', // Arancione
  'multibox': '#9C27B0', // Viola per turni in box multipli
};

// Mesi dell'anno
const mesi = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

function GenerazioneTurni() {
  const [medici, setMedici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mese, setMese] = useState(new Date().getMonth() + 1);
  const [anno, setAnno] = useState(new Date().getFullYear());
  const [generando, setGenerando] = useState(false);
  const [turniGenerati, setTurniGenerati] = useState(null);
  const [openModificaDialog, setOpenModificaDialog] = useState(false);
  const [giornoSelezionato, setGiornoSelezionato] = useState(null);
  const [boxSelezionato, setBoxSelezionato] = useState(null);
  const [fasciaSelezionata, setFasciaSelezionata] = useState(null);
  const [medicoSelezionato, setMedicoSelezionato] = useState(null);
  const [mediciDisponibili, setMediciDisponibili] = useState([]);
  const [visualizzazione, setVisualizzazione] = useState('perMedico'); // 'perBox' o 'perMedico'
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Stato per il popover dei dettagli dei turni multipli box
  const [anchorEl, setAnchorEl] = useState(null);
  const [dettagliTurniMultipli, setDettagliTurniMultipli] = useState(null);

  // Parametri di configurazione
  const [parametri, setParametri] = useState({
    maxTurniConsecutivi: 3,
    minRiposoOre: 11,
    bilanciamentoCarico: true,
    rispettaPreferenze: true,
    prioritaFerie: true
  });

  // Carica i dati dei medici all'avvio
  useEffect(() => {
    // Carica i medici dal servizio di persistenza
    const mediciSalvati = DataService.loadMedici();
    if (mediciSalvati && mediciSalvati.length > 0) {
      setMedici(mediciSalvati);
    } else {
      // Se non ci sono medici salvati, usa i dati di esempio
      const mediciIniziali = [
        { id: 1, nome: 'Mario Rossi', specializzazione: 'Cardiologia', competenze: {box1: true, box2: true, box3: false} },
        { id: 2, nome: 'Laura Bianchi', specializzazione: 'Medicina d\'urgenza', competenze: {box1: true, box2: false, box3: true} },
        { id: 3, nome: 'Giuseppe Verdi', specializzazione: 'Ortopedia', competenze: {box1: false, box2: true, box3: true} },
        { id: 4, nome: 'Francesca Neri', specializzazione: 'Medicina generale', competenze: {box1: true, box2: true, box3: true} },
      ];
      setMedici(mediciIniziali);
      // Salva i medici iniziali
      DataService.saveMedici(mediciIniziali);
    }
    
    // Carica i turni generati salvati
    const turniSalvati = DataService.loadTurniGenerati(mese, anno);
    if (turniSalvati) {
      setTurniGenerati(turniSalvati);
    }
    
    setLoading(false);
  }, [mese, anno]);

  // Gestisce il cambio del mese
  const handleChangeMese = (event) => {
    setMese(event.target.value);
  };

  // Gestisce il cambio dell'anno
  const handleChangeAnno = (event) => {
    setAnno(event.target.value);
  };

  // Gestisce il cambio dei parametri
  const handleChangeParametro = (event) => {
    const { name, value, type, checked } = event.target;
    setParametri({
      ...parametri,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Gestisce il cambio della visualizzazione
  const handleChangeVisualizzazione = (event, newValue) => {
    setVisualizzazione(newValue);
  };

  // Verifica se un medico ha un turno di notte il giorno precedente
  const hasTurnoNotteGiornoPrecedente = (medicoId, giorno, turniGenerati) => {
    if (giorno <= 1) return false;
    
    const giornoPrecedente = turniGenerati.giorni[giorno - 2];
    
    // Controlla se il medico ha un turno di notte in qualsiasi box il giorno precedente
    return (
      (giornoPrecedente.box1.notte && giornoPrecedente.box1.notte.medico === medicoId) ||
      (giornoPrecedente.box2.notte && giornoPrecedente.box2.notte.medico === medicoId)
    );
  };

  // Verifica se un medico è disponibile per un determinato turno
  const isMedicoDisponibile = (medicoId, giorno, box, fascia) => {
    // In una implementazione reale, qui si verificherebbe la disponibilità effettiva del medico
    // caricata dal database o dal servizio di persistenza
    
    // Carica le disponibilità del medico per il mese corrente
    const disponibilitaMedico = DataService.loadDisponibilitaMedico(medicoId, mese, anno);
    
    if (!disponibilitaMedico) {
      // Se non ci sono disponibilità salvate, il medico non è disponibile
      return false;
    }
    
    // Verifica se il medico è disponibile per il giorno e la fascia oraria specificati
    const giornoIndex = giorno - 1; // Indice 0-based
    
    if (!disponibilitaMedico[giornoIndex]) {
      // Se non ci sono disponibilità per questo giorno, il medico non è disponibile
      return false;
    }
    
    // Verifica la disponibilità per la fascia oraria specifica
    if (fascia === 'mattina') {
      return disponibilitaMedico[giornoIndex].includes('M') || 
             disponibilitaMedico[giornoIndex].includes('MP') || 
             disponibilitaMedico[giornoIndex].includes('MN') || 
             disponibilitaMedico[giornoIndex].includes('MPN');
    } else if (fascia === 'pomeriggio') {
      return disponibilitaMedico[giornoIndex].includes('P') || 
             disponibilitaMedico[giornoIndex].includes('MP') || 
             disponibilitaMedico[giornoIndex].includes('PN') || 
             disponibilitaMedico[giornoIndex].includes('MPN');
    } else if (fascia === 'notte') {
      return disponibilitaMedico[giornoIndex].includes('N') || 
             disponibilitaMedico[giornoIndex].includes('MN') || 
             disponibilitaMedico[giornoIndex].includes('PN') || 
             disponibilitaMedico[giornoIndex].includes('MPN');
    }
    
    return false;
  };

  // Genera i turni
  const handleGeneraTurni = () => {
    if (!mese) {
      setSnackbar({
        open: true,
        message: 'Seleziona un mese per continuare',
        severity: 'error'
      });
      return;
    }
    
    // Simula la generazione dei turni
    setGenerando(true);
    setTimeout(() => {
      // Genera dati di esempio per i turni
      const giorniMese = new Date(anno, mese, 0).getDate();
      
      // Inizializza l'oggetto turni
      const turniEsempio = {
        mese: mese,
        anno: anno,
        giorni: [],
        statistiche: {
          turniTotali: 0,
          turniAssegnati: 0,
          mediaTurniPerMedico: 0,
          problemiCopertura: 0
        },
        oreMedici: {}
      };
      
      // Inizializza le ore per ogni medico
      medici.forEach(medico => {
        turniEsempio.oreMedici[medico.id] = 0;
      });
      
      // Genera i turni per ogni giorno del mese
      for (let i = 0; i < giorniMese; i++) {
        const giorno = i + 1;
        
        // Crea un oggetto per il giorno corrente
        const giornoObj = {
          data: `${giorno.toString().padStart(2, '0')}/${mese.toString().padStart(2, '0')}/${anno}`,
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
        };
        
        // Assegna i medici ai turni
        // Box 1 e Box 2 devono avere copertura H24
        // Box 3 deve avere copertura 8:00-20:00 (mattina e pomeriggio)
        
        // Filtra i medici disponibili per ogni box e fascia oraria
        // Considera anche il vincolo che dopo un turno di notte il medico deve essere libero
        
        // Box 1 - Mattina
        const mediciDisponibiliBox1Mattina = medici.filter(medico => 
          medico.competenze.box1 && 
          !hasTurnoNotteGiornoPrecedente(medico.id, giorno, turniEsempio) &&
          isMedicoDisponibile(medico.id, giorno, 1, 'mattina')
        );
        
        if (mediciDisponibiliBox1Mattina.length > 0) {
          const medicoIndex = giorno % mediciDisponibiliBox1Mattina.length;
          giornoObj.box1.mattina = { 
            medico: mediciDisponibiliBox1Mattina[medicoIndex].id, 
            turno: 'M' 
          };
          turniEsempio.oreMedici[mediciDisponibiliBox1Mattina[medicoIndex].id] += 6; // 6 ore per turno mattina
        }
        // Se non ci sono medici disponibili, la casella resta vuota (null)
        
        // Box 1 - Pomeriggio
        const mediciDisponibiliBox1Pomeriggio = medici.filter(medico => 
          medico.competenze.box1 && 
          !hasTurnoNotteGiornoPrecedente(medico.id, giorno, turniEsempio) &&
          giornoObj.box1.mattina?.medico !== medico.id &&
          isMedicoDisponibile(medico.id, giorno, 1, 'pomeriggio')
        );
        
        if (mediciDisponibiliBox1Pomeriggio.length > 0) {
          const medicoIndex = (giorno + 1) % mediciDisponibiliBox1Pomeriggio.length;
          giornoObj.box1.pomeriggio = { 
            medico: mediciDisponibiliBox1Pomeriggio[medicoIndex].id, 
            turno: 'P' 
          };
          turniEsempio.oreMedici[mediciDisponibiliBox1Pomeriggio[medicoIndex].id] += 6; // 6 ore per turno pomeriggio
        }
        // Se non ci sono medici disponibili, la casella resta vuota (null)
        
        // Box 1 - Notte
        const mediciDisponibiliBox1Notte = medici.filter(medico => 
          medico.competenze.box1 && 
          !hasTurnoNotteGiornoPrecedente(medico.id, giorno, turniEsempio) &&
          giornoObj.box1.mattina?.medico !== medico.id &&
          giornoObj.box1.pomeriggio?.medico !== medico.id &&
          isMedicoDisponibile(medico.id, giorno, 1, 'notte')
        );
        
        if (mediciDisponibiliBox1Notte.length > 0) {
          const medicoIndex = (giorno + 2) % mediciDisponibiliBox1Notte.length;
          giornoObj.box1.notte = { 
            medico: mediciDisponibiliBox1Notte[medicoIndex].id, 
            turno: 'N' 
          };
          turniEsempio.oreMedici[mediciDisponibiliBox1Notte[medicoIndex].id] += 12; // 12 ore per turno notte
        }
        // Se non ci sono medici disponibili, la casella resta vuota (null)
        
        // Box 2 - Mattina
        const mediciDisponibiliBox2Mattina = medici.filter(medico => 
          medico.competenze.box2 && 
          !hasTurnoNotteGiornoPrecedente(medico.id, giorno, turniEsempio) &&
          giornoObj.box1.mattina?.medico !== medico.id &&
          isMedicoDisponibile(medico.id, giorno, 2, 'mattina')
        );
        
        if (mediciDisponibiliBox2Mattina.length > 0) {
          const medicoIndex = (giorno + 3) % mediciDisponibiliBox2Mattina.length;
          giornoObj.box2.mattina = { 
            medico: mediciDisponibiliBox2Mattina[medicoIndex].id, 
            turno: 'M' 
          };
          turniEsempio.oreMedici[mediciDisponibiliBox2Mattina[medicoIndex].id] += 6; // 6 ore per turno mattina
        }
        // Se non ci sono medici disponibili, la casella resta vuota (null)
        
        // Box 2 - Pomeriggio
        const mediciDisponibiliBox2Pomeriggio = medici.filter(medico => 
          medico.competenze.box2 && 
          !hasTurnoNotteGiornoPrecedente(medico.id, giorno, turniEsempio) &&
          giornoObj.box1.pomeriggio?.medico !== medico.id &&
          giornoObj.box2.mattina?.medico !== medico.id &&
          isMedicoDisponibile(medico.id, giorno, 2, 'pomeriggio')
        );
        
        if (mediciDisponibiliBox2Pomeriggio.length > 0) {
          const medicoIndex = giorno % mediciDisponibiliBox2Pomeriggio.length;
          giornoObj.box2.pomeriggio = { 
            medico: mediciDisponibiliBox2Pomeriggio[medicoIndex].id, 
            turno: 'P' 
          };
          turniEsempio.oreMedici[mediciDisponibiliBox2Pomeriggio[medicoIndex].id] += 6; // 6 ore per turno pomeriggio
        }
        // Se non ci sono medici disponibili, la casella resta vuota (null)
        
        // Box 2 - Notte
        const mediciDisponibiliBox2Notte = medici.filter(medico => 
          medico.competenze.box2 && 
          !hasTurnoNotteGiornoPrecedente(medico.id, giorno, turniEsempio) &&
          giornoObj.box1.notte?.medico !== medico.id &&
          giornoObj.box2.mattina?.medico !== medico.id &&
          giornoObj.box2.pomeriggio?.medico !== medico.id &&
          isMedicoDisponibile(medico.id, giorno, 2, 'notte')
        );
        
        if (mediciDisponibiliBox2Notte.length > 0) {
          const medicoIndex = (giorno + 1) % mediciDisponibiliBox2Notte.length;
          giornoObj.box2.notte = { 
            medico: mediciDisponibiliBox2Notte[medicoIndex].id, 
            turno: 'N' 
          };
          turniEsempio.oreMedici[mediciDisponibiliBox2Notte[medicoIndex].id] += 12; // 12 ore per turno notte
        }
        // Se non ci sono medici disponibili, la casella resta vuota (null)
        
        // Box 3 - Mattina (sempre presente)
        const mediciDisponibiliBox3Mattina = medici.filter(medico => 
          medico.competenze.box3 && 
          !hasTurnoNotteGiornoPrecedente(medico.id, giorno, turniEsempio) &&
          giornoObj.box1.mattina?.medico !== medico.id &&
          giornoObj.box2.mattina?.medico !== medico.id &&
          isMedicoDisponibile(medico.id, giorno, 3, 'mattina')
        );
        
        if (mediciDisponibiliBox3Mattina.length > 0) {
          const medicoIndex = (giorno + 2) % mediciDisponibiliBox3Mattina.length;
          giornoObj.box3.mattina = { 
            medico: mediciDisponibiliBox3Mattina[medicoIndex].id, 
            turno: 'M' 
          };
          turniEsempio.oreMedici[mediciDisponibiliBox3Mattina[medicoIndex].id] += 6; // 6 ore per turno mattina
        }
        // Se non ci sono medici disponibili, la casella resta vuota (null)
        
        // Box 3 - Pomeriggio (sempre presente)
        const mediciDisponibiliBox3Pomeriggio = medici.filter(medico => 
          medico.competenze.box3 && 
          !hasTurnoNotteGiornoPrecedente(medico.id, giorno, turniEsempio) &&
          giornoObj.box1.pomeriggio?.medico !== medico.id &&
          giornoObj.box2.pomeriggio?.medico !== medico.id &&
          giornoObj.box3.mattina?.medico !== medico.id && // Evita che lo stesso medico faccia mattina e pomeriggio nel Box 3
          isMedicoDisponibile(medico.id, giorno, 3, 'pomeriggio')
        );
        
        if (mediciDisponibiliBox3Pomeriggio.length > 0) {
          const medicoIndex = (giorno + 3) % mediciDisponibiliBox3Pomeriggio.length;
          giornoObj.box3.pomeriggio = { 
            medico: mediciDisponibiliBox3Pomeriggio[medicoIndex].id, 
            turno: 'P' 
          };
          turniEsempio.oreMedici[mediciDisponibiliBox3Pomeriggio[medicoIndex].id] += 6; // 6 ore per turno pomeriggio
        }
        // Se non ci sono medici disponibili, la casella resta vuota (null)
        
        // Aggiungi il giorno all'array dei giorni
        turniEsempio.giorni.push(giornoObj);
      }
      
      // Calcola le statistiche
      const turniTotali = giorniMese * 8; // 3 turni per Box 1 e 2, 2 turni per Box 3
      let turniAssegnati = 0;
      
      turniEsempio.giorni.forEach(giorno => {
        if (giorno.box1.mattina) turniAssegnati++;
        if (giorno.box1.pomeriggio) turniAssegnati++;
        if (giorno.box1.notte) turniAssegnati++;
        if (giorno.box2.mattina) turniAssegnati++;
        if (giorno.box2.pomeriggio) turniAssegnati++;
        if (giorno.box2.notte) turniAssegnati++;
        if (giorno.box3.mattina) turniAssegnati++;
        if (giorno.box3.pomeriggio) turniAssegnati++;
      });
      
      turniEsempio.statistiche = {
        turniTotali: turniTotali,
        turniAssegnati: turniAssegnati,
        mediaTurniPerMedico: turniAssegnati / medici.length,
        problemiCopertura: turniTotali - turniAssegnati
      };
      
      setTurniGenerati(turniEsempio);
      
      // Salva i turni generati
      DataService.saveTurniGenerati(mese, anno, turniEsempio);
      
      setGenerando(false);
      
      setSnackbar({
        open: true,
        message: 'Turni generati con successo',
        severity: 'success'
      });
    }, 3000);
  };

  // Apre il dialog per modificare un turno
  const handleModificaTurno = (giorno, box, fascia) => {
    setGiornoSelezionato(giorno);
    setBoxSelezionato(box);
    setFasciaSelezionata(fascia);
    
    // Determina il medico attualmente assegnato
    const turnoAttuale = turniGenerati.giorni[giorno - 1][`box${box}`][fascia];
    setMedicoSelezionato(turnoAttuale ? turnoAttuale.medico : null);
    
    // Filtra i medici disponibili per questo turno
    // Considera anche il vincolo che dopo un turno di notte il medico deve essere libero
    const mediciDisp = medici.filter(medico => {
      // Filtra per competenza sul box
      if (!medico.competenze[`box${box}`]) return false;
      
      // Verifica se il medico ha un turno di notte il giorno precedente
      if (hasTurnoNotteGiornoPrecedente(medico.id, giorno, turniGenerati)) {
        return false;
      }
      
      // Verifica se il medico è disponibile per questo turno
      return isMedicoDisponibile(medico.id, giorno, box, fascia);
    });
    
    setMediciDisponibili(mediciDisp);
    setOpenModificaDialog(true);
  };

  // Chiude il dialog di modifica
  const handleCloseModificaDialog = () => {
    setOpenModificaDialog(false);
    setGiornoSelezionato(null);
    setBoxSelezionato(null);
    setFasciaSelezionata(null);
    setMedicoSelezionato(null);
    setMediciDisponibili([]);
  };

  // Salva la modifica al turno
  const handleSalvaModifica = () => {
    if (!medicoSelezionato) {
      setSnackbar({
        open: true,
        message: 'Seleziona un medico per questo turno',
        severity: 'error'
      });
      return;
    }
    
    // Aggiorna il turno
    const nuoviGiorni = [...turniGenerati.giorni];
    nuoviGiorni[giornoSelezionato - 1][`box${boxSelezionato}`][fasciaSelezionata] = {
      ...nuoviGiorni[giornoSelezionato - 1][`box${boxSelezionato}`][fasciaSelezionata],
      medico: medicoSelezionato
    };
    
    const nuoviTurni = {
      ...turniGenerati,
      giorni: nuoviGiorni
    };
    
    setTurniGenerati(nuoviTurni);
    
    // Salva i turni aggiornati
    DataService.saveTurniGenerati(mese, anno, nuoviTurni);
    
    setSnackbar({
      open: true,
      message: 'Turno modificato con successo',
      severity: 'success'
    });
    
    handleCloseModificaDialog();
  };

  // Gestisce il salvataggio dei turni generati
  const handleSalvaTurni = () => {
    // Salva i turni nel servizio di persistenza
    DataService.saveTurniGenerati(mese, anno, turniGenerati);
    
    setSnackbar({
      open: true,
      message: 'Turni salvati con successo',
      severity: 'success'
    });
  };

  // Gestisce l'esportazione dei turni generati in Excel
  const handleEsportaTurni = () => {
    // In un'implementazione reale, qui ci sarebbe una generazione di file Excel
    console.log('Turni esportati:', turniGenerati);
    
    setSnackbar({
      open: true,
      message: 'Turni esportati in formato Excel',
      severity: 'success'
    });
  };

  // Chiude lo snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  // Ottiene il nome del medico dal suo ID
  const getNomeMedico = (id) => {
    const medico = medici.find(m => m.id === id);
    return medico ? medico.nome : 'N/A';
  };

  // Ottiene il nome del giorno della settimana
  const getNomeGiorno = (giorno) => {
    const data = new Date(anno, mese - 1, giorno);
    const giorniSettimana = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return giorniSettimana[data.getDay()];
  };

  // Ottiene tutti i turni di un medico per un giorno specifico
  const getTurniMedico = (medicoId, giorno) => {
    if (!turniGenerati || !turniGenerati.giorni[giorno - 1]) return [];
    
    const giornoObj = turniGenerati.giorni[giorno - 1];
    const turni = [];
    
    // Controlla tutti i box e le fasce orarie
    for (const box of ['box1', 'box2', 'box3']) {
      for (const fascia of ['mattina', 'pomeriggio', 'notte']) {
        // Il Box 3 non ha turno di notte
        if (box === 'box3' && fascia === 'notte') continue;
        
        if (giornoObj[box][fascia] && giornoObj[box][fascia].medico === medicoId) {
          turni.push({
            box: box,
            fascia: fascia,
            turno: giornoObj[box][fascia].turno
          });
        }
      }
    }
    
    return turni;
  };

  // Ottiene il turno combinato di un medico per un giorno specifico
  const getTurnoCombinatoMedico = (medicoId, giorno) => {
    const turni = getTurniMedico(medicoId, giorno);
    
    if (turni.length === 0) return null;
    
    // Se il medico ha un solo turno, restituisci quel turno
    if (turni.length === 1) {
      return {
        box: turni[0].box,
        fascia: turni[0].fascia,
        turno: turni[0].turno,
        isMultiBox: false
      };
    }
    
    // Se il medico ha più turni, combina i turni
    let turnoCombinatoStr = '';
    let hasMattina = false;
    let hasPomeriggio = false;
    let hasNotte = false;
    let boxes = new Set();
    
    turni.forEach(turno => {
      if (turno.fascia === 'mattina') hasMattina = true;
      if (turno.fascia === 'pomeriggio') hasPomeriggio = true;
      if (turno.fascia === 'notte') hasNotte = true;
      boxes.add(turno.box);
    });
    
    // Costruisci la stringa del turno combinato
    if (hasMattina) turnoCombinatoStr += 'M';
    if (hasPomeriggio) turnoCombinatoStr += 'P';
    if (hasNotte) turnoCombinatoStr += 'N';
    
    return {
      box: 'multibox', // Indica che il medico lavora in più box
      fascia: 'combinata',
      turno: turnoCombinatoStr,
      isMultiBox: true,
      boxes: Array.from(boxes),
      turniDettagliati: turni // Aggiungiamo i dettagli dei singoli turni
    };
  };

  // Gestisce l'apertura del popover con i dettagli dei turni multipli box
  const handleOpenDettagliTurniMultipli = (event, turnoCombinato) => {
    setAnchorEl(event.currentTarget);
    setDettagliTurniMultipli(turnoCombinato);
  };

  // Gestisce la chiusura del popover
  const handleCloseDettagliTurniMultipli = () => {
    setAnchorEl(null);
    setDettagliTurniMultipli(null);
  };

  // Renderizza la visualizzazione per box
  const renderVisualizzazionePerBox = () => {
    if (!turniGenerati) return null;
    
    return (
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Giorno</TableCell>
              <TableCell>Giorno Settimana</TableCell>
              <TableCell colSpan={3} align="center" sx={{ backgroundColor: boxColori.box1, color: 'white' }}>Box 1</TableCell>
              <TableCell colSpan={3} align="center" sx={{ backgroundColor: boxColori.box2, color: 'white' }}>Box 2</TableCell>
              <TableCell colSpan={2} align="center" sx={{ backgroundColor: boxColori.box3, color: 'white' }}>Box 3 (8:00-20:00)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell align="center">Mattina</TableCell>
              <TableCell align="center">Pomeriggio</TableCell>
              <TableCell align="center">Notte</TableCell>
              <TableCell align="center">Mattina</TableCell>
              <TableCell align="center">Pomeriggio</TableCell>
              <TableCell align="center">Notte</TableCell>
              <TableCell align="center">Mattina</TableCell>
              <TableCell align="center">Pomeriggio</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {turniGenerati.giorni.map((giorno, index) => (
              <TableRow key={index}>
                <TableCell>{giorno.data.split('/')[0]}</TableCell>
                <TableCell>{getNomeGiorno(parseInt(giorno.data.split('/')[0]))}</TableCell>
                
                {/* Box 1 */}
                <TableCell 
                  align="center"
                  sx={{ 
                    cursor: 'pointer'
                  }}
                  onClick={() => handleModificaTurno(index + 1, 1, 'mattina')}
                >
                  {giorno.box1.mattina ? (
                    <>
                      {getNomeMedico(giorno.box1.mattina.medico)}
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : '-'}
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    cursor: 'pointer'
                  }}
                  onClick={() => handleModificaTurno(index + 1, 1, 'pomeriggio')}
                >
                  {giorno.box1.pomeriggio ? (
                    <>
                      {getNomeMedico(giorno.box1.pomeriggio.medico)}
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : '-'}
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    cursor: 'pointer'
                  }}
                  onClick={() => handleModificaTurno(index + 1, 1, 'notte')}
                >
                  {giorno.box1.notte ? (
                    <>
                      {getNomeMedico(giorno.box1.notte.medico)}
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : '-'}
                </TableCell>
                
                {/* Box 2 */}
                <TableCell 
                  align="center"
                  sx={{ 
                    cursor: 'pointer'
                  }}
                  onClick={() => handleModificaTurno(index + 1, 2, 'mattina')}
                >
                  {giorno.box2.mattina ? (
                    <>
                      {getNomeMedico(giorno.box2.mattina.medico)}
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : '-'}
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    cursor: 'pointer'
                  }}
                  onClick={() => handleModificaTurno(index + 1, 2, 'pomeriggio')}
                >
                  {giorno.box2.pomeriggio ? (
                    <>
                      {getNomeMedico(giorno.box2.pomeriggio.medico)}
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : '-'}
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    cursor: 'pointer'
                  }}
                  onClick={() => handleModificaTurno(index + 1, 2, 'notte')}
                >
                  {giorno.box2.notte ? (
                    <>
                      {getNomeMedico(giorno.box2.notte.medico)}
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : '-'}
                </TableCell>
                
                {/* Box 3 */}
                <TableCell 
                  align="center"
                  sx={{ 
                    cursor: 'pointer'
                  }}
                  onClick={() => handleModificaTurno(index + 1, 3, 'mattina')}
                >
                  {giorno.box3.mattina ? (
                    <>
                      {getNomeMedico(giorno.box3.mattina.medico)}
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : '-'}
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    cursor: 'pointer'
                  }}
                  onClick={() => handleModificaTurno(index + 1, 3, 'pomeriggio')}
                >
                  {giorno.box3.pomeriggio ? (
                    <>
                      {getNomeMedico(giorno.box3.pomeriggio.medico)}
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Renderizza la visualizzazione per medico
  const renderVisualizzazionePerMedico = () => {
    if (!turniGenerati) return null;
    
    const giorniMese = new Date(anno, mese, 0).getDate();
    const giorni = Array.from({ length: giorniMese }, (_, i) => i + 1);
    
    return (
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Medico</TableCell>
              {giorni.map(giorno => (
                <TableCell key={giorno} align="center">
                  <Box>
                    <Typography variant="body2">{giorno}</Typography>
                    <Typography variant="caption">{getNomeGiorno(giorno)}</Typography>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {medici.map(medico => (
              <TableRow key={medico.id}>
                <TableCell>{medico.nome}</TableCell>
                {giorni.map(giorno => {
                  const turnoCombinato = getTurnoCombinatoMedico(medico.id, giorno);
                  
                  return (
                    <TableCell 
                      key={giorno} 
                      align="center"
                      sx={{ 
                        backgroundColor: turnoCombinato ? boxColori[turnoCombinato.box] : 'inherit',
                        color: turnoCombinato ? 'white' : 'inherit',
                        cursor: turnoCombinato ? 'pointer' : 'default'
                      }}
                      onClick={() => {
                        if (turnoCombinato && !turnoCombinato.isMultiBox) {
                          handleModificaTurno(giorno, turnoCombinato.box.slice(3), turnoCombinato.fascia);
                        }
                      }}
                    >
                      {turnoCombinato ? (
                        <>
                          {turnoCombinato.turno}
                          {!turnoCombinato.isMultiBox && (
                            <IconButton size="small" sx={{ ml: 1, color: 'white' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {turnoCombinato.isMultiBox && (
                            <IconButton 
                              size="small" 
                              sx={{ ml: 1, color: 'white' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDettagliTurniMultipli(e, turnoCombinato);
                              }}
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          )}
                        </>
                      ) : '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Renderizza il popover con i dettagli dei turni multipli box
  const renderDettagliTurniMultipliPopover = () => {
    const open = Boolean(anchorEl);
    
    if (!dettagliTurniMultipli) return null;
    
    // Traduci i nomi dei box
    const boxNomi = {
      'box1': 'Box 1',
      'box2': 'Box 2',
      'box3': 'Box 3'
    };
    
    // Traduci i nomi delle fasce orarie
    const fasciaNomi = {
      'mattina': 'Mattina (08:00-14:00)',
      'pomeriggio': 'Pomeriggio (14:00-20:00)',
      'notte': 'Notte (20:00-08:00)'
    };
    
    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseDettagliTurniMultipli}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            Dettagli Turni
          </Typography>
          <Typography variant="body2" paragraph>
            Il medico lavora in più box durante questo giorno:
          </Typography>
          <Box sx={{ mb: 2 }}>
            {dettagliTurniMultipli.turniDettagliati.map((turno, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Chip 
                  label={`${boxNomi[turno.box]} - ${fasciaNomi[turno.fascia]}`}
                  sx={{ 
                    backgroundColor: boxColori[turno.box],
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Nota: I turni in box multipli sono evidenziati in viola e non possono essere modificati direttamente. 
            Per modificare, usa la visualizzazione per box.
          </Typography>
        </Box>
      </Popover>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Generazione Turni
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          In questa sezione è possibile generare automaticamente i turni in base alle disponibilità e ai vincoli impostati.
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="mese-select-label">Mese</InputLabel>
              <Select
                labelId="mese-select-label"
                id="mese-select"
                value={mese}
                label="Mese"
                onChange={handleChangeMese}
              >
                {mesi.map((m, index) => (
                  <MenuItem key={index} value={index + 1}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Anno"
              type="number"
              value={anno}
              onChange={handleChangeAnno}
              InputProps={{ inputProps: { min: 2020, max: 2030 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleGeneraTurni}
              disabled={!mese || generando}
              sx={{ height: '56px' }}
            >
              {generando ? 'Generazione in corso...' : 'Genera Turni'}
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Parametri di Generazione
          </Typography>
          <Tooltip title="Il sistema interpreta le disponibilità combinate (es. MN) come disponibilità per ciascun turno singolo (M e N). Questo permette di ottimizzare l'assegnazione dei turni in base alle necessità di copertura. Dopo ogni turno di notte, il medico avrà automaticamente un giorno di riposo (smonto). I turni vengono assegnati solo ai medici che hanno dato disponibilità, le caselle restano vuote quando non ci sono medici disponibili.">
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Massimo turni consecutivi"
              type="number"
              name="maxTurniConsecutivi"
              value={parametri.maxTurniConsecutivi}
              onChange={handleChangeParametro}
              InputProps={{ inputProps: { min: 1, max: 7 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Minimo riposo tra turni (ore)"
              type="number"
              name="minRiposoOre"
              value={parametri.minRiposoOre}
              onChange={handleChangeParametro}
              InputProps={{ inputProps: { min: 8, max: 24 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl component="fieldset" sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={parametri.bilanciamentoCarico}
                        onChange={handleChangeParametro}
                        name="bilanciamentoCarico"
                      />
                    }
                    label="Bilanciamento carico di lavoro"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={parametri.rispettaPreferenze}
                        onChange={handleChangeParametro}
                        name="rispettaPreferenze"
                      />
                    }
                    label="Rispetta preferenze medici"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={parametri.prioritaFerie}
                        onChange={handleChangeParametro}
                        name="prioritaFerie"
                      />
                    }
                    label="Priorità a ferie e permessi"
                  />
                </Grid>
              </Grid>
            </FormControl>
          </Grid>
        </Grid>
        
        {turniGenerati && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Turni Generati - {mesi[mese - 1]} {anno}
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handleSalvaTurni}
                  sx={{ mr: 1 }}
                >
                  Salva
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleEsportaTurni}
                >
                  Esporta Excel
                </Button>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Statistiche:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Turni Totali
                    </Typography>
                    <Typography variant="h6">
                      {turniGenerati.statistiche.turniTotali}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Turni Assegnati
                    </Typography>
                    <Typography variant="h6">
                      {turniGenerati.statistiche.turniAssegnati}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Media Turni per Medico
                    </Typography>
                    <Typography variant="h6">
                      {turniGenerati.statistiche.mediaTurniPerMedico.toFixed(1)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Problemi Copertura
                    </Typography>
                    <Typography variant="h6" color={turniGenerati.statistiche.problemiCopertura > 0 ? 'error' : 'inherit'}>
                      {turniGenerati.statistiche.problemiCopertura}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Tabs
                value={visualizzazione}
                onChange={handleChangeVisualizzazione}
                aria-label="visualizzazione turni"
              >
                <Tab 
                  value="perMedico" 
                  label="Per Medico" 
                  icon={<ViewListIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  value="perBox" 
                  label="Per Box" 
                  icon={<TableViewIcon />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>
            
            {visualizzazione === 'perBox' ? renderVisualizzazionePerBox() : renderVisualizzazionePerMedico()}
            
            {/* Popover per i dettagli dei turni multipli box */}
            {renderDettagliTurniMultipliPopover()}
          </>
        )}
      </Paper>
      
      {/* Dialog per modificare un turno */}
      <Dialog open={openModificaDialog} onClose={handleCloseModificaDialog}>
        <DialogTitle>
          Modifica Turno
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Giorno: {giornoSelezionato} {mese && mesi[mese - 1]} {anno}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Box: {boxSelezionato}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Fascia: {fasciaSelezionata === 'mattina' ? 'Mattina (08:00-14:00)' : 
                       fasciaSelezionata === 'pomeriggio' ? 'Pomeriggio (14:00-20:00)' : 
                       'Notte (20:00-08:00)'}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="medico-select-label">Medico</InputLabel>
              <Select
                labelId="medico-select-label"
                id="medico-select"
                value={medicoSelezionato || ''}
                label="Medico"
                onChange={(e) => setMedicoSelezionato(e.target.value)}
              >
                <MenuItem value="">
                  <em>Nessun medico (lascia vuoto)</em>
                </MenuItem>
                {mediciDisponibili.map((medico) => (
                  <MenuItem key={medico.id} value={medico.id}>
                    {medico.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModificaDialog}>Annulla</Button>
          <Button onClick={handleSalvaModifica} variant="contained">Salva</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar per i messaggi */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GenerazioneTurni;
