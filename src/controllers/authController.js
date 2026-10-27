const User = require('../models/User');
const httpError = require('../utils/httpError');

// POST /api/auth/register
async function register(req, res) {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ email: String(email || '').toLowerCase().trim() });
  if (existing) {
    throw httpError(409, 'Email già registrata');
  }

  const user = await User.create({ username, email, password });
  res.status(201).json({ user });
}

module.exports = { register };
