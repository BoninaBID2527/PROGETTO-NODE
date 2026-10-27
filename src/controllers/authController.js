const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const httpError = require('../utils/httpError');

// Genera il token: "sub" identifica l'utente, "jti" identifica il singolo token
function createToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    jwtid: crypto.randomUUID(),
  });
}

// POST /api/auth/register
async function register(req, res) {
  const { username, email, password } = req.body || {};

  const existing = await User.findOne({ email: String(email || '').toLowerCase().trim() });
  if (existing) {
    throw httpError(409, 'Email già registrata');
  }

  const user = await User.create({ username, email, password });
  res.status(201).json({ user });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw httpError(400, 'Email e password sono obbligatorie');
  }

  // La password è esclusa di default dallo schema, qui serve per il confronto
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(String(password)))) {
    throw httpError(401, 'Credenziali non valide');
  }

  res.json({ token: createToken(user), user });
}

// GET /api/auth/me
function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, me };
