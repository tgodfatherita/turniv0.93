const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const logger = require('../utils/logger');

const router = express.Router();

// Validazione per il login
const validateLogin = [
  body('username').notEmpty().withMessage('Il nome utente è obbligatorio'),
  body('password').notEmpty().withMessage('La password è obbligatoria')
];

// Validazione per la registrazione
const validateRegister = [
  body('username').notEmpty().withMessage('Il nome utente è obbligatorio'),
  body('password').isLength({ min: 6 }).withMessage('La password deve essere di almeno 6 caratteri'),
  body('email').isEmail().withMessage('Email non valida')
];

// Login
const login = async (req, res) => {
  // Verifica errori di validazione
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { username, password } = req.body;
    
    // Trova l'utente
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }
    
    // Verifica la password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }
    
    // Genera il token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secure_jwt_secret_here',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );
    
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    logger.error(`Errore nel login: ${error.message}`);
    return res.status(500).json({ message: 'Errore nel login', error: error.message });
  }
};

// Registrazione
const register = async (req, res) => {
  // Verifica errori di validazione
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { username, password, email, role } = req.body;
    
    // Verifica se l'utente esiste già
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Nome utente già in uso' });
    }
    
    // Verifica se l'email esiste già
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email già in uso' });
    }
    
    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crea l'utente
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      role: role || 'user'
    });
    
    // Genera il token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secure_jwt_secret_here',
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );
    
    return res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    logger.error(`Errore nella registrazione: ${error.message}`);
    return res.status(500).json({ message: 'Errore nella registrazione', error: error.message });
  }
};

// Verifica token
const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token non fornito' });
    }
    
    // Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secure_jwt_secret_here');
    
    // Trova l'utente
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Utente non trovato' });
    }
    
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    logger.error(`Errore nella verifica del token: ${error.message}`);
    return res.status(401).json({ message: 'Token non valido', error: error.message });
  }
};

// Routes
router.post('/login', validateLogin, login);
router.post('/register', validateRegister, register);
router.get('/verify', verifyToken);

module.exports = router;
