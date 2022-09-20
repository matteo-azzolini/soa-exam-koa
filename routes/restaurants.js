import restaurants from "../db/restaurants.json" assert { type: "json" };
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

  ctx.body = restaurant;
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

export default {
  getAll,
  get,
  create,
}
