const express = require('express');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const passport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const requireAuth = require('./middleware/auth');
const shelvesRoutes = require('./routes/shelves.routes');
const userBooksRoutes = require('./routes/userBooks.routes');

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use('/api/shelves', requireAuth, shelvesRoutes);
app.use('/api/user-books', requireAuth, userBooksRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
