import request from 'supertest';
import server from '../app.js';

let accessToken;

let createdRestaurantId;

afterAll(() => {
  server.close();
});

async function ownerLogin() {
  const response = await request(server)
    .post('/login')
    .send({
      "username": "ristoratore",
      "password": "password"
    })
    .expect(202);

  accessToken = response.body.accessToken;
}

async function customerLogin() {
  const response = await request(server)
    .post('/login')
    .send({
      "username": "cliente",
      "password": "password"
    })
    .expect(202);

  accessToken = response.body.accessToken;
}

describe('OWNER /restaurants', () => {
  beforeAll(ownerLogin);

  it('GET ALL     - should return 200', async () => {
    await request(server)
      .get('/restaurants')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect([
        {
          id: 123,
          name: 'Pizza giusta',
          owner: 'user/882',
          meals: [ 'meals/123' ]
        }
      ]);
  });

  it('GET/123     - should return 200', async () => {
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
          owner: 'user/882',
          meals: [ 'meals/123' ]
      });
  });

  it('POST        - should return 201', async () => {
    const response = await request(server)
      .post('/restaurants')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "name": "Pizza giustissima"
      })
      .expect(201)

    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body).toStrictEqual(expect.objectContaining({
      name: 'Pizza giustissima',
      owner: 'user/882',
      meals: []
    }));

    createdRestaurantId = response.body.id;
  });

  it('PUT/123     - should return 200', async () => {
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
        owner: 'user/882',
        meals: [ 'meals/123' ]
    });
  });

  it('DELETE/XXX  - should return 200', async () => {
    await request(server)
      .delete('/restaurants/9999999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    await request(server)
      .delete(`/restaurants/${createdRestaurantId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // check delete
    await request(server)
      .get(`/restaurants/${createdRestaurantId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});

describe('CUSTOMER /restaurants', () => {
  beforeAll(customerLogin);

  it('GET ALL     - should return 200', async () => {
    await request(server)
      .get('/restaurants')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect([
        {
          id: 123,
          name: 'Pizza giusta 2.0',
          owner: 'user/882',
          meals: [ 'meals/123' ],
        },
      ]);
  });

  it('GET/123     - should return 200', async () => {
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
          name: 'Pizza giusta 2.0',
          owner: 'user/882',
          meals: [ 'meals/123' ]
      });
  });

  it('POST        - should return 403', async () => {
    await request(server)
      .post('/restaurants')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "name": "Pizza giustissima"
      })
      .expect(403)
  });

  it('PUT/123     - should return 403', async () => {
     await request(server)
      .put('/restaurants/123')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "name": "Pizza giusta 2.0"
      })
      .expect(403);
  });

  it('DELETE/123  - should return 403', async () => {
     await request(server)
      .delete(`/restaurants/123`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
