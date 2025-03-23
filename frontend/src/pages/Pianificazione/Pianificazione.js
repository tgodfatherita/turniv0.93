import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

function Pianificazione() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Pianificazione Turni
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1">
          In questa sezione è possibile pianificare i turni del personale medico del pronto soccorso.
        </Typography>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Calendario Pianificazione
            </Typography>
            <Typography variant="body1">
              Contenuto in fase di implementazione.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Pianificazione;
