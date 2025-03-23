// AmbienteSettings.js
// Componente per la gestione delle impostazioni degli ambienti

import React, { useState, useEffect } from 'react';
import {
  Box, Button, Container, Typography, TextField, Grid, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Divider,
  List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { Add, Delete, Edit, Save, Cancel } from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import axios from 'axios';

// Componente principale per le impostazioni degli ambienti
const AmbienteSettings = () => {
  const [ambienti, setAmbienti] = useState([]);
  const [selectedAmbiente, setSelectedAmbiente] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({});
  const [boxFormData, setBoxFormData] = useState({});
  const [turnoFormData, setTurnoFormData] = useState({});
  const [openBoxDialog, setOpenBoxDialog] = useState(false);
  const [openTurnoDialog, setOpenTurnoDialog] = useState(false);
  const [requisitiCopertura, setRequisitiCopertura] = useState({});

  // Carica gli ambienti all'avvio
  useEffect(() => {
    fetchAmbienti();
  }, []);

  // Carica i dettagli dell'ambiente selezionato
  useEffect(() => {
    if (selectedAmbiente) {
      fetchAmbienteDetails(selectedAmbiente.id);
    }
  }, [selectedAmbiente]);

  // Recupera tutti gli ambienti
  const fetchAmbienti = async () => {
    try {
      const response = await axios.get('/api/ambienti');
      setAmbienti(response.data);
      if (response.data.length > 0 && !selectedAmbiente) {
        setSelectedAmbiente(response.data[0]);
      }
    } catch (error) {
      console.error('Errore nel recupero degli ambienti:', error);
      // Gestione errore
    }
  };

  // Recupera i dettagli di un ambiente specifico
  const fetchAmbienteDetails = async (ambienteId) => {
    try {
      const response = await axios.get(`/api/ambienti/${ambienteId}`);
      setSelectedAmbiente(response.data);
      
      // Imposta i requisiti di copertura
      setRequisitiCopertura(response.data.configurazione.requisitiCopertura || {});
    } catch (error) {
      console.error('Errore nel recupero dei dettagli dell\'ambiente:', error);
      // Gestione errore
    }
  };

  // Gestisce il cambio di tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Apre il dialog per creare un nuovo ambiente
  const handleOpenNewAmbienteDialog = () => {
    setDialogType('new');
    setFormData({ nome: '', descrizione: '' });
    setOpenDialog(true);
  };

  // Apre il dialog per modificare un ambiente esistente
  const handleOpenEditAmbienteDialog = () => {
    if (!selectedAmbiente) return;
    
    setDialogType('edit');
    setFormData({
      id: selectedAmbiente.id,
      nome: selectedAmbiente.nome,
      descrizione: selectedAmbiente.descrizione
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

  // Salva l'ambiente (nuovo o modificato)
  const handleSaveAmbiente = async () => {
    try {
      let response;
      
      if (dialogType === 'new') {
        // Crea un nuovo ambiente
        response = await axios.post('/api/ambienti', formData);
        setAmbienti(prev => [...prev, response.data]);
        setSelectedAmbiente(response.data);
      } else {
        // Modifica un ambiente esistente
        response = await axios.put(`/api/ambienti/${formData.id}`, formData);
        setAmbienti(prev => prev.map(amb => amb.id === response.data.id ? response.data : amb));
        setSelectedAmbiente(response.data);
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Errore nel salvataggio dell\'ambiente:', error);
      // Gestione errore
    }
  };

  // Elimina un ambiente
  const handleDeleteAmbiente = async () => {
    if (!selectedAmbiente) return;
    
    if (window.confirm(`Sei sicuro di voler eliminare l'ambiente "${selectedAmbiente.nome}"?`)) {
      try {
        await axios.delete(`/api/ambienti/${selectedAmbiente.id}`);
        setAmbienti(prev => prev.filter(amb => amb.id !== selectedAmbiente.id));
        setSelectedAmbiente(ambienti.length > 1 ? ambienti[0] : null);
      } catch (error) {
        console.error('Errore nell\'eliminazione dell\'ambiente:', error);
        // Gestione errore
      }
    }
  };

  // Apre il dialog per aggiungere un nuovo box
  const handleOpenNewBoxDialog = () => {
    setBoxFormData({
      nome: '',
      descrizione: '',
      orari: { apertura: '00:00', chiusura: '24:00' }
    });
    setOpenBoxDialog(true);
  };

  // Apre il dialog per modificare un box esistente
  const handleOpenEditBoxDialog = (box) => {
    setBoxFormData({
      id: box.id,
      nome: box.nome,
      descrizione: box.descrizione,
      orari: { ...box.orari }
    });
    setOpenBoxDialog(true);
  };

  // Chiude il dialog del box
  const handleCloseBoxDialog = () => {
    setOpenBoxDialog(false);
  };

  // Gestisce il cambio dei campi del form del box
  const handleBoxFormChange = (e) => {
    const { name, value } = e.target;
    setBoxFormData(prev => ({ ...prev, [name]: value }));
  };

  // Gestisce il cambio degli orari del box
  const handleBoxTimeChange = (type, time) => {
    if (!time) return;
    
    const timeString = format(time, 'HH:mm');
    setBoxFormData(prev => ({
      ...prev,
      orari: {
        ...prev.orari,
        [type]: timeString
      }
    }));
  };

  // Salva il box (nuovo o modificato)
  const handleSaveBox = async () => {
    if (!selectedAmbiente) return;
    
    try {
      let response;
      
      if (boxFormData.id) {
        // Modifica un box esistente
        response = await axios.put(`/api/ambienti/${selectedAmbiente.id}/box/${boxFormData.id}`, boxFormData);
      } else {
        // Crea un nuovo box
        response = await axios.post(`/api/ambienti/${selectedAmbiente.id}/box`, boxFormData);
      }
      
      // Aggiorna l'ambiente selezionato
      fetchAmbienteDetails(selectedAmbiente.id);
      setOpenBoxDialog(false);
    } catch (error) {
      console.error('Errore nel salvataggio del box:', error);
      // Gestione errore
    }
  };

  // Elimina un box
  const handleDeleteBox = async (boxId) => {
    if (!selectedAmbiente) return;
    
    if (window.confirm('Sei sicuro di voler eliminare questo box?')) {
      try {
        await axios.delete(`/api/ambienti/${selectedAmbiente.id}/box/${boxId}`);
        // Aggiorna l'ambiente selezionato
        fetchAmbienteDetails(selectedAmbiente.id);
      } catch (error) {
        console.error('Errore nell\'eliminazione del box:', error);
        // Gestione errore
      }
    }
  };

  // Apre il dialog per aggiungere un nuovo tipo di turno
  const handleOpenNewTurnoDialog = () => {
    setTurnoFormData({
      codice: '',
      descrizione: '',
      oraInizio: '08:00',
      oraFine: '14:00',
      durataTotaleOre: 6,
      isNotturno: false,
      requireSmonto: false
    });
    setOpenTurnoDialog(true);
  };

  // Apre il dialog per modificare un tipo di turno esistente
  const handleOpenEditTurnoDialog = (turno) => {
    setTurnoFormData({
      codice: turno.codice,
      descrizione: turno.descrizione,
      oraInizio: turno.oraInizio,
      oraFine: turno.oraFine,
      durataTotaleOre: turno.durataTotaleOre,
      isNotturno: turno.isNotturno,
      requireSmonto: turno.requireSmonto
    });
    setOpenTurnoDialog(true);
  };

  // Chiude il dialog del tipo di turno
  const handleCloseTurnoDialog = () => {
    setOpenTurnoDialog(false);
  };

  // Gestisce il cambio dei campi del form del tipo di turno
  const handleTurnoFormChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'isNotturno' || name === 'requireSmonto' ? e.target.checked : value;
    setTurnoFormData(prev => ({ ...prev, [name]: newValue }));
  };

  // Gestisce il cambio degli orari del tipo di turno
  const handleTurnoTimeChange = (type, time) => {
    if (!time) return;
    
    const timeString = format(time, 'HH:mm');
    setTurnoFormData(prev => ({
      ...prev,
      [type]: timeString
    }));
    
    // Calcola la durata totale in ore
    if (type === 'oraInizio' || type === 'oraFine') {
      const inizio = type === 'oraInizio' ? timeString : turnoFormData.oraInizio;
      const fine = type === 'oraFine' ? timeString : turnoFormData.oraFine;
      
      const inizioDate = parse(inizio, 'HH:mm', new Date());
      let fineDate = parse(fine, 'HH:mm', new Date());
      
      // Se l'ora di fine è minore dell'ora di inizio, aggiungi un giorno
      if (fineDate < inizioDate) {
        fineDate.setDate(fineDate.getDate() + 1);
      }
      
      // Calcola la differenza in ore
      const diffMs = fineDate - inizioDate;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      setTurnoFormData(prev => ({
        ...prev,
        durataTotaleOre: diffHours
      }));
    }
  };

  // Salva il tipo di turno (nuovo o modificato)
  const handleSaveTurno = async () => {
    if (!selectedAmbiente) return;
    
    try {
      let response;
      const isEdit = selectedAmbiente.configurazione.turni.some(t => t.codice === turnoFormData.codice);
      
      if (isEdit) {
        // Modifica un tipo di turno esistente
        response = await axios.put(`/api/ambienti/${selectedAmbiente.id}/turni/${turnoFormData.codice}`, turnoFormData);
      } else {
        // Crea un nuovo tipo di turno
        response = await axios.post(`/api/ambienti/${selectedAmbiente.id}/turni`, turnoFormData);
      }
      
      // Aggiorna l'ambiente selezionato
      fetchAmbienteDetails(selectedAmbiente.id);
      setOpenTurnoDialog(false);
    } catch (error) {
      console.error('Errore nel salvataggio del tipo di turno:', error);
      // Gestione errore
    }
  };

  // Elimina un tipo di turno
  const handleDeleteTurno = async (codiceTurno) => {
    if (!selectedAmbiente) return;
    
    if (window.confirm('Sei sicuro di voler eliminare questo tipo di turno?')) {
      try {
        await axios.delete(`/api/ambienti/${selectedAmbiente.id}/turni/${codiceTurno}`);
        // Aggiorna l'ambiente selezionato
        fetchAmbienteDetails(selectedAmbiente.id);
      } catch (error) {
        console.error('Errore nell\'eliminazione del tipo di turno:', error);
        // Gestione errore
      }
    }
  };

  // Aggiorna i requisiti di copertura
  const handleRequisitiCoperturaChange = (boxId, fascia, value) => {
    const boxKey = `box${boxId}`;
    
    setRequisitiCopertura(prev => ({
      ...prev,
      [boxKey]: {
        ...(prev[boxKey] || {}),
        [fascia]: parseInt(value) || 0
      }
    }));
  };

  // Salva i requisiti di copertura
  const handleSaveRequisitiCopertura = async () => {
    if (!selectedAmbiente) return;
    
    try {
      await axios.put(`/api/ambienti/${selectedAmbiente.id}/requisitiCopertura`, requisitiCopertura);
      // Aggiorna l'ambiente selezionato
      fetchAmbienteDetails(selectedAmbiente.id);
    } catch (error) {
      console.error('Errore nel salvataggio dei requisiti di copertura:', error);
      // Gestione errore
    }
  };

  // Crea un ambiente di default
  const handleCreateDefaultAmbiente = async () => {
    try {
      const response = await axios.post('/api/ambienti/default');
      setAmbienti(prev => [...prev, response.data]);
      setSelectedAmbiente(response.data);
    } catch (error) {
      console.error('Errore nella creazione dell\'ambiente di default:', error);
      // Gestione errore
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Impostazioni Ambienti
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <FormControl fullWidth>
              <InputLabel id="ambiente-select-label">Ambiente</InputLabel>
              <Select
                labelId="ambiente-select-label"
                value={selectedAmbiente?.id || ''}
                label="Ambiente"
                onChange={(e) => {
                  const ambienteId = e.target.value;
                  const ambiente = ambienti.find(a => a.id === ambienteId);
                  setSelectedAmbiente(ambiente);
                }}
              >
                {ambienti.map((ambiente) => (
                  <MenuItem key={ambiente.id} value={ambiente.id}>
                    {ambiente.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleOpenNewAmbienteDialog}
                fullWidth
              >
                Nuovo
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Edit />}
                onClick={handleOpenEditAmbienteDialog}
                disabled={!selectedAmbiente}
                fullWidth
              >
                Modifica
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteAmbiente}
                disabled={!selectedAmbiente}
                fullWidth
              >
                Elimina
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {selectedAmbiente ? (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Box" />
                <Tab label="Tipi di Turno" />
                <Tab label="Requisiti Copertura" />
              </Tabs>
            </Box>
            
            {/* Tab Box */}
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Box</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleOpenNewBoxDialog}
                  >
                    Aggiungi Box
                  </Button>
                </Box>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Nome</TableCell>
                        <TableCell>Descrizione</TableCell>
                        <TableCell>Orario Apertura</TableCell>
                        <TableCell>Orario Chiusura</TableCell>
                        <TableCell>Azioni</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAmbiente.configurazione.box && selectedAmbiente.configurazione.box.map((box) => (
                        <TableRow key={box.id}>
                          <TableCell>{box.id}</TableCell>
                          <TableCell>{box.nome}</TableCell>
                          <TableCell>{box.descrizione}</TableCell>
                          <TableCell>{box.orari?.apertura || '00:00'}</TableCell>
                          <TableCell>{box.orari?.chiusura || '24:00'}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleOpenEditBoxDialog(box)}>
                              <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteBox(box.id)}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!selectedAmbiente.configurazione.box || selectedAmbiente.configurazione.box.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            Nessun box configurato
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {/* Tab Tipi di Turno */}
            {tabValue === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Tipi di Turno</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleOpenNewTurnoDialog}
                  >
                    Aggiungi Tipo di Turno
                  </Button>
                </Box>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Codice</TableCell>
                        <TableCell>Descrizione</TableCell>
                        <TableCell>Ora Inizio</TableCell>
                        <TableCell>Ora Fine</TableCell>
                        <TableCell>Durata (ore)</TableCell>
                        <TableCell>Notturno</TableCell>
                        <TableCell>Richiede Smonto</TableCell>
                        <TableCell>Azioni</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAmbiente.configurazione.turni && selectedAmbiente.configurazione.turni.map((turno) => (
                        <TableRow key={turno.codice}>
                          <TableCell>{turno.codice}</TableCell>
                          <TableCell>{turno.descrizione}</TableCell>
                          <TableCell>{turno.oraInizio}</TableCell>
                          <TableCell>{turno.oraFine}</TableCell>
                          <TableCell>{turno.durataTotaleOre}</TableCell>
                          <TableCell>{turno.isNotturno ? 'Sì' : 'No'}</TableCell>
                          <TableCell>{turno.requireSmonto ? 'Sì' : 'No'}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleOpenEditTurnoDialog(turno)}>
                              <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteTurno(turno.codice)}>
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!selectedAmbiente.configurazione.turni || selectedAmbiente.configurazione.turni.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            Nessun tipo di turno configurato
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {/* Tab Requisiti Copertura */}
            {tabValue === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Requisiti di Copertura</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    onClick={handleSaveRequisitiCopertura}
                  >
                    Salva Requisiti
                  </Button>
                </Box>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Box</TableCell>
                        <TableCell>Mattina</TableCell>
                        <TableCell>Pomeriggio</TableCell>
                        <TableCell>Notte</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedAmbiente.configurazione.box && selectedAmbiente.configurazione.box.map((box) => {
                        const boxKey = `box${box.id}`;
                        return (
                          <TableRow key={box.id}>
                            <TableCell>{box.nome}</TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={(requisitiCopertura[boxKey]?.mattina || 0)}
                                onChange={(e) => handleRequisitiCoperturaChange(box.id, 'mattina', e.target.value)}
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={(requisitiCopertura[boxKey]?.pomeriggio || 0)}
                                onChange={(e) => handleRequisitiCoperturaChange(box.id, 'pomeriggio', e.target.value)}
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={(requisitiCopertura[boxKey]?.notte || 0)}
                                onChange={(e) => handleRequisitiCoperturaChange(box.id, 'notte', e.target.value)}
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {(!selectedAmbiente.configurazione.box || selectedAmbiente.configurazione.box.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Nessun box configurato
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h6" gutterBottom>
              Nessun ambiente configurato
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateDefaultAmbiente}
              sx={{ mt: 2 }}
            >
              Crea Ambiente di Default
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Dialog per creare/modificare ambiente */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogType === 'new' ? 'Nuovo Ambiente' : 'Modifica Ambiente'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nome"
            label="Nome"
            type="text"
            fullWidth
            value={formData.nome || ''}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="descrizione"
            label="Descrizione"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={formData.descrizione || ''}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button onClick={handleSaveAmbiente} variant="contained" color="primary">
            Salva
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog per creare/modificare box */}
      <Dialog open={openBoxDialog} onClose={handleCloseBoxDialog}>
        <DialogTitle>
          {boxFormData.id ? 'Modifica Box' : 'Nuovo Box'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="nome"
            label="Nome"
            type="text"
            fullWidth
            value={boxFormData.nome || ''}
            onChange={handleBoxFormChange}
          />
          <TextField
            margin="dense"
            name="descrizione"
            label="Descrizione"
            type="text"
            fullWidth
            value={boxFormData.descrizione || ''}
            onChange={handleBoxFormChange}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TimePicker
                  label="Orario Apertura"
                  value={parse(boxFormData.orari?.apertura || '00:00', 'HH:mm', new Date())}
                  onChange={(newValue) => handleBoxTimeChange('apertura', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={6}>
                <TimePicker
                  label="Orario Chiusura"
                  value={parse(boxFormData.orari?.chiusura || '24:00', 'HH:mm', new Date())}
                  onChange={(newValue) => handleBoxTimeChange('chiusura', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBoxDialog}>Annulla</Button>
          <Button onClick={handleSaveBox} variant="contained" color="primary">
            Salva
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog per creare/modificare tipo di turno */}
      <Dialog open={openTurnoDialog} onClose={handleCloseTurnoDialog}>
        <DialogTitle>
          {turnoFormData.id ? 'Modifica Tipo di Turno' : 'Nuovo Tipo di Turno'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="codice"
            label="Codice"
            type="text"
            fullWidth
            value={turnoFormData.codice || ''}
            onChange={handleTurnoFormChange}
            disabled={!!turnoFormData.id}
          />
          <TextField
            margin="dense"
            name="descrizione"
            label="Descrizione"
            type="text"
            fullWidth
            value={turnoFormData.descrizione || ''}
            onChange={handleTurnoFormChange}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TimePicker
                  label="Ora Inizio"
                  value={parse(turnoFormData.oraInizio || '08:00', 'HH:mm', new Date())}
                  onChange={(newValue) => handleTurnoTimeChange('oraInizio', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={6}>
                <TimePicker
                  label="Ora Fine"
                  value={parse(turnoFormData.oraFine || '14:00', 'HH:mm', new Date())}
                  onChange={(newValue) => handleTurnoTimeChange('oraFine', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          <TextField
            margin="dense"
            name="durataTotaleOre"
            label="Durata Totale (ore)"
            type="number"
            fullWidth
            value={turnoFormData.durataTotaleOre || 0}
            onChange={handleTurnoFormChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={turnoFormData.isNotturno || false}
                    onChange={handleTurnoFormChange}
                    name="isNotturno"
                  />
                }
                label="Turno Notturno"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={turnoFormData.requireSmonto || false}
                    onChange={handleTurnoFormChange}
                    name="requireSmonto"
                  />
                }
                label="Richiede Smonto"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTurnoDialog}>Annulla</Button>
          <Button onClick={handleSaveTurno} variant="contained" color="primary">
            Salva
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AmbienteSettings;
