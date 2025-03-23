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
  Checkbox,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EventIcon from '@mui/icons-material/Event';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import itLocale from 'date-fns/locale/it';

// Dati di esempio per i medici
const mediciIniziali = [
  { id: 1, nome: 'Mario Rossi', specializzazione: 'Cardiologia' },
  { id: 2, nome: 'Laura Bianchi', specializzazione: 'Medicina d\'urgenza' },
  { id: 3, nome: 'Giuseppe Verdi', specializzazione: 'Ortopedia' },
  { id: 4, nome: 'Francesca Neri', specializzazione: 'Medicina generale' },
];

// Turni disponibili con codifica specifica
const turni = [
  { codice: 'M', descrizione: 'Mattina (08:00-14:00)' },
  { codice: 'P', descrizione: 'Pomeriggio (14:00-20:00)' },
  { codice: 'MP', descrizione: 'Mattina+Pomeriggio (08:00-20:00)' },
  { codice: 'N', descrizione: 'Notte (20:00-08:00)' },
  { codice: 'MN', descrizione: 'Mattina+Notte (08:00-14:00 + 20:00-08:00)' },
  { codice: 'PN', descrizione: 'Pomeriggio+Notte (14:00-20:00 + 20:00-08:00)' },
  { codice: 'MPN', descrizione: 'Mattina+Pomeriggio+Notte (08:00-20:00 + 20:00-08:00)' }
];

// Mesi dell'anno
const mesi = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

