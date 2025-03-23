import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

function FeriePermessi() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Gestione Ferie e Permessi
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1">
          In questa sezione è possibile gestire le richieste di ferie e permessi del personale medico.
        </Typography>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Calendario Ferie e Permessi
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

export default FeriePermessi;
