// Componente per la gestione delle impostazioni
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import AmbienteSettings from './AmbienteSettings';

// Componente principale per le impostazioni
const Impostazioni = () => {
  const [tabValue, setTabValue] = useState(0);

  // Gestisce il cambio di tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Impostazioni
        </Typography>
        
        <Paper sx={{ mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Ambienti" />
            <Tab label="Generali" />
            <Tab label="Backup/Ripristino" />
          </Tabs>
        </Paper>
        
        {/* Tab Ambienti */}
        {tabValue === 0 && (
          <AmbienteSettings />
        )}
        
        {/* Tab Generali */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6">Impostazioni Generali</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Questa sezione è in fase di implementazione.
            </Typography>
          </Box>
        )}
        
        {/* Tab Backup/Ripristino */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6">Backup e Ripristino</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Questa sezione è in fase di implementazione.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Impostazioni;
