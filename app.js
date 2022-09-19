import koa from "koa";
import koaRouter from "koa-router";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";
import http from "http";
import https from "https";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config();

//
const users = [];
//

const app = new koa();
const router = new koaRouter();

app.use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  ;

router.get('/', (ctx) => {
  ctx.body = {
    name: 'lui',
    author: 'cane',
  };
});

router.get('/restaurants/:id', (ctx) => {
  ctx.body = {
    name: ctx.params.id,
  };
});

// AUTH

router.get('/users', (ctx) => {
  ctx.body = users;
});

router.post('/auth/register', async (ctx) => {
  try {
    const hashedPassword = await bcrypt.hash(ctx.request.body.password, 10);

    const user = {
      name: ctx.request.body.name,
      password: hashedPassword,
    };

    users.push(user);

    ctx.status = 201;
  } catch (err) {
    console.error(err);
    ctx.throw(500);
  }
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

router.post('/auth/login', async (ctx) => {
  const user = users.find(user => user.name === ctx.request.body.name);

  if (user == null) {
    ctx.throw(400, 'Cannot find user');
  }

  try {
    if(await bcrypt.compare(ctx.request.body.password, user.password)) {
      const username = ctx.request.body.username
      const user = {
        name: username,
      };
    
      const accessToken = generateAccessToken(user);

      ctx.status = 202;
      ctx.body = {
        accessToken: accessToken,
      };
    } else {
      ctx.throw(401);
    }
  } catch(err) {
    console.error(err);
    ctx.throw(500);
  }
})

//

const options = {
  key: fs.readFileSync('cert/key.pem'),
  cert: fs.readFileSync('cert/cert.pem')
};

http.createServer(app.callback()).listen(8080);
https.createServer(options, app.callback()).listen(8443);
