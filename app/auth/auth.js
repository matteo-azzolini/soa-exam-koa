import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateId } from "../utils.js";
import users from "../../data/users.js";

export function isCustomer(user) {
  return user.role === 'CUSTOMER';
}

export function isOwner(user) {
  return user.role === 'OWNER';
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}

export function authenticateToken(ctx, next) {
  const authHeader = ctx.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) ctx.throw(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {

    if (err) ctx.throw(403);
    ctx.user = user;

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

  const hashedPassword = await bcrypt.hash(ctx.request.body.password, 10);

  const user = {
    id: generateId(),
    role: ctx.request.body.role,
    username: ctx.request.body.username,
    password: hashedPassword,
  };

  users.push(user);

  ctx.status = 201;
}

export async function login(ctx) {
  const user = users.find(user => user.username === ctx.request.body.username);

  if (user == null) {
    ctx.throw(401);
  }

  const validPassword = await bcrypt.compare(ctx.request.body.password, user.password);

  if (!validPassword) {
    ctx.throw(401);
  }

  const jwtUser = {
    id: user.id,
    role: user.role,
  };

  const accessToken = generateAccessToken(jwtUser);

  ctx.status = 202;
  ctx.body = {
    accessToken: accessToken,
  };
}
