import request from 'supertest';
import app from '../app/app.js';

let server;
let accessToken;
let createdMealId;

beforeAll(() => { server = app.listen(process.env.JEST_PORT); });

afterAll(() => { server.close(); });

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
          name: 'Pizza giusta',
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
          name: 'Pizza giusta',
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
