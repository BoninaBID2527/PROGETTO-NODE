const request = require('supertest');
const app = require('../src/app');
const db = require('./db');
const User = require('../src/models/User');

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

const utente = { username: 'mario', email: 'mario@example.com', password: 'password123' };

async function login(credenziali = utente) {
  return request(app)
    .post('/api/auth/login')
    .send({ email: credenziali.email, password: credenziali.password });
}

describe('POST /api/auth/register', () => {
  test('registra un nuovo utente senza restituire la password', async () => {
    const res = await request(app).post('/api/auth/register').send(utente);

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('mario@example.com');
    expect(res.body.user.password).toBeUndefined();
  });

  test('salva la password come hash', async () => {
    await request(app).post('/api/auth/register').send(utente);
    const salvato = await User.findOne({ email: utente.email }).select('+password');

    expect(salvato.password).not.toBe(utente.password);
    expect(await salvato.comparePassword(utente.password)).toBe(true);
  });

  test('rifiuta dati non validi con 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', email: 'non-una-email', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(3);
  });

  test('rifiuta una email già registrata con 409', async () => {
    await request(app).post('/api/auth/register').send(utente);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...utente, email: 'MARIO@example.com' });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(utente);
  });

  test('restituisce un token con credenziali corrette', async () => {
    const res = await login();

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user.username).toBe('mario');
  });

  test('rifiuta una password errata con 401', async () => {
    const res = await login({ ...utente, password: 'sbagliata' });
    expect(res.status).toBe(401);
  });

  test('rifiuta un utente inesistente con 401', async () => {
    const res = await login({ email: 'nessuno@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  test('rifiuta una richiesta senza credenziali con 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('Rotte protette e logout', () => {
  let token;

  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(utente);
    token = (await login()).body.token;
  });

  test('GET /api/auth/me restituisce l\'utente con un token valido', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(utente.email);
  });

  test('GET /api/auth/me senza token restituisce 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me con un token non valido restituisce 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer abc.def.ghi');
    expect(res.status).toBe(401);
  });

  test('dopo il logout il token non è più accettato', async () => {
    const logout = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(logout.status).toBe(200);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });

  test('il logout non invalida gli altri token dello stesso utente', async () => {
    const altroToken = (await login()).body.token;
    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${altroToken}`);
    expect(res.status).toBe(200);
  });
});
