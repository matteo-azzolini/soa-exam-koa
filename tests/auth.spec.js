import request from 'supertest';
import app from '../app/app.js';

let server;

beforeAll(() => { server = app.listen(process.env.JEST_PORT); });

afterAll(() => { server.close(); });

describe('/register', () => {
  it('POST        - should return 201', async () => {
    await request(server)
      .post('/register')
      .send({
        "username": "nuovo cliente",
        "password": "password",
        "role": "CUSTOMER"
      })
      .expect(201);
  });

  it('POST        - should return 400', async () => {
    const newOwner = {
      "username": "nuovo owner",
      "password": "password",
      "role": "OWNER"
    };

    await request(server)
      .post('/register')
      .send(newOwner)
      .expect(201);
  
    await request(server)
      .post('/register')
      .send(newOwner)
      .expect(400, 'User already exists');
  });
});

describe('/login', () => {
  it('POST        - should return 201', async () => {
    const response = await request(server)
      .post('/login')
      .send({
        "username": "nuovo cliente",
        "password": "password",
      })
      .expect(202);

    expect(response.body.accessToken).toBeTruthy();
  });

  it('POST        - should return 401', async () => {
    await request(server)
      .post('/login')
      .send({
        "username": "WRONG USERNAME",
        "password": "password",
      })
      .expect(401);

    await request(server)
      .post('/login')
      .send({
        "username": "nuovo cliente",
        "password": "WRONG_PASSWORD",
      })
      .expect(401);
  });
});
