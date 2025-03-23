// Componente per la gestione delle ore fisse e permessi
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Typography, TextField, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert
} from '@mui/material';
import { Add, Delete, Edit, Save, Info } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse, differenceInDays, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import DataService from '../../services/DataService';

const OreFissePermessi = () => {
  const [medici, setMedici] = useState([]);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [feriePermessi, setFeriePermessi] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'ferie',
    dataInizio: new Date(),
    dataFine: new Date(),
    oreGiornaliere: 6,
    note: ''
  });
  const [oreLavorate, setOreLavorate] = useState({
    totaleOre: 0,
    dettaglio: []
  });
  const [verificaOreFisse, setVerificaOreFisse] = useState({
    raggiunto: true,
    differenza: 0,
    oreLavorate: 0,
    oreFisse: 0
  });
  const [mese, setMese] = useState(new Date().getMonth() + 1);
  const [anno, setAnno] = useState(new Date().getFullYear());
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Carica i medici all'avvio
  useEffect(() => {
    fetchMedici();
  }, []);

  // Carica le ferie e i permessi quando viene selezionato un medico
  useEffect(() => {
    if (selectedMedico) {
      fetchFeriePermessi();
      fetchOreLavorate();
      verificaRaggiuntoOreFisse();
    }
  }, [selectedMedico, mese, anno]);

  // Recupera tutti i medici
  const fetchMedici = async () => {
    try {
      const data = await DataService.getMedici();
      setMedici(data);
    } catch (error) {
      console.error('Errore nel recupero dei medici:', error);
      showSnackbar('Errore nel recupero dei medici', 'error');
    }
  };

  // Recupera le ferie e i permessi di un medico
  const fetchFeriePermessi = async () => {
    if (!selectedMedico) return;
    
    try {
      const data = await DataService.getFeriePermessi(selectedMedico.id);
      setFeriePermessi(data);
    } catch (error) {
      console.error('Errore nel recupero delle ferie e permessi:', error);
      showSnackbar('Errore nel recupero delle ferie e permessi', 'error');
    }
  };

  // Recupera le ore lavorate da un medico in un mese
  const fetchOreLavorate = async () => {
    if (!selectedMedico) return;
    
    try {
      const data = await DataService.calcolaOreLavorate(selectedMedico.id, mese, anno);
      setOreLavorate(data);
    } catch (error) {
      console.error('Errore nel calcolo delle ore lavorate:', error);
      showSnackbar('Errore nel calcolo delle ore lavorate', 'error');
    }
  };

  // Verifica se un medico ha raggiunto le ore fisse
  const verificaRaggiuntoOreFisse = async () => {
    if (!selectedMedico) return;
    
    try {
      const data = await DataService.verificaOreFisse(selectedMedico.id, mese, anno);
      setVerificaOreFisse(data);
    } catch (error) {
      console.error('Errore nella verifica delle ore fisse:', error);
      showSnackbar('Errore nella verifica delle ore fisse', 'error');
    }
  };

  // Gestisce il cambio di medico selezionato
  const handleMedicoChange = (event) => {
    const medicoId = event.target.value;
    const medico = medici.find(m => m.id === medicoId);
    setSelectedMedico(medico);
  };

  // Gestisce il cambio di mese
  const handleMeseChange = (event) => {
    setMese(parseInt(event.target.value));
  };

  // Gestisce il cambio di anno
  const handleAnnoChange = (event) => {
    setAnno(parseInt(event.target.value));
  };

  // Apre il dialog per aggiungere nuove ferie o permessi
  const handleOpenDialog = () => {
    setFormData({
      tipo: 'ferie',
      dataInizio: new Date(),
      dataFine: new Date(),
      oreGiornaliere: 6,
      note: ''
    });
    setOpenDialog(true);
  };

  // Apre il dialog per modificare ferie o permessi esistenti
  const handleOpenEditDialog = (feriePermesso) => {
    setFormData({
      id: feriePermesso.id,
      tipo: feriePermesso.tipo,
      dataInizio: new Date(feriePermesso.dataInizio),
      dataFine: new Date(feriePermesso.dataFine),
      oreGiornaliere: feriePermesso.oreGiornaliere,
      note: feriePermesso.note || ''
    });
    setOpenDialog(true);
  };

  // Chiude il dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Gestisce il cambio dei campi del form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestisce il cambio delle date
  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  // Salva le ferie o i permessi
  const handleSaveFeriePermessi = async () => {
    if (!selectedMedico) return;
    
    try {
      if (formData.id) {
        // Aggiorna ferie o permessi esistenti
        await DataService.updateFeriePermessi(
          formData.id,
          selectedMedico.id,
          formData.dataInizio,
          formData.dataFine,
          formData.tipo,
          formData.oreGiornaliere,
          formData.note
        );
        showSnackbar('Ferie o permessi aggiornati con successo', 'success');
      } else {
        // Crea nuove ferie o permessi
        await DataService.saveFeriePermessi(
          selectedMedico.id,
          formData.dataInizio,
          formData.dataFine,
          formData.tipo,
          formData.oreGiornaliere,
          formData.note
        );
        showSnackbar('Ferie o permessi salvati con successo', 'success');
      }
      
      // Aggiorna i dati
      fetchFeriePermessi();
      fetchOreLavorate();
      verificaRaggiuntoOreFisse();
      
      // Chiude il dialog
      setOpenDialog(false);
    } catch (error) {
      console.error('Errore nel salvataggio delle ferie o permessi:', error);
      showSnackbar('Errore nel salvataggio delle ferie o permessi', 'error');
    }
  };

  // Elimina ferie o permessi
  const handleDeleteFeriePermessi = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare queste ferie o permessi?')) {
      try {
        await DataService.deleteFeriePermessi(id);
        showSnackbar('Ferie o permessi eliminati con successo', 'success');
        
        // Aggiorna i dati
        fetchFeriePermessi();
        fetchOreLavorate();
        verificaRaggiuntoOreFisse();
      } catch (error) {
        console.error('Errore nell\'eliminazione delle ferie o permessi:', error);
        showSnackbar('Errore nell\'eliminazione delle ferie o permessi', 'error');
      }
    }
  };

  // Mostra un messaggio snackbar
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Chiude lo snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Calcola il numero di giorni tra due date
  const calcolaGiorni = (dataInizio, dataFine) => {
    return differenceInDays(new Date(dataFine), new Date(dataInizio)) + 1;
  };

  // Calcola il totale delle ore per ferie o permessi
  const calcolaTotaleOre = (dataInizio, dataFine, oreGiornaliere) => {
    const giorni = calcolaGiorni(dataInizio, dataFine);
    return giorni * oreGiornaliere;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestione Ore Fisse e Permessi
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="medico-select-label">Medico</InputLabel>
              <Select
                labelId="medico-select-label"
                value={selectedMedico?.id || ''}
                label="Medico"
                onChange={handleMedicoChange}
              >
                {medici.map((medico) => (
                  <MenuItem key={medico.id} value={medico.id}>
                    {`${medico.cognome} ${medico.nome}${medico.oreFisse ? ' (Ore Fisse)' : ''}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="mese-select-label">Mese</InputLabel>
                <Select
                  labelId="mese-select-label"
                  value={mese}
                  label="Mese"
                  onChange={handleMeseChange}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="anno-select-label">Anno</InputLabel>
                <Select
                  labelId="anno-select-label"
                  value={anno}
                  label="Anno"
                  onChange={handleAnnoChange}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((a) => (
                    <MenuItem key={a} value={a}>
                      {a}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleOpenDialog}
                disabled={!selectedMedico}
              >
                Aggiungi
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {selectedMedico && (
          <>
            {selectedMedico.oreFisse && (
              <Paper sx={{ p: 2, mb: 4, bgcolor: verificaOreFisse.raggiunto ? 'success.light' : 'warning.light' }}>
                <Typography variant="h6" gutterBottom>
                  Riepilogo Ore Fisse
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body1">
                      <strong>Ore Fisse:</strong> {verificaOreFisse.oreFisse}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body1">
                      <strong>Ore Lavorate:</strong> {verificaOreFisse.oreLavorate}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body1">
                      <strong>Differenza:</strong> {verificaOreFisse.differenza}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body1">
                      <strong>Stato:</strong> {verificaOreFisse.raggiunto ? 'Raggiunto' : 'Non Raggiunto'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            )}
            
            <Typography variant="h6" gutterBottom>
              Ferie e Permessi
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Data Inizio</TableCell>
                    <TableCell>Data Fine</TableCell>
                    <TableCell>Giorni</TableCell>
                    <TableCell>Ore Giornaliere</TableCell>
                    <TableCell>Totale Ore</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell>Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feriePermessi.map((fp) => (
                    <TableRow key={fp.id}>
                      <TableCell>{fp.tipo === 'ferie' ? 'Ferie' : fp.tipo === 'permesso104' ? 'Permesso 104' : 'Altro Permesso'}</TableCell>
                      <TableCell>{format(new Date(fp.dataInizio), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(new Date(fp.dataFine), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{calcolaGiorni(fp.dataInizio, fp.dataFine)}</TableCell>
                      <TableCell>{fp.oreGiornaliere}</TableCell>
                      <TableCell>{calcolaTotaleOre(fp.dataInizio, fp.dataFine, fp.oreGiornaliere)}</TableCell>
                      <TableCell>{fp.note}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenEditDialog(fp)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteFeriePermessi(fp.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {feriePermessi.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Nessuna ferie o permesso trovato
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Dettaglio Ore Lavorate
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Turno</TableCell>
                    <TableCell>Box</TableCell>
                    <TableCell>Ore</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {oreLavorate.dettaglio && oreLavorate.dettaglio.map((d, index) => (
                    <TableRow key={index}>
                      <TableCell>{d.data}</TableCell>
                      <TableCell>{d.turno}</TableCell>
                      <TableCell>{d.box}</TableCell>
                      <TableCell>{d.ore}</TableCell>
                    </TableRow>
                  ))}
                  {(!oreLavorate.dettaglio || oreLavorate.dettaglio.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Nessun turno trovato
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <strong>Totale Ore:</strong>
                    </TableCell>
                    <TableCell>
                      <strong>{oreLavorate.totaleOre}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
        
        {!selectedMedico && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">
              Seleziona un medico per visualizzare le ferie e i permessi
            </Typography>
          </Paper>
        )}
      </Box>
      
      {/* Dialog per aggiungere/modificare ferie o permessi */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {formData.id ? 'Modifica Ferie/Permessi' : 'Nuove Ferie/Permessi'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="tipo-select-label">Tipo</InputLabel>
            <Select
              labelId="tipo-select-label"
              name="tipo"
              value={formData.tipo}
              label="Tipo"
              onChange={handleFormChange}
            >
              <MenuItem value="ferie">Ferie</MenuItem>
              <MenuItem value="permesso104">Permesso 104</MenuItem>
              <MenuItem value="altro">Altro Permesso</MenuItem>
            </Select>
          </FormControl>
          
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <DatePicker
                  label="Data Inizio"
                  value={formData.dataInizio}
                  onChange={(newValue) => handleDateChange('dataInizio', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="Data Fine"
                  value={formData.dataFine}
                  onChange={(newValue) => handleDateChange('dataFine', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          
          <TextField
            margin="dense"
            name="oreGiornaliere"
            label="Ore Giornaliere"
            type="number"
            fullWidth
            value={formData.oreGiornaliere}
            onChange={handleFormChange}
            InputProps={{ inputProps: { min: 1, max: 24 } }}
            sx={{ mt: 2 }}
          />
          
          <TextField
            margin="dense"
            name="note"
            label="Note"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.note}
            onChange={handleFormChange}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button onClick={handleSaveFeriePermessi} variant="contained" color="primary">
            Salva
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar per i messaggi */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OreFissePermessi;
