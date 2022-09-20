import koa from "koa";
import koaRouter from "koa-router";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import fs from "fs";
import http from "http";
import https from "https";
import { getUsers, register, login, authenticateToken } from "./routes/auth.js"
import restaurants from "./routes/restaurants.js"

//
const posts = [
  {
    username: 'Kyle',
    title: 'Post 1'
  },
  {
    username: 'Jim',
    title: 'Post 2'
  }
]
//

const app = new koa();
const router = new koaRouter();

app.use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

router.get('/', (ctx, next) => {
  authenticateToken(ctx, next);
  ctx.body = posts.filter(post => post.username === ctx.user.username);
});

router.get('/users', getUsers);

router.post('/auth/register', register);
router.post('/auth/login', login);

router.get('/restaurants',      restaurants.getAll);
router.get('/restaurants/:id',  restaurants.get);
router.post('/restaurants',     restaurants.create);

const options = {
  key: fs.readFileSync('cert/key.pem'),
  cert: fs.readFileSync('cert/cert.pem')
};

http.createServer(app.callback()).listen(8080);
https.createServer(options, app.callback()).listen(8443);
