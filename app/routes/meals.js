import { getId } from "../utils.js";
import { authenticateToken, isOwner } from "./auth.js"
import { findRestaurantById } from '../services/restaurants';
import {
  getMealsByRestaurant,
  findMealById,
  createMeal,
  updateMeal,
  deleteMeal,
} from '../services/meals';

function getAll(ctx, next) {
  authenticateToken(ctx, next);

  const restaurantId = parseInt(ctx.query.restaurantId);

  ctx.body = getMealsByRestaurant(restaurantId);
};

function get(ctx, next) {
  authenticateToken(ctx, next);

  const mealId = parseInt(ctx.params.id);

  const meal = findMealById(mealId);

  if (!meal) {
    ctx.throw(404);
  }

  ctx.body = meal;
};

function create(ctx, next) {
  authenticateToken(ctx, next);

  if (!isOwner(ctx.user)) {
    ctx.throw(403);
  }

  const ownerId = parseInt(ctx.user.id);

  const name = ctx.request.body.name;
  const restaurantId = getId(ctx.request.body.restaurant);

  const restaurant = findRestaurantById(restaurantId);

  if (!restaurant) {
    ctx.throw(404);
  } else if (getId(restaurant.owner) !== ownerId) {
    ctx.throw(403);
  }

  ctx.body = createMeal(ownerId, name, restaurantId);
  ctx.status = 201;
}

function update(ctx, next) {
  authenticateToken(ctx, next);

  if (!isOwner(ctx.user)) {
    ctx.throw(403);
  }

  const ownerId = parseInt(ctx.user.id);

  const mealId = parseInt(ctx.params.id);

  const meal = findMealById(mealId);

  if (!meal) {
    ctx.throw(404);
  } else if (getId(meal.owner) !== ownerId) {
    ctx.throw(403);
  }

  ctx.body = updateMeal(mealId, ctx.request.body);
}

function deleteFn(ctx, next) {
  authenticateToken(ctx, next);

  if (!isOwner(ctx.user)) {
    ctx.throw(403);
  }

  const ownerId = parseInt(ctx.user.id);

  const mealId = parseInt(ctx.params.id);

  const meal = findMealById(mealId);

  if (!meal) {
    ctx.throw(404);
  } else if (getId(meal.owner) !== ownerId) {
    ctx.throw(403);
  }

  deleteMeal(meal);

  ctx.status = 200;
}

export default {
  getAll,
  get,
  create,
  update,
  delete: deleteFn,
}
