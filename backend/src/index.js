const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');
const logger = require('./utils/logger');
require('dotenv').config();

// Inizializza l'app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging delle richieste
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Endpoint di health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api', routes);

// Gestione degli errori
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Avvio del server
const startServer = async () => {
  try {
    // Sincronizza il database
    await sequelize.sync();
    logger.info('Database synchronized');

    // Avvia il server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
