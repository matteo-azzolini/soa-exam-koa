import restaurants from "../db/restaurants.js";
import { between } from "../utils.js";
import { authenticateToken } from "./auth.js"

// utils
function getId(url) {
  const stringId = url.substring(url.lastIndexOf('/') + 1);
  const id = Number(stringId);
  return id;
}

function getAll(ctx, next) {
  authenticateToken(ctx, next);

  const ownerId = ctx.user.id;

  const restaurant = restaurants.filter(restaurant => ownerId === getId(restaurant.owner));

  ctx.body = restaurant;
};

function get(ctx, next) {
  authenticateToken(ctx, next);

  const restaurantId = parseInt(ctx.params.id);
  const ownerId = parseInt(ctx.user.id);

  const restaurant = restaurants.find(({ id, owner }) => {
    return id === restaurantId && getId(owner) === ownerId
  }) ;

  if (restaurant) {
    ctx.body = restaurant;
  } else {
    ctx.throw(404);
  }
};

function create(ctx, next) {
  authenticateToken(ctx, next);

  const ownerId = parseInt(ctx.user.id);

  const name = ctx.request.body.name;

  const restaurant = {
    id: between(100, 999),
    owner: `user/${ownerId}`,
    name,
    meals: [],
  };

  restaurants.push(restaurant);

  ctx.body = restaurant;
}

function update(ctx, next) {
  authenticateToken(ctx, next);

  const restaurantId = parseInt(ctx.params.id);
  const ownerId = parseInt(ctx.user.id);

  const index = restaurants.findIndex(({ id, owner }) => {
    return id === restaurantId && getId(owner) === ownerId
  }) ;

  if (index !== -1) {
    restaurants[index] = {
      ...restaurants[index],
      ...ctx.request.body,
    }

    ctx.body = restaurants[index];
  } else {
    ctx.throw(404);
  }
}

export default {
  getAll,
  get,
  create,
  update,
}
