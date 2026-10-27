const request = require('supertest');
const app = require('../src/app');

// Registra un utente, effettua il login e restituisce il token: utile in tutti i test
async function registerAndLogin(user = {}) {
  const data = {
    username: 'mario',
    email: 'mario@example.com',
    password: 'password123',
    ...user,
  };
  await request(app).post('/api/auth/register').send(data);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: data.email, password: data.password });
  return res.body.token;
}

module.exports = { registerAndLogin };
