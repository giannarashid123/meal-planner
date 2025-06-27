const searchBtn = document.getElementById('searchBtn');
const ingredientInput = document.getElementById('ingredientInput');
const mealResults = document.getElementById('mealResults');
const mealPlanGrid = document.getElementById('mealPlanGrid');
const shoppingListSection = document.getElementById('shoppingList');
const shoppingListContent = document.getElementById('shoppingListContent');

// Track selected weekly meals
let weeklyMeals = [];

// SEARCH MEALS
searchBtn.addEventListener('click', () => {
  const ingredient = ingredientInput.value.trim();
  if (ingredient) {
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
      .then(res => res.json())
      .then(data => displayMeals(data.meals));
  }
});

// DISPLAY MEAL CARDS
function displayMeals(meals) {
  mealResults.innerHTML = '';
  if (!meals) {
    mealResults.innerHTML = '<p>No meals found.</p>';
    return;
  }

  meals.forEach(meal => {
    const mealCard = document.createElement('div');
    mealCard.className = 'day-card';

    mealCard.innerHTML = `
      <h3>${meal.strMeal}</h3>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
      <div class="meal-buttons">
        <button onclick="addToPlan('${meal.idMeal}')">Add to Weekly Plan</button>
        <button onclick="viewMealDetails('${meal.idMeal}', this)">View Details</button>
      </div>
      <div class="meal-details" style="display: none;"></div>
    `;

    mealResults.appendChild(mealCard);
  });
}

// VIEW INGREDIENTS & INSTRUCTIONS
function viewMealDetails(mealId, buttonElement) {
  const mealCard = buttonElement.closest('.day-card');
  const detailsContainer = mealCard.querySelector('.meal-details');

  if (detailsContainer.style.display === 'block') {
    detailsContainer.style.display = 'none';
    buttonElement.textContent = 'View Details';
    return;
  }

  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
    .then(res => res.json())
    .then(data => {
      const meal = data.meals[0];
      const ingredients = [];

      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
          ingredients.push(`<li>${ingredient} - ${measure}</li>`);
        }
      }

      detailsContainer.innerHTML = `
        <h4>Ingredients:</h4>
        <ul>${ingredients.join('')}</ul>
        <p><strong>Instructions:</strong> ${meal.strInstructions}</p>
      `;
      detailsContainer.style.display = 'block';
      buttonElement.textContent = 'Hide Details';
    });
}

// ADD MEAL TO PLAN
function addToPlan(mealId) {
  if (weeklyMeals.length >= 7) {
    alert("You can only plan 7 meals per week.");
    return;
  }

  if (weeklyMeals.find(meal => meal.idMeal === mealId)) {
    alert("This meal is already added.");
    return;
  }

  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
    .then(res => res.json())
    .then(data => {
      const meal = data.meals[0];
      weeklyMeals.push(meal);
      renderWeeklyPlan();
    });
}

// REMOVE FROM PLAN
function removeFromPlan(mealId) {
  weeklyMeals = weeklyMeals.filter(meal => meal.idMeal !== mealId);
  renderWeeklyPlan();
}

// RENDER WEEKLY PLAN
function renderWeeklyPlan() {
  mealPlanGrid.innerHTML = '';
  weeklyMeals.forEach((meal, index) => {
    const card = document.createElement('div');
    card.className = 'day-card';

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(`<li>${ingredient} - ${measure}</li>`);
      }
    }

    card.innerHTML = `
      <h3>Day ${index + 1}: ${meal.strMeal}</h3>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
      <ul>${ingredients.join('')}</ul>
      <button onclick="removeFromPlan('${meal.idMeal}')">Remove</button>
    `;
    mealPlanGrid.appendChild(card);
  });
}

// GENERATE SHOPPING LIST
function generateShoppingList() {
  const allIngredients = {};

  weeklyMeals.forEach(meal => {
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim()) {
        if (!allIngredients[ingredient]) {
          allIngredients[ingredient] = measure;
        } else {
          allIngredients[ingredient] += ` + ${measure}`;
        }
      }
    }
  });

  // Format nicely in HTML
  shoppingListContent.innerHTML = `
    <h3>🛒 Shopping List</h3>
    <ul>
      ${Object.entries(allIngredients)
        .map(([ingredient, measure]) => `<li>${ingredient}: ${measure}</li>`)
        .join('')}
    </ul>
  `;

  shoppingListSection.style.display = 'block';
}
