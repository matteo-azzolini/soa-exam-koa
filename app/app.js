import koa from "koa";
import koaRouter from "koa-router";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import { getUsers, register, login, authenticateToken } from "./routes/auth.js"
import restaurants from "./routes/restaurants.js"
import meals from "./routes/meals.js"

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

router.get('/', (ctx, next) => {
  authenticateToken(ctx, next);
  ctx.body = posts.filter(post => post.username === ctx.user.username);
});

// TODO
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

export default app;
