import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

function RiepilogoOre() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Riepilogo Ore
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1">
          In questa sezione è possibile visualizzare il riepilogo delle ore lavorate dai medici del pronto soccorso.
        </Typography>
      </Paper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Report Ore Lavorate
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

export default RiepilogoOre;
