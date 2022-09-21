import request from 'supertest';
import server from '../app.js';

let accessToken;

beforeAll(async () => {
  const response = await request(server)
    .post('/login')
    .send({
      "username": "username",
      "password": "password"
    })
    .expect(202);

  accessToken = response.body.accessToken;
});

afterAll(() => {
  server.close();
});

describe('/restaurants', () => {
  it('GET', async () => {
    await request(server)
      .get('/restaurants')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect([
        {
          id: 123,
          name: 'Pizza giusta',
          owner: 'user/994',
          meals: [ 'meals/123' ]
        }
      ]);
  });

  it('GET/123', async () => {
    await request(server)
      .get('/restaurants/9999999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    await request(server)
      .get('/restaurants/123')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
          id: 123,
          name: 'Pizza giusta',
          owner: 'user/994',
          meals: [ 'meals/123' ]
      });
  });

  it('POST', async () => {
    const response = await request(server)
      .post('/restaurants')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "name": "Pizza giustissima"
      })
      .expect(200)

    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body).toStrictEqual(expect.objectContaining({
      name: 'Pizza giustissima',
      owner: 'user/994',
      meals: []
    }));
  });

  it('PUT', async () => {
    await request(server)
      .put('/restaurants/9999999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

     await request(server)
      .put('/restaurants/123')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "name": "Pizza giusta 2.0"
      })
      .expect(200)
      .expect({
        id: 123,
        name: 'Pizza giusta 2.0',
        owner: 'user/994',
        meals: [ 'meals/123' ]
    });
  });
});