function Disponibilita() {
  const [medici, setMedici] = useState([]);
  const [medicoSelezionato, setMedicoSelezionato] = useState('');
  const [loading, setLoading] = useState(true);
  const [disponibilita, setDisponibilita] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [ferie, setFerie] = useState([]);
  const [openFerieDialog, setOpenFerieDialog] = useState(false);
  const [nuovaFeria, setNuovaFeria] = useState({
    dataInizio: null,
    dataFine: null,
    tipo: 'ferie',
    note: ''
  });
  const [meseSelezionato, setMeseSelezionato] = useState(new Date().getMonth() + 1);
  const [annoSelezionato, setAnnoSelezionato] = useState(new Date().getFullYear());
  const [giorniMese, setGiorniMese] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Carica i dati dei medici all'avvio
  useEffect(() => {
    // Simula il caricamento dei dati dal backend
    setTimeout(() => {
      setMedici(mediciIniziali);
      setLoading(false);
    }, 500);
  }, []);

  // Calcola i giorni del mese selezionato
  useEffect(() => {
    const numeroDiGiorni = new Date(annoSelezionato, meseSelezionato, 0).getDate();
    const giorni = Array.from({ length: numeroDiGiorni }, (_, i) => i + 1);
    setGiorniMese(giorni);
  }, [meseSelezionato, annoSelezionato]);

  // Inizializza la disponibilità quando viene selezionato un medico e un mese
  useEffect(() => {
    if (medicoSelezionato && giorniMese.length > 0) {
      // Simula il caricamento delle disponibilità dal backend
      setTimeout(() => {
        // Genera disponibilità casuali per demo
        const nuovaDisponibilita = {};
        giorniMese.forEach(giorno => {
          nuovaDisponibilita[giorno] = {};
          turni.forEach(turno => {
            nuovaDisponibilita[giorno][turno.codice] = Math.random() > 0.5;
          });
        });
        setDisponibilita(nuovaDisponibilita);
        
        // Genera ferie casuali per demo
        const dataOggi = new Date();
        const ferieEsempio = [
          {
            id: 1,
            dataInizio: new Date(annoSelezionato, meseSelezionato - 1, 10),
            dataFine: new Date(annoSelezionato, meseSelezionato - 1, 17),
            tipo: 'ferie',
            note: 'Vacanza estiva'
          },
          {
            id: 2,
            dataInizio: new Date(annoSelezionato, meseSelezionato - 1, 25),
            dataFine: new Date(annoSelezionato, meseSelezionato - 1, 25),
            tipo: 'permesso104',
            note: 'Permesso 104'
          }
        ];
        setFerie(ferieEsempio);
      }, 300);
    }
  }, [medicoSelezionato, giorniMese, meseSelezionato, annoSelezionato]);

  // Gestisce il cambio del medico selezionato
  const handleChangeMedico = (event) => {
    setMedicoSelezionato(event.target.value);
  };

  // Gestisce il cambio del mese
  const handleChangeMese = (event) => {
    setMeseSelezionato(event.target.value);
  };

  // Gestisce il cambio dell'anno
  const handleChangeAnno = (event) => {
    setAnnoSelezionato(event.target.value);
  };

  // Gestisce il cambio di tab
  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  // Gestisce il cambio di disponibilità
  const handleChangeDisponibilita = (giorno, turnoCodice) => {
    setDisponibilita(prev => ({
      ...prev,
      [giorno]: {
        ...prev[giorno],
        [turnoCodice]: !prev[giorno][turnoCodice]
      }
    }));
  };

  // Gestisce l'apertura del dialog per aggiungere ferie/permessi
  const handleOpenFerieDialog = () => {
    setNuovaFeria({
      dataInizio: null,
      dataFine: null,
      tipo: 'ferie',
      note: ''
    });
    setOpenFerieDialog(true);
  };

  // Gestisce la chiusura del dialog per ferie/permessi
  const handleCloseFerieDialog = () => {
    setOpenFerieDialog(false);
  };

  // Gestisce il cambio dei campi del form ferie
  const handleFerieInputChange = (e) => {
    const { name, value } = e.target;
    setNuovaFeria({
      ...nuovaFeria,
      [name]: value
    });
  };

  // Gestisce il cambio delle date
  const handleDateChange = (name, date) => {
    setNuovaFeria({
      ...nuovaFeria,
      [name]: date
    });
  };

  // Gestisce il salvataggio delle ferie/permessi
  const handleSaveFerie = () => {
    if (!nuovaFeria.dataInizio || !nuovaFeria.dataFine) {
      setSnackbar({
        open: true,
        message: 'Seleziona le date di inizio e fine',
        severity: 'error'
      });
      return;
    }

    if (nuovaFeria.dataInizio > nuovaFeria.dataFine) {
      setSnackbar({
        open: true,
        message: 'La data di inizio deve essere precedente alla data di fine',
        severity: 'error'
      });
      return;
    }

    const nuovaFeriaConId = {
      ...nuovaFeria,
      id: Math.max(...ferie.map(f => f.id), 0) + 1
    };

    setFerie([...ferie, nuovaFeriaConId]);
    setOpenFerieDialog(false);
    
    setSnackbar({
      open: true,
      message: `${nuovaFeria.tipo === 'ferie' ? 'Ferie' : 'Permesso 104'} aggiunto con successo`,
      severity: 'success'
    });
  };

  // Gestisce l'eliminazione di ferie/permessi
  const handleDeleteFerie = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo periodo?')) {
      setFerie(ferie.filter(f => f.id !== id));
      setSnackbar({
        open: true,
        message: 'Periodo eliminato con successo',
        severity: 'success'
      });
    }
  };

  // Gestisce il salvataggio delle disponibilità
  const handleSave = () => {
    // In un'implementazione reale, qui ci sarebbe una chiamata API
    console.log('Disponibilità salvate:', { 
      medicoId: medicoSelezionato, 
      mese: meseSelezionato,
      anno: annoSelezionato,
      disponibilita 
    });
    
    setSnackbar({
      open: true,
      message: 'Disponibilità salvate con successo',
      severity: 'success'
    });
  };

  // Formatta la data in formato italiano
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('it-IT');
  };

  // Ottiene il nome del giorno della settimana
  const getNomeGiorno = (giorno) => {
    const data = new Date(annoSelezionato, meseSelezionato - 1, giorno);
    const giorniSettimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
    return giorniSettimana[data.getDay()];
  };

  // Chiude lo snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestione Disponibilità
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          In questa sezione è possibile gestire le disponibilità mensili dei medici per la pianificazione dei turni.
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="medico-select-label">Seleziona Medico</InputLabel>
              <Select
                labelId="medico-select-label"
                id="medico-select"
                value={medicoSelezionato}
                label="Seleziona Medico"
                onChange={handleChangeMedico}
                disabled={loading}
              >
                {medici.map((medico) => (
                  <MenuItem key={medico.id} value={medico.id}>
                    {medico.nome} - {medico.specializzazione}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="mese-select-label">Mese</InputLabel>
              <Select
                labelId="mese-select-label"
                id="mese-select"
                value={meseSelezionato}
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
              value={annoSelezionato}
              onChange={(e) => setAnnoSelezionato(e.target.value)}
              InputProps={{ inputProps: { min: 2020, max: 2030 } }}
            />
          </Grid>
        </Grid>
        
        {medicoSelezionato && (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
              <Tabs value={tabValue} onChange={handleChangeTab} aria-label="disponibilità tabs">
                <Tab icon={<EventIcon />} label="Disponibilità Mensile" />
                <Tab icon={<BeachAccessIcon />} label="Ferie e Permessi" />
              </Tabs>
            </Box>
            
            {/* Tab Disponibilità Mensile */}
            {tabValue === 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Seleziona i turni disponibili per ogni giorno del mese di {mesi[meseSelezionato - 1]} {annoSelezionato}
                </Typography>
                
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Giorno</TableCell>
                        <TableCell>Giorno Settimana</TableCell>
                        {turni.map(turno => (
                          <TableCell key={turno.codice} align="center">
                            <Typography variant="subtitle2">{turno.codice}</Typography>
                            <Typography variant="caption">{turno.descrizione}</Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {giorniMese.map(giorno => (
                        <TableRow key={giorno}>
                          <TableCell component="th" scope="row">
                            {giorno}
                          </TableCell>
                          <TableCell>
                            {getNomeGiorno(giorno)}
                          </TableCell>
                          {turni.map(turno => (
                            <TableCell key={turno.codice} align="center">
                              <Checkbox
                                checked={disponibilita[giorno]?.[turno.codice] || false}
                                onChange={() => handleChangeDisponibilita(giorno, turno.codice)}
                                color="primary"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Salva Disponibilità
                </Button>
              </Box>
            )}
            
            {/* Tab Ferie e Permessi */}
            {tabValue === 1 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Gestione ferie e permessi
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleOpenFerieDialog}
                  >
                    Aggiungi Periodo
                  </Button>
                </Box>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Data Inizio</TableCell>
                        <TableCell>Data Fine</TableCell>
                        <TableCell>Note</TableCell>
                        <TableCell align="center">Azioni</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ferie.length > 0 ? (
                        ferie.map((periodo) => (
                          <TableRow key={periodo.id}>
                            <TableCell>{periodo.tipo === 'ferie' ? 'Ferie' : 'Permesso 104'}</TableCell>
                            <TableCell>{formatDate(periodo.dataInizio)}</TableCell>
                            <TableCell>{formatDate(periodo.dataFine)}</TableCell>
                            <TableCell>{periodo.note}</TableCell>
                            <TableCell align="center">
                              <Button
                                color="error"
                                size="small"
                                onClick={() => handleDeleteFerie(periodo.id)}
                              >
                                Elimina
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            Nessun periodo di ferie o permessi registrato
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Dialog per aggiungere ferie/permessi */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={itLocale}>
        <Dialog open={openFerieDialog} onClose={handleCloseFerieDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Aggiungi Ferie o Permessi
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="tipo-label">Tipo</InputLabel>
                  <Select
                    labelId="tipo-label"
                    name="tipo"
                    value={nuovaFeria.tipo}
                    label="Tipo"
                    onChange={handleFerieInputChange}
                  >
                    <MenuItem value="ferie">Ferie</MenuItem>
                    <MenuItem value="permesso104">Permesso 104</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Data Inizio"
                  value={nuovaFeria.dataInizio}
                  onChange={(date) => handleDateChange('dataInizio', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Data Fine"
                  value={nuovaFeria.dataFine}
                  onChange={(date) => handleDateChange('dataFine', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  name="note"
                  label="Note"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={nuovaFeria.note}
                  onChange={handleFerieInputChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseFerieDialog}>Annulla</Button>
            <Button onClick={handleSaveFerie} variant="contained">Salva</Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      {/* Snackbar per i messaggi di feedback */}
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

export default Disponibilita;
