import restaurants from "../../data/restaurants.js";
import { getId, generateId } from "../utils.js";

export function hasMeals(restaurant, meals) {
  const mealsIds = meals.map(meal => getId(meal));

  const restaurantMealsIds = restaurant.meals.map(meal => getId(meal));

  return mealsIds.every(id => restaurantMealsIds.includes(id));
}

export function getAllRestaurants() {
  return restaurants;
}

export function findRestaurantById(restaurantId) {
  return restaurants.find(({ id }) => id === restaurantId);
}

export function createRestaurant(ownerId, name) {
  const restaurant = {
    id: generateId(),
    owner: `users/${ownerId}`,
    name,
    meals: [],
  };

  restaurants.push(restaurant);

  return restaurant;
}

export function updateRestaurant(restaurantId, restaurant) {
  const index = restaurants.findIndex(({ id }) => id === restaurantId);

  restaurants[index] = {
    ...restaurants[index],
    ...restaurant,
  }

  return restaurants[index];
}

export function deleteRestaurant(restaurant) {
  const index = restaurants.findIndex(({ id }) => id === restaurant.id);

  restaurants.splice(index, 1);
}
