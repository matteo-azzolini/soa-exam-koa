import orders from "../../data/orders.js";
import restaurants from "../../data/restaurants.js";
import { getId, generateId } from "../utils/utils.js";

export function getOrdersByCustomer(customerId) {
  return orders.filter(({ customer }) => getId(customer) === customerId);
}

export function getOrdersByOwner(ownerId) {
  const ownedRestaurantsIds = restaurants
      .filter(({ owner }) => getId(owner) === ownerId)
      .map(({ id }) => id);

  return orders.filter(({ restaurant }) => ownedRestaurantsIds.includes(getId(restaurant)));
}

export function findOrderById(orderId) {
  return orders.find(({ id }) => id === orderId);
}

export function createOrder(customerId, restaurantId, meals) {
  const order = {
    id: generateId(),
    status: 'PENDING',
    customer: `users/${customerId}`,
    restaurant: `restaurants/${restaurantId}`,
    meals,
  };

  orders.push(order);

  return order;
}
