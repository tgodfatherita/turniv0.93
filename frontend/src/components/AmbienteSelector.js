// Componente per la selezione dell'ambiente nel menu principale
import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Settings } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AmbienteSelector = ({ onAmbienteChange }) => {
  const [ambienti, setAmbienti] = useState([]);
  const [selectedAmbienteId, setSelectedAmbienteId] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  // Carica gli ambienti all'avvio
  useEffect(() => {
    fetchAmbienti();
    
    // Recupera l'ambiente selezionato dal localStorage
    const savedAmbienteId = localStorage.getItem('selectedAmbienteId');
    if (savedAmbienteId) {
      setSelectedAmbienteId(savedAmbienteId);
      // Notifica il componente padre del cambio ambiente
      if (onAmbienteChange) {
        onAmbienteChange(savedAmbienteId);
      }
    }
  }, []);

  // Recupera tutti gli ambienti
  const fetchAmbienti = async () => {
    try {
      const response = await axios.get('/api/ambienti');
      setAmbienti(response.data);
      
      // Se non c'è un ambiente selezionato e ci sono ambienti disponibili, seleziona il primo
      if ((!selectedAmbienteId || selectedAmbienteId === '') && response.data.length > 0) {
        setSelectedAmbienteId(response.data[0].id);
        localStorage.setItem('selectedAmbienteId', response.data[0].id);
        
        // Notifica il componente padre del cambio ambiente
        if (onAmbienteChange) {
          onAmbienteChange(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Errore nel recupero degli ambienti:', error);
      // Mostra dialog per creare un ambiente se non ce ne sono
      if (error.response && error.response.status === 404) {
        setOpenDialog(true);
      }
    }
  };

  // Gestisce il cambio di ambiente
  const handleAmbienteChange = (event) => {
    const ambienteId = event.target.value;
    setSelectedAmbienteId(ambienteId);
    localStorage.setItem('selectedAmbienteId', ambienteId);
    
    // Notifica il componente padre del cambio ambiente
    if (onAmbienteChange) {
      onAmbienteChange(ambienteId);
    }
  };

  // Crea un ambiente di default
  const handleCreateDefaultAmbiente = async () => {
    try {
      const response = await axios.post('/api/ambienti/default');
      setAmbienti([response.data]);
      setSelectedAmbienteId(response.data.id);
      localStorage.setItem('selectedAmbienteId', response.data.id);
      
      // Notifica il componente padre del cambio ambiente
      if (onAmbienteChange) {
        onAmbienteChange(response.data.id);
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Errore nella creazione dell\'ambiente di default:', error);
    }
  };

  // Naviga alle impostazioni degli ambienti
  const handleNavigateToSettings = () => {
    navigate('/impostazioni/ambienti');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FormControl sx={{ minWidth: 200 }} size="small">
        <InputLabel id="ambiente-select-label">Ambiente</InputLabel>
        <Select
          labelId="ambiente-select-label"
          value={selectedAmbienteId}
          label="Ambiente"
          onChange={handleAmbienteChange}
        >
          {ambienti.map((ambiente) => (
            <MenuItem key={ambiente.id} value={ambiente.id}>
              {ambiente.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Button
        variant="outlined"
        size="small"
        startIcon={<Settings />}
        onClick={handleNavigateToSettings}
      >
        Configura
      </Button>
      
      {/* Dialog per creare un ambiente quando non ce ne sono */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nessun ambiente configurato</DialogTitle>
        <DialogContent>
          <Typography>
            Non è stato trovato nessun ambiente configurato. È necessario creare almeno un ambiente per utilizzare l'applicazione.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/impostazioni/ambienti')}>
            Configura Ambienti
          </Button>
          <Button onClick={handleCreateDefaultAmbiente} variant="contained" color="primary">
            Crea Ambiente di Default
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AmbienteSelector;
