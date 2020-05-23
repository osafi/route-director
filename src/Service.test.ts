import request from 'supertest';
import { makeApp } from './Service';

describe('Service', () => {
  it('POST /routes prevents unauthorized requests', async () => {
    const app = makeApp('user', 'pass');
    await request(app).post('/routes').expect(401);
  });

  it('POST /routes returns bad request when missing path or target in request body', async () => {
    const app = makeApp('user', 'pass');

    await request(app).post('/routes').auth('user', 'pass').expect(400);
    await request(app)
      .post('/routes')
      .auth('user', 'pass')
      .send({ path: '/test' })
      .expect(400);
    await request(app)
      .post('/routes')
      .auth('user', 'pass')
      .set({ target: 'https://example.com' })
      .expect(400);
  });

  it('POST /routes saves into route map', async () => {
    const routeMap = new Map();
    const app = makeApp('user123', 'pass123', routeMap);
    await request(app)
      .post('/routes')
      .auth('user123', 'pass123')
      .send({ path: '/abc', target: 'https://example1.com' })
      .expect(200);

    await request(app)
      .post('/routes')
      .auth('user123', 'pass123')
      .send({ path: '/xyz', target: 'https://example2.com' })
      .expect(200);

    expect(routeMap.size).toEqual(2);
    expect(routeMap.get('/abc')).toEqual('https://example1.com');
    expect(routeMap.get('/xyz')).toEqual('https://example2.com');
  });

  it('DELETE /routes prevents unauthorized requests', async () => {
    const app = makeApp('user', 'pass');
    await request(app).delete('/routes/test').expect(401);
  });

  it('DELETE /routes removes from the route map', async () => {
    const routeMap = new Map([
      ['/abc', 'https://example1.com'],
      ['/xyz', 'https://example2.com'],
    ]);
    const app = makeApp('user123', 'pass123', routeMap);

    await request(app)
      .delete('/routes/abc')
      .auth('user123', 'pass123')
      .expect(200);
    expect(routeMap.size).toEqual(1);
    expect(routeMap.has('/abc')).toEqual(false);
  });

  it('DELETE /routes returns not found if the route did not exist', async () => {
    const app = makeApp('user123', 'pass123');

    await request(app)
      .delete('/routes/abc')
      .auth('user123', 'pass123')
      .expect(404);
  });

  it('GET /routes returns all configured routes', async () => {
    const routeMap = new Map([
      ['/abc', 'https://example1.com'],
      ['/xyz', 'https://example2.com'],
    ]);
    const app = makeApp('user', 'pass', routeMap);

    await request(app).get('/routes').expect(200, {
      '/abc': 'https://example1.com',
      '/xyz': 'https://example2.com',
    });
  });

  it('GET * returns 400 when requested path is not configured', async () => {
    const app = makeApp('user', 'pass');

    await request(app).get('/test').expect(400, "route '/test' not configured");
  });

  it('GET * redirects to configured target', async () => {
    const routeMap = new Map([['/test', 'https://example.com']]);
    const app = makeApp('user', 'pass', routeMap);

    await request(app)
      .get('/test')
      .expect(307)
      .expect('Location', 'https://example.com');
  });
});
