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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

// Dati di esempio per i medici
const mediciIniziali = [
  { id: 1, nome: 'Mario Rossi', specializzazione: 'Cardiologia' },
  { id: 2, nome: 'Laura Bianchi', specializzazione: 'Medicina d\'urgenza' },
  { id: 3, nome: 'Giuseppe Verdi', specializzazione: 'Ortopedia' },
  { id: 4, nome: 'Francesca Neri', specializzazione: 'Medicina generale' },
];

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

function TurniFissi() {
  const [medici, setMedici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [turniFissi, setTurniFissi] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMedico, setCurrentMedico] = useState(null);
  const [sequenzaTurni, setSequenzaTurni] = useState([]);
  const [nuovoTurno, setNuovoTurno] = useState('');
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
      
      // Genera turni fissi di esempio per alcuni medici
      const turniFissiEsempio = {
        1: ['M', 'P', 'N', 'S', 'R', 'M', 'P'],
        3: ['R', 'MP', 'N', 'S', 'M', 'R', 'R']
      };
      setTurniFissi(turniFissiEsempio);
      
      setLoading(false);
    }, 500);
  }, []);

  // Gestisce l'apertura del dialog per modificare i turni fissi
  const handleOpenDialog = (medico) => {
    setCurrentMedico(medico);
    setSequenzaTurni(turniFissi[medico.id] || []);
    setOpenDialog(true);
  };

  // Gestisce la chiusura del dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentMedico(null);
    setSequenzaTurni([]);
    setNuovoTurno('');
  };

  // Gestisce l'aggiunta di un turno alla sequenza
  const handleAddTurno = () => {
    if (!nuovoTurno) return;
    
    setSequenzaTurni([...sequenzaTurni, nuovoTurno]);
    setNuovoTurno('');
  };

  // Gestisce la rimozione di un turno dalla sequenza
  const handleRemoveTurno = (index) => {
    const nuovaSequenza = [...sequenzaTurni];
    nuovaSequenza.splice(index, 1);
    setSequenzaTurni(nuovaSequenza);
  };

  // Gestisce il salvataggio della sequenza di turni
  const handleSaveSequenza = () => {
    if (sequenzaTurni.length === 0) {
      // Se la sequenza è vuota, rimuovi i turni fissi per questo medico
      const nuoviTurniFissi = {...turniFissi};
      delete nuoviTurniFissi[currentMedico.id];
      setTurniFissi(nuoviTurniFissi);
    } else {
      // Altrimenti, salva la nuova sequenza
      setTurniFissi({
        ...turniFissi,
        [currentMedico.id]: sequenzaTurni
      });
    }
    
    setSnackbar({
      open: true,
      message: sequenzaTurni.length === 0 
        ? 'Turni fissi rimossi con successo' 
        : 'Sequenza di turni fissi salvata con successo',
      severity: 'success'
    });
    
    handleCloseDialog();
  };

  // Gestisce la rimozione dei turni fissi per un medico
  const handleRemoveTurniFissi = (medicoId) => {
    if (window.confirm('Sei sicuro di voler rimuovere i turni fissi per questo medico?')) {
      const nuoviTurniFissi = {...turniFissi};
      delete nuoviTurniFissi[medicoId];
      setTurniFissi(nuoviTurniFissi);
      
      setSnackbar({
        open: true,
        message: 'Turni fissi rimossi con successo',
        severity: 'success'
      });
    }
  };

  // Verifica se la sequenza contiene turni consecutivi non validi
  const verificaSequenzaValida = (sequenza) => {
    // Verifica che dopo ogni turno di notte ci sia uno smonto
    for (let i = 0; i < sequenza.length - 1; i++) {
      const turnoAttuale = sequenza[i];
      const turnoSuccessivo = sequenza[i + 1];
      
      if (['N', 'MN', 'PN', 'MPN'].includes(turnoAttuale) && turnoSuccessivo !== 'S') {
        return false;
      }
    }
    
    return true;
  };

  // Chiude lo snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestione Turni Fissi
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          In questa sezione è possibile impostare sequenze fisse di turni per i medici. 
          Dopo ogni turno di notte viene inserito automaticamente uno smonto.
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Legenda Turni:
          </Typography>
          <Grid container spacing={1}>
            {turniCodici.map(codice => (
              <Grid item key={codice}>
                <Chip 
                  label={`${codice}: ${turniDescrizioni[codice]}`} 
                  sx={{ 
                    backgroundColor: turniColori[codice],
                    color: ['R', 'S', 'M'].includes(codice) ? 'text.primary' : 'white'
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {loading ? (
          <Typography>Caricamento in corso...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medico</TableCell>
                  <TableCell>Specializzazione</TableCell>
                  <TableCell>Sequenza Turni Fissi</TableCell>
                  <TableCell align="center">Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {medici.map((medico) => (
                  <TableRow key={medico.id}>
                    <TableCell>{medico.nome}</TableCell>
                    <TableCell>{medico.specializzazione}</TableCell>
                    <TableCell>
                      {turniFissi[medico.id] ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {turniFissi[medico.id].map((turno, index) => (
                            <Chip 
                              key={index}
                              label={turno}
                              size="small"
                              sx={{ 
                                backgroundColor: turniColori[turno],
                                color: ['R', 'S', 'M'].includes(turno) ? 'text.primary' : 'white'
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Nessun turno fisso impostato
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={turniFissi[medico.id] ? <EditIcon /> : <AddIcon />}
                        onClick={() => handleOpenDialog(medico)}
                      >
                        {turniFissi[medico.id] ? 'Modifica' : 'Imposta'}
                      </Button>
                      
                      {turniFissi[medico.id] && (
                        <Button
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                          onClick={() => handleRemoveTurniFissi(medico.id)}
                        >
                          Rimuovi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog per modificare la sequenza di turni fissi */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {`Imposta Turni Fissi per ${currentMedico?.nome || ''}`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
            Definisci una sequenza di turni che si ripeterà ciclicamente. 
            Ricorda che dopo ogni turno di notte (N, MN, PN, MPN) deve seguire uno smonto (S).
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Sequenza attuale:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, minHeight: '40px' }}>
              {sequenzaTurni.length > 0 ? (
                sequenzaTurni.map((turno, index) => (
                  <Chip 
                    key={index}
                    label={turno}
                    onDelete={() => handleRemoveTurno(index)}
                    sx={{ 
                      backgroundColor: turniColori[turno],
                      color: ['R', 'S', 'M'].includes(turno) ? 'text.primary' : 'white'
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nessun turno nella sequenza
                </Typography>
              )}
            </Box>
            
            {sequenzaTurni.length > 0 && !verificaSequenzaValida(sequenzaTurni) && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Attenzione: La sequenza non è valida. Dopo ogni turno di notte deve seguire uno smonto (S).
              </Typography>
            )}
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="turno-select-label">Aggiungi Turno</InputLabel>
                <Select
                  labelId="turno-select-label"
                  value={nuovoTurno}
                  label="Aggiungi Turno"
                  onChange={(e) => setNuovoTurno(e.target.value)}
                >
                  {turniCodici.map(codice => (
                    <MenuItem key={codice} value={codice}>
                      {codice}: {turniDescrizioni[codice]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={handleAddTurno}
                disabled={!nuovoTurno}
              >
                Aggiungi
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button 
            onClick={handleSaveSequenza} 
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={sequenzaTurni.length > 0 && !verificaSequenzaValida(sequenzaTurni)}
          >
            Salva Sequenza
          </Button>
        </DialogActions>
      </Dialog>

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

export default TurniFissi;
