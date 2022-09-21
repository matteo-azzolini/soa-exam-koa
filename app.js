import koa from "koa";
import koaRouter from "koa-router";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import fs from "fs";
import http from "http";
import https from "https";
import { getUsers, register, login, authenticateToken } from "./routes/auth.js"
import restaurants from "./routes/restaurants.js"

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

router.get('/restaurants',      restaurants.getAll);
router.get('/restaurants/:id',  restaurants.get);
router.post('/restaurants',     restaurants.create);
router.put('/restaurants/:id',  restaurants.update);

const options = {
  key: fs.readFileSync('cert/key.pem'),
  cert: fs.readFileSync('cert/cert.pem')
};

const server = isJest
  ? http.createServer(app.callback()).listen(8080)
  : https.createServer(options, app.callback()).listen(8443);

export default server;
