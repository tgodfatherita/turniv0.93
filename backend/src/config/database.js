const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
require('dotenv').config();

// Configurazione del database
const sequelize = new Sequelize(
  process.env.DB_NAME || 'turni_ps_prod',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: msg => logger.debug(msg),
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test della connessione
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error(`Unable to connect to the database: ${error.message}`);
  }
};

testConnection();

module.exports = { sequelize, Sequelize };
