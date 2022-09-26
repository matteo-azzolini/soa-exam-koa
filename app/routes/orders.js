import { getId } from "../utils.js";
import { isCustomer, authenticateToken, isOwner } from "./auth.js"
import {
  hasMeals,
  findRestaurantById,
} from '../services/restaurants';
import {
  getOrdersByCustomer,
  getOrdersByOwner,
  findOrderById,
  createOrder,
} from '../services/orders'

function getAll(ctx, next) {
  authenticateToken(ctx, next);

  const userId = parseInt(ctx.user.id);

  if (isCustomer(ctx.user)) {
    return ctx.body = getOrdersByCustomer(userId);
  } else if (isOwner(ctx.user)) {
    return ctx.body = getOrdersByOwner(userId);
  }

  ctx.throw(403);
};

function get(ctx, next) {
  authenticateToken(ctx, next);

  const userId = parseInt(ctx.user.id);

  const orderId = parseInt(ctx.params.id);

  const order = findOrderById(orderId);

  if (!order) {
    ctx.throw(404);
  }

  const isCustomerOrder = isCustomer(ctx.user) && getId(order.customer) === userId;

  if (isCustomerOrder) {
    return ctx.body = order;
  } else if (isOwner(ctx.user)) {
    const restaurantId = getId(order.restaurant)

    const restaurant = findRestaurantById(restaurantId);

    const isRestaurantOwner = getId(restaurant.owner) === userId;

    if (isRestaurantOwner) {
      return ctx.body = order;
    }
  }

  ctx.throw(403);
};

function create(ctx, next) {
  authenticateToken(ctx, next);

  if (!isCustomer(ctx.user)) {
    ctx.throw(403);
  }

  const customerId = parseInt(ctx.user.id);

  const restaurantId = getId(ctx.request.body.restaurant);
  const meals = ctx.request.body.meals;

  const restaurant = findRestaurantById(restaurantId);

  if (!restaurant) {
    ctx.throw(400, 'Restaurant not found');
  } else if (!hasMeals(restaurant, meals)) {
    ctx.throw(400, 'Meal not found');
  }

  ctx.body = createOrder(customerId, restaurantId, meals);
  ctx.status = 201;
}

export default {
  getAll,
  get,
  create,
}
