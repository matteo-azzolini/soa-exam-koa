import request from 'supertest';
import server from '../app.js';

let accessToken;

let createdRestaurantId;
let createdMealId;

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

describe('/restaurants OWNER', () => {
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
          owner: 'users/882',
          meals: [
            'meals/111',
            'meals/222',
          ],
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
          owner: 'users/882',
          meals: [
            'meals/111',
            'meals/222',
          ],
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
      owner: 'users/882',
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
        owner: 'users/882',
        meals: [
          'meals/111',
          'meals/222',
        ],
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

describe('/restaurants CUSTOMER', () => {
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
          owner: 'users/882',
          meals: [
            'meals/111',
            'meals/222',
          ],
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
          owner: 'users/882',
          meals: [
            'meals/111',
            'meals/222',
          ],
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

describe('/meals OWNER', () => {
  beforeAll(ownerLogin);

  it('GET ? 123   - should return 200', async () => {
    await request(server)
      .get('/meals')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ restaurantId: 123 })
      .expect(200)
      .expect([
        {
          "id": 111,
          "name": "Margherita",
          "owner": "users/882",
          "restaurant": "restaurants/123"
        },
        {
          "id": 222,
          "name": "Diavola",
          "owner": "users/882",
          "restaurant": "restaurants/123"
        }
      ]);
  });

  it('GET/111     - should return 200', async () => {
    await request(server)
      .get('/meals/9999999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    await request(server)
      .get('/meals/111')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
        "id": 111,
        "name": "Margherita",
        "owner": "users/882",
        "restaurant": "restaurants/123"
      });
  });

  it('POST        - should return 201', async () => {
    await request(server)
      .post('/meals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "name": "Capricciosa",
        "restaurant": "restaurants/999999999"
      })
      .expect(404)

    const response = await request(server)
      .post('/meals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "name": "Capricciosa",
        "restaurant": "restaurants/123"
      })
      .expect(201)

    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body).toStrictEqual(expect.objectContaining({
      name: "Capricciosa",
      owner: 'users/882',
      restaurant: "restaurants/123"
    }));

    createdMealId = response.body.id;

    await request(server)
      .get('/restaurants/123')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
          id: 123,
          name: 'Pizza giusta 2.0',
          owner: 'users/882',
          meals: [
            'meals/111',
            'meals/222',
            `meals/${createdMealId}`,
          ],
      });
  });

  it('PUT/111     - should return 200', async () => {
    await request(server)
      .put('/restaurants/9999999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

     await request(server)
      .put('/meals/111')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: "Bufala"
      })
      .expect(200)
      .expect({
        id: 111,
        name: "Bufala",
        owner: "users/882",
        restaurant: "restaurants/123"
    });
  });

  it('DELETE/XXX  - should return 200', async () => {
    await request(server)
      .delete('/meals/9999999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    await request(server)
      .delete(`/meals/${createdMealId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // check delete
    await request(server)
      .get(`/meals/${createdMealId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    await request(server)
      .get('/restaurants/123')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
          id: 123,
          name: 'Pizza giusta 2.0',
          owner: 'users/882',
          meals: [
            'meals/111',
            'meals/222',
          ],
      });
  });
});

describe('/meals CUSTOMER', () => {
  beforeAll(customerLogin);

  it('GET ? 123   - should return 200', async () => {
    await request(server)
      .get('/meals')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ restaurantId: 123 })
      .expect(200)
      .expect([
        {
          "id": 111,
          "name": "Bufala",
          "owner": "users/882",
          "restaurant": "restaurants/123"
        },
        {
          "id": 222,
          "name": "Diavola",
          "owner": "users/882",
          "restaurant": "restaurants/123"
        }
      ]);
  });

  it('GET/111     - should return 200', async () => {
    await request(server)
      .get('/meals/9999999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    await request(server)
      .get('/meals/111')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
        "id": 111,
        "name": "Bufala",
        "owner": "users/882",
        "restaurant": "restaurants/123"
      });
  });

  it('POST        - should return 403', async () => {
    await request(server)
      .post('/meals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: "Capricciosa",
        restaurant: "restaurants/123"
      })
      .expect(403)
  });

  it('PUT/111     - should return 403', async () => {
     await request(server)
      .put('/meals/111')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: "Bufala"
      })
      .expect(403);
  });

  it('DELETE/111  - should return 403', async () => {
     await request(server)
      .delete(`/meals/111`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
