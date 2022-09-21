import restaurants from "../db/restaurants.js";
import { getId, generateId } from "../utils.js";
import { isCustomer, authenticateToken } from "./auth.js"

function getAll(ctx, next) {
  authenticateToken(ctx, next);

  ctx.body = restaurants;
};

function get(ctx, next) {
  authenticateToken(ctx, next);

  const restaurantId = parseInt(ctx.params.id);
  const ownerId = parseInt(ctx.user.id);

  const restaurant = restaurants.find(({ id }) => id === restaurantId ) ;

  if (restaurant) {
    ctx.body = restaurant;
  } else {
    ctx.throw(404);
  }
};

function create(ctx, next) {
  authenticateToken(ctx, next);

  if (isCustomer(ctx.user)) {
    ctx.throw(403);
  }

  const ownerId = parseInt(ctx.user.id);

  const name = ctx.request.body.name;

  const restaurant = {
    id: generateId(100, 999),
    owner: `user/${ownerId}`,
    name,
    meals: [],
  };

  restaurants.push(restaurant);

  ctx.status = 201;
  ctx.body = restaurant;
}

function update(ctx, next) {
  authenticateToken(ctx, next);

  if (isCustomer(ctx.user)) {
    ctx.throw(403);
  }

  const restaurantId = parseInt(ctx.params.id);
  const ownerId = parseInt(ctx.user.id);

  const index = restaurants.findIndex(({ id }) => id === restaurantId);

  if (index === -1) {
    ctx.throw(404);
  } else if (getId(restaurants[index].owner) !== ownerId) {
    ctx.throw(403);
  } else {
    restaurants[index] = {
      ...restaurants[index],
      ...ctx.request.body,
    }

    ctx.body = restaurants[index];
  }
}

export default {
  getAll,
  get,
  create,
  update,
}
