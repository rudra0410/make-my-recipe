// Recipe related functionality for MakeMyRecipe Application

document.addEventListener('DOMContentLoaded', function() {
    // Ingredient input functionality
    const ingredientForm = document.getElementById('ingredientForm');
    
    if (ingredientForm) {
        const ingredientInput = document.getElementById('ingredientInput');
        const addIngredientBtn = document.getElementById('addIngredient');
        const ingredientsList = document.getElementById('ingredientsList');
        const suggestBtn = document.getElementById('suggestRecipe');
        const clearBtn = document.getElementById('clearForm');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const recipeResult = document.getElementById('recipeResult');
        
        // Array to store ingredients
        let ingredients = [];
        
        // Add ingredient function
        function addIngredient() {
            const ingredient = ingredientInput.value.trim();
            
            if (!ingredient) {
                showError('Please enter an ingredient');
                return;
            }
            
            // Check if ingredient already exists
            if (ingredients.includes(ingredient.toLowerCase())) {
                showError('This ingredient is already added');
                ingredientInput.value = '';
                return;
            }
            
            // Add to array
            ingredients.push(ingredient.toLowerCase());
            
            // Create tag
            const tag = document.createElement('div');
            tag.className = 'ingredient-tag';
            tag.innerHTML = `
                ${ingredient}
                <span class="remove-tag" data-ingredient="${ingredient}">×</span>
            `;
            
            ingredientsList.appendChild(tag);
            ingredientInput.value = '';
            
            // Update the submit button state
            suggestBtn.disabled = ingredients.length === 0;
        }
        
        // Add ingredient on button click
        if (addIngredientBtn) {
            addIngredientBtn.addEventListener('click', function(e) {
                e.preventDefault();
                addIngredient();
            });
        }
        
        // Add ingredient on Enter key
        if (ingredientInput) {
            ingredientInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addIngredient();
                }
            });
        }
        
        // Remove ingredient when tag is clicked
        if (ingredientsList) {
            ingredientsList.addEventListener('click', function(e) {
                if (e.target.classList.contains('remove-tag')) {
                    const ingredient = e.target.dataset.ingredient.toLowerCase();
                    
                    // Remove from array
                    const index = ingredients.indexOf(ingredient);
                    if (index > -1) {
                        ingredients.splice(index, 1);
                    }
                    
                    // Remove tag from DOM
                    e.target.parentElement.remove();
                    
                    // Update the submit button state
                    suggestBtn.disabled = ingredients.length === 0;
                }
            });
        }
        
        // Clear form
        if (clearBtn) {
            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                ingredients = [];
                ingredientsList.innerHTML = '';
                ingredientInput.value = '';
                recipeResult.style.display = 'none';
                suggestBtn.disabled = true;
            });
        }
        
        // Try Another Recipe button
        const tryAnotherRecipeBtn = document.getElementById('tryAnotherRecipe');
        if (tryAnotherRecipeBtn) {
            tryAnotherRecipeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Hide the recipe result
                recipeResult.style.display = 'none';
                
                // Scroll back to the ingredient form
                ingredientForm.scrollIntoView({ behavior: 'smooth' });
                
                // Clear the form
                ingredients = [];
                ingredientsList.innerHTML = '';
                ingredientInput.value = '';
                suggestBtn.disabled = true;
            });
        }
        
        // Suggest recipe
        if (suggestBtn) {
            suggestBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (ingredients.length === 0) {
                    showError('Please add at least one ingredient');
                    return;
                }
                
                // Show loading spinner
                loadingSpinner.style.display = 'block';
                recipeResult.style.display = 'none';
                
                // Make API request
                fetch('/suggest-recipe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ingredients }),
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    // Hide loading spinner
                    loadingSpinner.style.display = 'none';
                    
                    // Check if there's an error
                    if (data.error) {
                        showError(data.error);
                        return;
                    }
                    
                    // Display recipe result
                    displayRecipe(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                    loadingSpinner.style.display = 'none';
                    showError('There was an error getting your recipe. Please try again.');
                });
            });
        }
        
        // Display recipe function
        function displayRecipe(recipe) {
            if (!recipeResult) return;
            
            // Set recipe title
            const recipeTitle = document.querySelector('.recipe-title');
            if (recipeTitle) recipeTitle.textContent = recipe.recipe_name;
            
            // Set recipe meta info
            const cookingTime = document.querySelector('.cooking-time');
            if (cookingTime) cookingTime.textContent = recipe.cooking_time || '30 mins';
            
            const cuisineType = document.querySelector('.cuisine-type');
            if (cuisineType) cuisineType.textContent = recipe.cuisine_type || 'Indian';
            
            const mealType = document.querySelector('.meal-type');
            if (mealType) mealType.textContent = recipe.meal_type || 'Main Course';
            
            // Set veg/non-veg icon
            const vegIcon = document.querySelector('.veg-icon');
            if (vegIcon) {
                if (recipe.is_vegetarian) {
                    vegIcon.innerHTML = '<i class="fas fa-leaf" style="color: green;"></i>';
                    vegIcon.title = 'Vegetarian';
                } else {
                    vegIcon.innerHTML = '<i class="fas fa-drumstick-bite" style="color: brown;"></i>';
                    vegIcon.title = 'Non-Vegetarian';
                }
            }
            
            // Set ingredients list
            const ingredientList = document.querySelector('.recipe-ingredients ul');
            if (ingredientList) {
                ingredientList.innerHTML = '';
                
                if (recipe.ingredients_required && recipe.ingredients_required.length > 0) {
                    recipe.ingredients_required.forEach(ingredient => {
                        const li = document.createElement('li');
                        li.className = 'ingredient-item';
                        li.textContent = ingredient;
                        ingredientList.appendChild(li);
                    });
                }
            }
            
            // Set missing ingredients if any
            const missingIngredients = document.querySelector('.missing-ingredients');
            if (missingIngredients) {
                if (recipe.missing_ingredients && recipe.missing_ingredients.length > 0) {
                    missingIngredients.style.display = 'block';
                    
                    const list = missingIngredients.querySelector('ul');
                    if (list) {
                        list.innerHTML = '';
                        
                        recipe.missing_ingredients.forEach(ingredient => {
                            const li = document.createElement('li');
                            li.textContent = ingredient;
                            list.appendChild(li);
                        });
                    }
                } else {
                    missingIngredients.style.display = 'none';
                }
            }
            
            // Set instructions
            const instructionsList = document.querySelector('.recipe-instructions ol');
            if (instructionsList) {
                instructionsList.innerHTML = '';
                
                if (recipe.instructions && recipe.instructions.length > 0) {
                    recipe.instructions.forEach(step => {
                        const li = document.createElement('li');
                        li.className = 'instruction-step';
                        
                        // Clean any markdown formatting that might be in the instructions
                        // Remove markdown number prefixes like "1. " or "1) " if present
                        const cleanStep = typeof step === 'string' ? step.replace(/^\d+[\.\)]\s*/, '') : step;
                        li.textContent = cleanStep;
                        
                        instructionsList.appendChild(li);
                    });
                }
            }
            
            // Show the recipe result
            recipeResult.style.display = 'block';
            
            // Scroll to recipe result
            recipeResult.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Show error function
        function showError(message) {
            const errorElement = document.getElementById('ingredientError');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
                
                setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 3000);
            }
        }
        
        // Surprise Me button functionality
        const surpriseBtn = document.getElementById('surpriseMe');
        
        if (surpriseBtn) {
            surpriseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Common Indian ingredients for a random recipe
                const commonIngredients = [
                    'onion', 'tomato', 'ginger', 'garlic', 'potato', 'rice',
                    'chickpeas', 'lentils', 'paneer', 'chicken', 'eggs',
                    'cumin', 'coriander', 'turmeric', 'chili'
                ];
                
                // Get 3-5 random ingredients
                ingredients = [];
                const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 ingredients
                
                while (ingredients.length < count) {
                    const randomIndex = Math.floor(Math.random() * commonIngredients.length);
                    const ingredient = commonIngredients[randomIndex];
                    
                    if (!ingredients.includes(ingredient)) {
                        ingredients.push(ingredient);
                    }
                }
                
                // Clear previous list and update with random ingredients
                ingredientsList.innerHTML = '';
                
                ingredients.forEach(ingredient => {
                    const tag = document.createElement('div');
                    tag.className = 'ingredient-tag';
                    tag.innerHTML = `
                        ${ingredient}
                        <span class="remove-tag" data-ingredient="${ingredient}">×</span>
                    `;
                    
                    ingredientsList.appendChild(tag);
                });
                
                // Enable suggest button
                suggestBtn.disabled = false;
                
                // Auto-click the suggest button
                suggestBtn.click();
            });
        }
    }
});
