// Aggiornamento di App.js per includere la route per OreFissePermessi
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { it } from 'date-fns/locale';

// Componenti
import AmbienteSelector from './components/AmbienteSelector';
import Medici from './pages/Medici/Medici';
import Disponibilita from './pages/Disponibilita/Disponibilita';
import TurniFissi from './pages/TurniFissi/TurniFissi';
import GenerazioneTurni from './pages/GenerazioneTurni/GenerazioneTurni';
import Pianificazione from './pages/Pianificazione/Pianificazione';
import Impostazioni from './pages/Impostazioni/Impostazioni';
import AmbienteSettings from './pages/Impostazioni/AmbienteSettings';
import OreFissePermessi from './pages/OreFissePermessi/OreFissePermessi';

// Tema dell'applicazione
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

function App() {
  const [selectedAmbienteId, setSelectedAmbienteId] = useState('');
  const [appTitle, setAppTitle] = useState('Software Gestione Turni');

  // Gestisce il cambio di ambiente
  const handleAmbienteChange = (ambienteId) => {
    setSelectedAmbienteId(ambienteId);
    // Salva l'ambiente selezionato nel localStorage
    localStorage.setItem('selectedAmbienteId', ambienteId);
  };

  // Salva automaticamente ad ogni cambio di schermata
  const handleRouteChange = () => {
    // Qui puoi implementare la logica per salvare lo stato dell'applicazione
    console.log('Cambio schermata - Salvataggio automatico');
    // Esempio: DataService.saveCurrentState();
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
        <CssBaseline />
        <Router>
          <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  {appTitle}
                </Typography>
                
                {/* Selettore di ambiente */}
                <AmbienteSelector onAmbienteChange={handleAmbienteChange} />
                
                <Box sx={{ ml: 2 }}>
                  <Button color="inherit" href="/">Home</Button>
                  <Button color="inherit" href="/medici">Medici</Button>
                  <Button color="inherit" href="/disponibilita">Disponibilità</Button>
                  <Button color="inherit" href="/turnifissi">Turni Fissi</Button>
                  <Button color="inherit" href="/generazione">Generazione</Button>
                  <Button color="inherit" href="/pianificazione">Pianificazione</Button>
                  <Button color="inherit" href="/orefissepermessi">Ore Fisse/Permessi</Button>
                  <Button color="inherit" href="/impostazioni">Impostazioni</Button>
                </Box>
              </Toolbar>
            </AppBar>
            
            <Container maxWidth="xl" sx={{ mt: 4 }}>
              <Routes>
                <Route path="/" element={<Pianificazione ambienteId={selectedAmbienteId} />} />
                <Route path="/medici" element={<Medici ambienteId={selectedAmbienteId} />} />
                <Route path="/disponibilita" element={<Disponibilita ambienteId={selectedAmbienteId} />} />
                <Route path="/turnifissi" element={<TurniFissi ambienteId={selectedAmbienteId} />} />
                <Route path="/generazione" element={<GenerazioneTurni ambienteId={selectedAmbienteId} />} />
                <Route path="/pianificazione" element={<Pianificazione ambienteId={selectedAmbienteId} />} />
                <Route path="/orefissepermessi" element={<OreFissePermessi ambienteId={selectedAmbienteId} />} />
                <Route path="/impostazioni" element={<Impostazioni />} />
                <Route path="/impostazioni/ambienti" element={<AmbienteSettings />} />
              </Routes>
            </Container>
          </Box>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
