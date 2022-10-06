import koa from "koa";
import koaRouter from "koa-router";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import dotenv from 'dotenv';
import { getUsers, register, login } from "./auth/auth.js"
import restaurants from "./routes/restaurants.js"
import meals from "./routes/meals.js"
import orders from "./routes/orders.js"

dotenv.config();

const isJest = process.env.JEST_WORKER_ID !== undefined;

const app = new koa();
const router = new koaRouter();

if (!isJest) {
  app.use(logger())
}

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

// Debug only
router.get('/users', getUsers);

router.post('/register', register);
router.post('/login', login);

router.get('/restaurants',        restaurants.getAll);
router.get('/restaurants/:id',    restaurants.get);
router.post('/restaurants',       restaurants.create);
router.put('/restaurants/:id',    restaurants.update);
router.delete('/restaurants/:id', restaurants.delete);

router.get('/meals',              meals.getAll);
router.get('/meals/:id',          meals.get);
router.post('/meals',             meals.create);
router.put('/meals/:id',          meals.update);
router.delete('/meals/:id',       meals.delete);

router.get('/orders',             orders.getAll);
router.get('/orders/:id',         orders.get);
router.post('/orders',            orders.create);

export default app;
