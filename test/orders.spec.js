import request from 'supertest';
import app from '../app/app.js';

let server;
let accessToken;

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

describe('/orders OWNER', () => {
  beforeAll(ownerLogin);

  it('GET ALL     - should return 200', async () => {
    await request(server)
      .get('/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect([
        {
          "id": 654,
          "status": "PENDING",
          "customer": "users/500",
          "restaurant": "restaurants/123",
          "meals": [
            "meals/111",
            "meals/222",
          ],
        },
      ]);
  });

  it('GET/654     - should return 200', async () => {
    await request(server)
      .get('/orders/9999999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    await request(server)
      .get('/orders/654')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
        "id": 654,
        "status": "PENDING",
        "customer": "users/500",
        "restaurant": "restaurants/123",
        "meals": [
          "meals/111",
          "meals/222",
        ],
      });
  });

  it('POST        - should return 403', async () => {
    await request(server)
      .post('/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "restaurant": "restaurants/123",
        "meals": [
          "meals/111",
        ],
      })
      .expect(403)
  });

  it('PUT/654     - should return 405', async () => {
    await request(server)
      .put('/orders/654')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(405);
  });

  it('DELETE/654  - should return 405', async () => {
    await request(server)
      .delete('/orders/654')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(405);
  });
});

describe('/orders CUSTOMER', () => {
  beforeAll(customerLogin);

  it('GET ALL     - should return 200', async () => {
    await request(server)
      .get('/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect([
        {
          "id": 654,
          "status": "PENDING",
          "customer": "users/500",
          "restaurant": "restaurants/123",
          "meals": [
            "meals/111",
            "meals/222",
          ],
        },
      ]);
  });

  it('GET/654     - should return 200', async () => {
    await request(server)
      .get('/orders/9999999999')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    await request(server)
      .get('/orders/654')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
        "id": 654,
        "status": "PENDING",
        "customer": "users/500",
        "restaurant": "restaurants/123",
        "meals": [
          "meals/111",
          "meals/222",
        ],
      });
  });

  it('POST        - should return 201', async () => {
    await request(server)
      .post('/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "restaurant": "restaurants/999999999",
        "meals": [
          "meals/111",
        ],
      })
      .expect(400, 'Restaurant not found');

    await request(server)
      .post('/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "restaurant": "restaurants/123",
        "meals": [
          "meals/999999999",
        ],
      })
      .expect(400, 'Meal not found');

    const response = await request(server)
      .post('/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        "restaurant": "restaurants/123",
        "meals": [
          "meals/111",
        ],
      })
      .expect(201);

    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body).toStrictEqual(expect.objectContaining({
      "status": "PENDING",
      "customer": "users/500",
      "restaurant": "restaurants/123",
      "meals": [
        "meals/111",
      ],
    }));

    const createdOrderId = response.body.id;

    await request(server)
      .get('/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect([
        {
          "id": 654,
          "status": "PENDING",
          "customer": "users/500",
          "restaurant": "restaurants/123",
          "meals": [
            "meals/111",
            "meals/222",
          ],
        },
        {
          "id": createdOrderId,
          "status": "PENDING",
          "customer": "users/500",
          "restaurant": "restaurants/123",
          "meals": [
            "meals/111",
          ],
        }
      ]);
  });

  it('PUT/654     - should return 405', async () => {
    await request(server)
      .put('/orders/654')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(405);
  });

  it('DELETE/654  - should return 405', async () => {
    await request(server)
      .delete('/orders/654')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(405);
  });
});
