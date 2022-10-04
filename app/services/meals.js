import meals from "../../data/meals.js";
import restaurants from "../../data/restaurants.js";
import { getId, generateId } from "../utils.js";

export function getMealsByRestaurant(restaurantId) {
  return meals.filter(({ restaurant }) => getId(restaurant) === restaurantId);
}

export function findMealById(mealId) {
  return meals.find(({ id }) => id === mealId);
}

export function createMeal(ownerId, name, restaurantId) {
  const meal = {
    id: generateId(),
    name,
    owner: `users/${ownerId}`,
    restaurant: `restaurants/${restaurantId}`,
  }

  meals.push(meal);

  const restaurantIndex = restaurants.findIndex(({ id }) => id === restaurantId);

  restaurants[restaurantIndex].meals.push(`meals/${meal.id}`);

  return meal;
}

export function updateMeal(mealId, meal) {
  const index = meals.findIndex(({ id }) => id === mealId);

  meals[index] = {
    ...meals[index],
    ...meal,
  }

  return meals[index];
}

export function deleteMeal(meal) {
  const mealIndex = meals.findIndex(({ id }) => id === meal.id);

  meals.splice(mealIndex, 1);

  const restaurantId = getId(meal.restaurant);

  const restaurantIndex = restaurants.findIndex(({ id }) => id === restaurantId);

  const restaurantMealIndex = restaurants[restaurantIndex].meals.findIndex(id => getId(id) === meal.id);

  restaurants[restaurantIndex].meals.splice(restaurantMealIndex, 1);
}
