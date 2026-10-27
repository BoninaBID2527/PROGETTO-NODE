const express = require('express');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
