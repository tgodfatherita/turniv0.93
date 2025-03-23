import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Dati di esempio per i medici
const mediciIniziali = [
  { 
    id: 1, 
    nome: 'Mario Rossi', 
    specializzazione: 'Cardiologia', 
    telefono: '333-1234567', 
    email: 'mario.rossi@ospedale.it', 
    oreMensili: 160,
    oreMinime: 140,
    oreMassime: 180,
    competenze: {box1: true, box2: true, box3: false},
    priorita: 'alta'
  },
  { 
    id: 2, 
    nome: 'Laura Bianchi', 
    specializzazione: 'Medicina d\'urgenza', 
    telefono: '333-7654321', 
    email: 'laura.bianchi@ospedale.it', 
    oreMensili: 150,
    oreMinime: 130,
    oreMassime: 170,
    competenze: {box1: true, box2: false, box3: true},
    priorita: 'bassa'
  },
  { 
    id: 3, 
    nome: 'Giuseppe Verdi', 
    specializzazione: 'Ortopedia', 
    telefono: '333-9876543', 
    email: 'giuseppe.verdi@ospedale.it', 
    oreMensili: 140,
    oreMinime: 120,
    oreMassime: 160,
    competenze: {box1: false, box2: true, box3: true},
    priorita: 'alta'
  },
  { 
    id: 4, 
    nome: 'Francesca Neri', 
    specializzazione: 'Medicina generale', 
    telefono: '333-3456789', 
    email: 'francesca.neri@ospedale.it', 
    oreMensili: 160,
    oreMinime: 140,
    oreMassime: 180,
    competenze: {box1: true, box2: true, box3: true},
    priorita: 'bassa'
  },
];

// Opzioni per le specializzazioni
const specializzazioni = [
  'Cardiologia',
  'Medicina d\'urgenza',
  'Ortopedia',
  'Medicina generale',
  'Neurologia',
  'Pediatria',
  'Chirurgia',
  'Anestesia'
];

