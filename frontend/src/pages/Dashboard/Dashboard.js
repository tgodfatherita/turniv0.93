import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';

// Componente Dashboard che mostra una panoramica del sistema di gestione turni
function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    mediciAttivi: 0,
    turniAssegnati: 0,
    turniDaAssegnare: 0,
    problemiCopertura: 0
  });
  
  // Simula il caricamento dei dati dal backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      // In un'implementazione reale, qui ci sarebbe una chiamata API
      // Simuliamo un ritardo di caricamento
      setTimeout(() => {
        setStats({
          mediciAttivi: 24,
          turniAssegnati: 142,
          turniDaAssegnare: 38,
          problemiCopertura: 5
        });
        setLoading(false);
      }, 1000);
    };
    
    fetchDashboardData();
  }, []);
  
  // Dati di esempio per i prossimi turni
  const prossimiTurni = [
    { id: 1, data: '23/03/2025', orario: '08:00 - 14:00', medico: 'Dott. Rossi Mario' },
    { id: 2, data: '23/03/2025', orario: '14:00 - 20:00', medico: 'Dott.ssa Bianchi Laura' },
    { id: 3, data: '23/03/2025', orario: '20:00 - 08:00', medico: 'Dott. Verdi Giuseppe' },
    { id: 4, data: '24/03/2025', orario: '08:00 - 14:00', medico: 'Dott.ssa Neri Francesca' }
  ];
  
  // Dati di esempio per i problemi di copertura
  const problemiCopertura = [
    { id: 1, data: '25/03/2025', orario: '20:00 - 08:00', tipo: 'Turno scoperto' },
    { id: 2, data: '27/03/2025', orario: '14:00 - 20:00', tipo: 'Personale insufficiente' }
  ];
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom>
        Benvenuto, Utente
      </Typography>
      
      {/* Statistiche principali */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Medici Attivi
            </Typography>
            <Typography component="p" variant="h4" sx={{ flexGrow: 1 }}>
              {stats.mediciAttivi}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Personale disponibile
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Turni Assegnati
            </Typography>
            <Typography component="p" variant="h4" sx={{ flexGrow: 1 }}>
              {stats.turniAssegnati}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Mese corrente
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Turni da Assegnare
            </Typography>
            <Typography component="p" variant="h4" sx={{ flexGrow: 1 }}>
              {stats.turniDaAssegnare}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Prossimo mese
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Problemi Copertura
            </Typography>
            <Typography component="p" variant="h4" sx={{ flexGrow: 1, color: stats.problemiCopertura > 0 ? 'error.main' : 'inherit' }}>
              {stats.problemiCopertura}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <WarningIcon color={stats.problemiCopertura > 0 ? "error" : "primary"} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Da risolvere
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Prossimi turni e problemi di copertura */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Prossimi Turni" />
            <Divider />
            <CardContent>
              <List>
                {prossimiTurni.map((turno) => (
                  <React.Fragment key={turno.id}>
                    <ListItem>
                      <ListItemIcon>
                        <EventIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${turno.data} - ${turno.orario}`}
                        secondary={turno.medico}
                      />
                    </ListItem>
                    {turno.id !== prossimiTurni.length && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Problemi di Copertura" 
              titleTypographyProps={{ color: problemiCopertura.length > 0 ? 'error' : 'inherit' }}
            />
            <Divider />
            <CardContent>
              {problemiCopertura.length > 0 ? (
                <List>
                  {problemiCopertura.map((problema) => (
                    <React.Fragment key={problema.id}>
                      <ListItem>
                        <ListItemIcon>
                          <WarningIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${problema.data} - ${problema.orario}`}
                          secondary={problema.tipo}
                        />
                      </ListItem>
                      {problema.id !== problemiCopertura.length && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" sx={{ py: 2, textAlign: 'center' }}>
                  Nessun problema di copertura rilevato
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
