import meals from "../db/meals.js";
import restaurants from "../db/restaurants.js";
import { getId, generateId } from "../utils.js";
import { isCustomer, authenticateToken } from "./auth.js"

function getAll(ctx, next) {
  authenticateToken(ctx, next);

  const restaurantId = parseInt(ctx.query.restaurantId);

  const restaurantMeals = meals.filter(({ restaurant }) => getId(restaurant) === restaurantId ) ;

  ctx.body = restaurantMeals;
};

function get(ctx, next) {
  authenticateToken(ctx, next);

  const mealId = parseInt(ctx.params.id);

  const meal = meals.find(({ id }) => id === mealId ) ;

  if (meal) {
    ctx.body = meal;
  } else {
    ctx.throw(404);
  }
};

function create(ctx, next) {
  authenticateToken(ctx, next);

  if (isCustomer(ctx.user)) {
    ctx.throw(403);
  }

  const name = ctx.request.body.name;
  const restaurantId = getId(ctx.request.body.restaurant);

  const ownerId = parseInt(ctx.user.id);

  const restaurantIndex = restaurants.findIndex(({ id }) => id === restaurantId);

  if (restaurantIndex === -1) {
    ctx.throw(404);
  } else if (getId(restaurants[restaurantIndex].owner) !== ownerId) {
    ctx.throw(403);
  }

  const mealId = generateId();

  const meal = {
    id: mealId,
    name,
    owner: `users/${ownerId}`,
    restaurant: `restaurants/${restaurantId}`,
  }

  meals.push(meal);

  restaurants[restaurantIndex].meals.push(`meals/${mealId}`);

  ctx.status = 201;
  ctx.body = meal;
}

function update(ctx, next) {
  authenticateToken(ctx, next);

  if (isCustomer(ctx.user)) {
    ctx.throw(403);
  }

  const mealId = parseInt(ctx.params.id);
  const ownerId = parseInt(ctx.user.id);

  const index = meals.findIndex(({ id }) => id === mealId);

  if (index === -1) {
    ctx.throw(404);
  } else if (getId(meals[index].owner) !== ownerId) {
    ctx.throw(403);
  } else {
    meals[index] = {
      ...meals[index],
      ...ctx.request.body,
    }

    ctx.body = meals[index];
  }
}

function deleteFn(ctx, next) {
  authenticateToken(ctx, next);

  if (isCustomer(ctx.user)) {
    ctx.throw(403);
  }

  const mealId = parseInt(ctx.params.id);
  const ownerId = parseInt(ctx.user.id);

  const index = meals.findIndex(({ id }) => id === mealId);

  if (index === -1) {
    ctx.throw(404);
  } else if (getId(meals[index].owner) !== ownerId) {
    ctx.throw(403);
  } else {
    const restaurantId = getId(meals[index].restaurant);

    meals.splice(index, 1);

    const restaurantIndex = restaurants.findIndex(({ id }) => id === restaurantId);

    const restaurantMealIndex = restaurants[restaurantIndex].meals.findIndex(id => getId(id) === mealId);

    restaurants[restaurantIndex].meals.splice(restaurantMealIndex, index);

    ctx.status = 200;
  }
}

export default {
  getAll,
  get,
  create,
  update,
  delete: deleteFn,
}