function Medici() {
  const [medici, setMedici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMedico, setCurrentMedico] = useState({
    id: null,
    nome: '',
    specializzazione: '',
    telefono: '',
    email: '',
    oreMensili: 160,
    oreMinime: 140,
    oreMassime: 180,
    competenze: {box1: false, box2: false, box3: false},
    priorita: 'bassa'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filtra i medici in base al termine di ricerca
  const filteredMedici = medici.filter(medico => 
    medico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medico.specializzazione.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medico.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestisce l'apertura del dialog per aggiungere un nuovo medico
  const handleAddClick = () => {
    setCurrentMedico({
      id: null,
      nome: '',
      specializzazione: '',
      telefono: '',
      email: '',
      oreMensili: 160,
      oreMinime: 140,
      oreMassime: 180,
      competenze: {box1: false, box2: false, box3: false},
      priorita: 'bassa'
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  // Gestisce l'apertura del dialog per modificare un medico esistente
  const handleEditClick = (medico) => {
    setCurrentMedico({...medico});
    setIsEditing(true);
    setOpenDialog(true);
  };

  // Gestisce la chiusura del dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Gestisce il cambiamento dei campi del form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMedico({
      ...currentMedico,
      [name]: value
    });
  };

  // Gestisce il cambiamento delle competenze
  const handleCompetenzaChange = (e) => {
    const { name, checked } = e.target;
    setCurrentMedico({
      ...currentMedico,
      competenze: {
        ...currentMedico.competenze,
        [name]: checked
      }
    });
  };

  // Gestisce il salvataggio di un nuovo medico o la modifica di uno esistente
  const handleSave = () => {
    if (!currentMedico.nome || !currentMedico.specializzazione || !currentMedico.email) {
      setSnackbar({
        open: true,
        message: 'Compila tutti i campi obbligatori',
        severity: 'error'
      });
      return;
    }

    // Verifica che almeno una competenza sia selezionata
    if (!currentMedico.competenze.box1 && !currentMedico.competenze.box2 && !currentMedico.competenze.box3) {
      setSnackbar({
        open: true,
        message: 'Seleziona almeno una competenza',
        severity: 'error'
      });
      return;
    }

    // Verifica che le ore minime siano minori delle ore massime
    if (currentMedico.oreMinime >= currentMedico.oreMassime) {
      setSnackbar({
        open: true,
        message: 'Le ore minime devono essere inferiori alle ore massime',
        severity: 'error'
      });
      return;
    }

    // Verifica che le ore mensili siano comprese tra minime e massime
    if (currentMedico.oreMensili < currentMedico.oreMinime || currentMedico.oreMensili > currentMedico.oreMassime) {
      setSnackbar({
        open: true,
        message: 'Le ore mensili devono essere comprese tra minime e massime',
        severity: 'error'
      });
      return;
    }

    if (isEditing) {
      // Modifica un medico esistente
      setMedici(medici.map(medico => 
        medico.id === currentMedico.id ? currentMedico : medico
      ));
      setSnackbar({
        open: true,
        message: 'Medico aggiornato con successo',
        severity: 'success'
      });
    } else {
      // Aggiunge un nuovo medico
      const newMedico = {
        ...currentMedico,
        id: Math.max(...medici.map(m => m.id), 0) + 1
      };
      setMedici([...medici, newMedico]);
      setSnackbar({
        open: true,
        message: 'Nuovo medico aggiunto con successo',
        severity: 'success'
      });
    }
    
    setOpenDialog(false);
  };

  // Gestisce l'eliminazione di un medico
  const handleDelete = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo medico?')) {
      setMedici(medici.filter(medico => medico.id !== id));
      setSnackbar({
        open: true,
        message: 'Medico eliminato con successo',
        severity: 'success'
      });
    }
  };

  // Chiude lo snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestione Medici
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" paragraph>
          Questa sezione permette di gestire l'anagrafica dei medici del pronto soccorso, le loro specializzazioni, competenze e disponibilità.
        </Typography>
        
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Cerca medici"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, specializzazione, email..."
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Aggiungi Medico
            </Button>
          </Grid>
        </Grid>
        
        {loading ? (
          <Typography>Caricamento in corso...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Specializzazione</TableCell>
                  <TableCell>Competenze</TableCell>
                  <TableCell>Ore Mensili</TableCell>
                  <TableCell>Priorità</TableCell>
                  <TableCell align="center">Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMedici.length > 0 ? (
                  filteredMedici.map((medico) => (
                    <TableRow key={medico.id}>
                      <TableCell>{medico.nome}</TableCell>
                      <TableCell>{medico.specializzazione}</TableCell>
                      <TableCell>
                        {[
                          medico.competenze.box1 ? 'Box 1' : null,
                          medico.competenze.box2 ? 'Box 2' : null,
                          medico.competenze.box3 ? 'Box 3' : null
                        ].filter(Boolean).join(', ')}
                      </TableCell>
                      <TableCell>{medico.oreMensili} ({medico.oreMinime}-{medico.oreMassime})</TableCell>
                      <TableCell>{medico.priorita === 'alta' ? 'Alta' : 'Bassa'}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEditClick(medico)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(medico.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Nessun medico trovato
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Dialog per aggiungere/modificare un medico */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Modifica Medico' : 'Aggiungi Nuovo Medico'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Inserisci i dati del medico nei campi sottostanti.
          </DialogContentText>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                margin="dense"
                name="nome"
                label="Nome Completo"
                type="text"
                fullWidth
                variant="outlined"
                value={currentMedico.nome}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="specializzazione-label">Specializzazione</InputLabel>
                <Select
                  labelId="specializzazione-label"
                  name="specializzazione"
                  value={currentMedico.specializzazione}
                  label="Specializzazione"
                  onChange={handleInputChange}
                  required
                >
                  {specializzazioni.map((spec) => (
                    <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="telefono"
                label="Telefono"
                type="text"
                fullWidth
                variant="outlined"
                value={currentMedico.telefono}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={currentMedico.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Competenze
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={currentMedico.competenze.box1} 
                      onChange={handleCompetenzaChange} 
                      name="box1" 
                    />
                  }
                  label="Box 1"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={currentMedico.competenze.box2} 
                      onChange={handleCompetenzaChange} 
                      name="box2" 
                    />
                  }
                  label="Box 2"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={currentMedico.competenze.box3} 
                      onChange={handleCompetenzaChange} 
                      name="box3" 
                    />
                  }
                  label="Box 3"
                />
              </FormGroup>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                margin="dense"
                name="oreMensili"
                label="Ore Mensili"
                type="number"
                fullWidth
                variant="outlined"
                value={currentMedico.oreMensili}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, max: 200 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                margin="dense"
                name="oreMinime"
                label="Ore Minime"
                type="number"
                fullWidth
                variant="outlined"
                value={currentMedico.oreMinime}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, max: 200 } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                margin="dense"
                name="oreMassime"
                label="Ore Massime"
                type="number"
                fullWidth
                variant="outlined"
                value={currentMedico.oreMassime}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, max: 200 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="priorita-label">Priorità</InputLabel>
                <Select
                  labelId="priorita-label"
                  name="priorita"
                  value={currentMedico.priorita}
                  label="Priorità"
                  onChange={handleInputChange}
                >
                  <MenuItem value="alta">Alta</MenuItem>
                  <MenuItem value="bassa">Bassa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button onClick={handleSave} variant="contained">Salva</Button>
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

export default Medici;
