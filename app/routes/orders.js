import orders from "../../db/orders.js";
import restaurants from "../../db/restaurants.js";
import { getId, generateId } from "../utils.js";
import { isCustomer, authenticateToken, isOwner } from "./auth.js"

function getAll(ctx, next) {
  authenticateToken(ctx, next);

  const userId = parseInt(ctx.user.id);

  let ownedOrders;

  if (isCustomer(ctx.user)) {
    ownedOrders = orders.filter(({ customer }) => getId(customer) === userId);
  } else if (isOwner(ctx.user)) {
    const ownedRestaurantsIds = restaurants
      .filter(({ owner }) => getId(owner) === userId)
      .map(({ id }) => id);

    ownedOrders = orders.filter(({ restaurant }) => ownedRestaurantsIds.includes(getId(restaurant)));
  } else {
    ctx.throw(403);
  }

  ctx.body = ownedOrders;
};

function get(ctx, next) {
  authenticateToken(ctx, next);

  const userId = parseInt(ctx.user.id);
  const orderId = parseInt(ctx.params.id);

  const order = orders.find(({ id }) => id === orderId ) ;

  if (!order) {
    ctx.throw(404);
  }

  if (isCustomer(ctx.user) && getId(order.customer) === userId) {
    ctx.body = order;
  } else if (isOwner(ctx.user)) {
    const restaurantId = getId(order.restaurant)

    const restaurant = restaurants.find(({ id }) => id === restaurantId ) ;

    if (getId(restaurant.owner) === userId) {
      ctx.body = order;
    } else {
      ctx.throw(403);
    }
  } else {
    ctx.throw(403);
  }
};

function create(ctx, next) {
  authenticateToken(ctx, next);

  if (!isCustomer(ctx.user)) {
    ctx.throw(403);
  }

  const customerId = parseInt(ctx.user.id);

  const restaurantId = getId(ctx.request.body.restaurant);

  const mealsIds = ctx.request.body.meals.map(meal => getId(meal));

  const restaurant = restaurants.find(({ id }) => id === restaurantId);

  if (!restaurant) {
    ctx.throw(400, 'Restaurant not found');
  }

  const restaurantMealsIds = restaurant.meals.map(meal => getId(meal));

  if (!mealsIds.every(id => restaurantMealsIds.includes(id))) {
    ctx.throw(400, 'Meal not found');
  }

  const order = {
    id: generateId(),
    status: 'PENDING',
    customer: `users/${customerId}`,
    restaurant: `restaurants/${restaurantId}`,
    meals: ctx.request.body.meals,
  };

  orders.push(order);

  ctx.status = 201;
  ctx.body = order;
}

export default {
  getAll,
  get,
  create,
}
