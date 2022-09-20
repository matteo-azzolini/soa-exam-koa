import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as dotenv from 'dotenv';
import { between } from "../utils.js";
import users from "../db/users.json" assert { type: "json" };

dotenv.config();

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
}

export function authenticateToken(ctx, next) {
  const authHeader = ctx.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) ctx.throw(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {

    if (err) ctx.throw(403);
    ctx.user = user;

    console.log('auth', user);

    next();
  })
}

// TODO
export function getUsers(ctx) {
  ctx.body = users;
};

export async function register(ctx) {
  const alreadyExists = users.find(user => user.username === ctx.request.body.username);

  if (alreadyExists) {
    ctx.throw(400, 'User already exists');
  }

  try {
    const hashedPassword = await bcrypt.hash(ctx.request.body.password, 10);

    const user = {
      id: between(100, 999),
      username: ctx.request.body.username,
      password: hashedPassword,
    };

    users.push(user);

    ctx.status = 201;
  } catch (err) {
    console.error(err);
    ctx.throw(500);
  }
}

export async function login(ctx) {
  const user = users.find(user => user.username === ctx.request.body.username);

  if (user == null) {
    ctx.throw(400, 'Cannot find user');
  }

  try {
    if(await bcrypt.compare(ctx.request.body.password, user.password)) {
      const jwtUser = {
        id: user.id,
      };
    
      const accessToken = generateAccessToken(jwtUser);

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
}
