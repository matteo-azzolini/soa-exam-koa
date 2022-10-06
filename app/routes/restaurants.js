import { getId } from "../utils/utils.js";
import { authenticateToken, isOwner } from "../auth/auth.js"
import {
  getAllRestaurants,
  findRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../services/restaurants.js';

function getAll(ctx, next) {
  authenticateToken(ctx, next);

  ctx.body = getAllRestaurants();
};

function get(ctx, next) {
  authenticateToken(ctx, next);

  const restaurantId = parseInt(ctx.params.id);

  const restaurant = findRestaurantById(restaurantId);

  if (!restaurant) {
    ctx.throw(404);
  }

  ctx.body = restaurant;
};

function create(ctx, next) {
  authenticateToken(ctx, next);

  if (!isOwner(ctx.user)) {
    ctx.throw(403);
  }

  const ownerId = parseInt(ctx.user.id);

  const name = ctx.request.body.name;

  const restaurant = createRestaurant(ownerId, name);

  ctx.status = 201;
  ctx.body = restaurant;
}

function update(ctx, next) {
  authenticateToken(ctx, next);

  if (!isOwner(ctx.user)) {
    ctx.throw(403);
  }

  const ownerId = parseInt(ctx.user.id);

  const restaurantId = parseInt(ctx.params.id);

  const restaurant = findRestaurantById(restaurantId);

  if (!restaurant) {
    ctx.throw(404);
  } else if (getId(restaurant.owner) !== ownerId) {
    ctx.throw(403);
  }

  ctx.body = updateRestaurant(restaurantId, ctx.request.body)
}

function deleteFn(ctx, next) {
  authenticateToken(ctx, next);

  if (!isOwner(ctx.user)) {
    ctx.throw(403);
  }

  const ownerId = parseInt(ctx.user.id);

  const restaurantId = parseInt(ctx.params.id);  

  const restaurant = findRestaurantById(restaurantId);

  if (!restaurant) {
    ctx.throw(404);
  } else if (getId(restaurant.owner) !== ownerId) {
    ctx.throw(403);
  }

  deleteRestaurant(restaurant);

  ctx.status = 200;
}

export default {
  getAll,
  get,
  create,
  update,
  delete: deleteFn,
}
