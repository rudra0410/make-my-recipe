// Main JavaScript file for MakeMyRecipe Application

document.addEventListener('DOMContentLoaded', function() {
    // Navbar toggle for mobile
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (navbarToggle && navbarMenu) {
        navbarToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
        });
    }
    
    // Scroll reveal animation
    function revealOnScroll() {
        const elements = document.querySelectorAll('.reveal');
        
        elements.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Call on page load
    
    // Bookmark functionality
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    
    if (bookmarkButtons) {
        bookmarkButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
                
                // Get the recipe ID
                const recipeCard = this.closest('.recipe-card');
                const recipeId = recipeCard ? recipeCard.dataset.id : null;
                
                if (recipeId) {
                    // Store in local storage for persistence
                    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
                    
                    if (this.classList.contains('active')) {
                        // Add to bookmarks if not already there
                        if (!bookmarks.includes(recipeId)) {
                            bookmarks.push(recipeId);
                            showNotification('Recipe bookmarked!');
                        }
                    } else {
                        // Remove from bookmarks
                        const index = bookmarks.indexOf(recipeId);
                        if (index > -1) {
                            bookmarks.splice(index, 1);
                            showNotification('Recipe removed from bookmarks.');
                        }
                    }
                    
                    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                }
            });
        });
        
        // Set active state for bookmarked recipes
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        
        bookmarkButtons.forEach(btn => {
            const recipeCard = btn.closest('.recipe-card');
            const recipeId = recipeCard ? recipeCard.dataset.id : null;
            
            if (recipeId && bookmarks.includes(recipeId)) {
                btn.classList.add('active');
            }
        });
    }
    
    // Recipe modal functionality
    const recipeCards = document.querySelectorAll('.view-recipe');
    const modal = document.querySelector('.modal');
    const closeModal = document.querySelector('.close-modal');
    
    if (recipeCards && modal) {
        recipeCards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                
                const recipeCard = this.closest('.recipe-card');
                if (!recipeCard) return;
                
                const recipeId = recipeCard.dataset.id;
                const recipeName = recipeCard.querySelector('.recipe-card-title').textContent;
                const recipeTime = recipeCard.querySelector('.cooking-time').textContent;
                const recipeImgSrc = recipeCard.querySelector('img').src;
                
                // Fill modal with recipe data
                document.querySelector('.modal-recipe-title').textContent = recipeName;
                document.querySelector('.modal-cooking-time').textContent = recipeTime;
                document.querySelector('.modal-recipe-image img').src = recipeImgSrc;
                
                // Add sample data for the modal demonstration
                // In a real app, this would come from an API call using the recipeId
                populateModalContent(recipeId);
                
                // Open modal
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
            });
        });
        
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Restore scrolling
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Function to populate recipe modal content
    function populateModalContent(recipeId) {
        // Sample recipe data - in a real app this would come from an API
        const recipeData = getRecipeDataById(recipeId);
        
        const ingredientsList = document.querySelector('.modal-recipe-content ul');
        const instructionsList = document.querySelector('.modal-recipe-content ol');
        
        // Clear existing content
        if (ingredientsList) ingredientsList.innerHTML = '';
        if (instructionsList) instructionsList.innerHTML = '';
        
        // Populate ingredients
        if (recipeData.ingredients && ingredientsList) {
            recipeData.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.textContent = ingredient;
                ingredientsList.appendChild(li);
            });
        }
        
        // Populate instructions
        if (recipeData.instructions && instructionsList) {
            recipeData.instructions.forEach(step => {
                const li = document.createElement('li');
                // Clean any markdown formatting that might be in the instructions
                const cleanStep = typeof step === 'string' ? step.replace(/^\d+[\.\)]\s*/, '') : step;
                li.textContent = cleanStep;
                instructionsList.appendChild(li);
            });
        }
    }
    
    // Helper function to get recipe data based on ID
    function getRecipeDataById(recipeId) {
        // Sample recipes - in a real app, this would come from an API
        const recipes = {
            "1": {
                ingredients: [
                    "2 cups paneer, cubed",
                    "1 large onion, finely chopped",
                    "2 tomatoes, pureed",
                    "2 tbsp butter",
                    "1 tbsp ginger-garlic paste",
                    "1 tsp red chili powder",
                    "1 tsp coriander powder",
                    "1/2 tsp garam masala",
                    "1/4 cup cream",
                    "Salt to taste"
                ],
                instructions: [
                    "Heat butter in a pan, add onions and sauté until golden brown.",
                    "Add ginger-garlic paste and sauté for a minute.",
                    "Add tomato puree, red chili powder, coriander powder, and salt. Cook until oil separates.",
                    "Add paneer cubes and cook for 5 minutes.",
                    "Add cream and garam masala. Simmer for 2-3 minutes.",
                    "Garnish with coriander leaves and serve hot with naan or rice."
                ]
            },
            "2": {
                ingredients: [
                    "2 cups rice flour",
                    "1 cup urad dal, soaked and ground",
                    "Water as needed",
                    "Salt to taste",
                    "Oil for cooking",
                    "2 potatoes, boiled and mashed",
                    "1 onion, finely chopped",
                    "1 tsp mustard seeds",
                    "1 tsp cumin seeds",
                    "Curry leaves"
                ],
                instructions: [
                    "Mix rice flour and urad dal paste. Add water and salt to make a batter. Ferment overnight.",
                    "For potato filling, heat oil and add mustard seeds, cumin seeds, and curry leaves.",
                    "Add chopped onions and sauté until golden brown.",
                    "Add mashed potatoes, salt, and spices. Mix well.",
                    "Heat a flat pan, pour a ladle of batter and spread in a circular motion.",
                    "Drizzle oil around the edges, cook until golden brown.",
                    "Place potato filling in the center, fold the dosa and serve hot with sambar and chutney."
                ]
            },
            "3": {
                ingredients: [
                    "2 cups basmati rice",
                    "1 cup mixed vegetables (carrots, peas, beans), chopped",
                    "2 onions, sliced",
                    "2 tomatoes, chopped",
                    "2 tbsp ginger-garlic paste",
                    "2 green chilies, slit",
                    "1 tsp cumin seeds",
                    "1 bay leaf",
                    "4 cloves",
                    "1 cinnamon stick",
                    "1 tsp biryani masala",
                    "Salt to taste",
                    "3 tbsp oil",
                    "Fresh coriander leaves for garnish"
                ],
                instructions: [
                    "Rinse rice and soak for 30 minutes. Drain.",
                    "Heat oil in a pressure cooker, add whole spices (cumin, bay leaf, cloves, cinnamon).",
                    "Add sliced onions and sauté until golden brown.",
                    "Add ginger-garlic paste and green chilies. Sauté for 2 minutes.",
                    "Add chopped tomatoes and cook until soft.",
                    "Add mixed vegetables and biryani masala. Sauté for 5 minutes.",
                    "Add rice, salt, and 4 cups water. Mix well.",
                    "Pressure cook for 2 whistles. Let pressure release naturally.",
                    "Fluff rice with a fork, garnish with coriander leaves, and serve hot."
                ]
            },
            "4": {
                ingredients: [
                    "500g chicken, cut into pieces",
                    "2 large onions, finely chopped",
                    "2 tomatoes, pureed",
                    "2 tbsp butter",
                    "2 tbsp oil",
                    "2 tbsp ginger-garlic paste",
                    "1 tsp red chili powder",
                    "1 tsp garam masala",
                    "1 tsp coriander powder",
                    "1/2 tsp turmeric powder",
                    "1/2 cup cream",
                    "Salt to taste",
                    "Fresh coriander leaves for garnish"
                ],
                instructions: [
                    "Marinate chicken with yogurt, ginger-garlic paste, and spices for 2 hours.",
                    "Heat butter and oil in a pan. Add chopped onions and sauté until golden brown.",
                    "Add marinated chicken and cook on high heat for 5 minutes.",
                    "Add tomato puree, salt, and spices. Cover and cook for 10 minutes.",
                    "Add cream and simmer for 5 minutes until gravy thickens.",
                    "Garnish with coriander leaves and serve hot with naan or rice."
                ]
            },
            "5": {
                ingredients: [
                    "500g chicken, cut into pieces",
                    "2 cups basmati rice",
                    "2 large onions, sliced",
                    "2 tomatoes, chopped",
                    "2 tbsp ginger-garlic paste",
                    "2 green chilies, slit",
                    "1 tsp cumin seeds",
                    "1 bay leaf",
                    "4 cloves",
                    "1 cinnamon stick",
                    "1 tsp biryani masala",
                    "1 tsp red chili powder",
                    "1/2 tsp turmeric powder",
                    "Salt to taste",
                    "3 tbsp oil",
                    "Fresh mint and coriander leaves for garnish"
                ],
                instructions: [
                    "Rinse rice and soak for 30 minutes. Drain.",
                    "Marinate chicken with yogurt, ginger-garlic paste, and spices for 1 hour.",
                    "Heat oil in a pan, add whole spices (cumin, bay leaf, cloves, cinnamon).",
                    "Add sliced onions and sauté until golden brown.",
                    "Add marinated chicken and cook for 10 minutes.",
                    "In another pot, cook rice until 70% done.",
                    "Layer partially cooked rice over chicken mixture.",
                    "Cover with a tight lid and cook on low heat for 20 minutes.",
                    "Mix gently, garnish with mint and coriander leaves, and serve hot."
                ]
            },
            "6": {
                ingredients: [
                    "6 eggs",
                    "2 onions, finely chopped",
                    "2 tomatoes, chopped",
                    "1 tbsp ginger-garlic paste",
                    "2 green chilies, slit",
                    "1 tsp cumin seeds",
                    "1 tsp coriander powder",
                    "1/2 tsp turmeric powder",
                    "1 tsp garam masala",
                    "1/2 tsp red chili powder",
                    "Salt to taste",
                    "2 tbsp oil",
                    "Fresh coriander leaves for garnish"
                ],
                instructions: [
                    "Boil eggs, peel, and make 2-3 slits on each egg.",
                    "Heat oil in a pan, add cumin seeds and let them splutter.",
                    "Add chopped onions and sauté until golden brown.",
                    "Add ginger-garlic paste and green chilies. Sauté for 2 minutes.",
                    "Add chopped tomatoes and cook until soft.",
                    "Add all spices and salt. Cook for 2 minutes.",
                    "Add 1 cup water and bring to a boil.",
                    "Add boiled eggs and simmer for 5 minutes.",
                    "Garnish with coriander leaves and serve hot with rice or roti."
                ]
            }
        };
        
        return recipes[recipeId] || {
            ingredients: ["Ingredients not available for this recipe"],
            instructions: ["Instructions not available for this recipe"]
        };
    }
    
    // Notification function
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                showNotification('Please fill in all fields.');
                return;
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address.');
                return;
            }
            
            // Simulate form submission (would be replaced with actual API call)
            contactForm.reset();
            showNotification('Thanks for your message! We\'ll be in touch soon.');
        });
    }
    
    // Newsletter subscription
    const subscribeForm = document.getElementById('subscribeForm');
    
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('subscribeEmail').value;
            
            if (!email) {
                showNotification('Please enter your email address.');
                return;
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address.');
                return;
            }
            
            // Simulate subscription (would be replaced with actual API call)
            subscribeForm.reset();
            showNotification('Thanks for subscribing to our newsletter!');
        });
    }
    
    // Initialize recipe filters if on explore page
    const recipeFilters = document.getElementById('recipeFilters');
    
    if (recipeFilters) {
        const filterInputs = recipeFilters.querySelectorAll('select, input');
        const searchInput = document.getElementById('searchRecipe');
        const searchBtn = document.getElementById('searchBtn');
        
        // Apply filters function
        function applyFilters() {
            const recipeCards = document.querySelectorAll('.recipe-card');
            const searchTerm = searchInput.value.toLowerCase();
            
            const filterValues = {};
            filterInputs.forEach(input => {
                if (input.tagName === 'SELECT' && input.value !== 'all') {
                    filterValues[input.id] = input.value;
                }
            });
            
            recipeCards.forEach(card => {
                let showCard = true;
                
                // Check search term
                if (searchTerm) {
                    const title = card.querySelector('.recipe-card-title').textContent.toLowerCase();
                    showCard = title.includes(searchTerm);
                }
                
                // Check filters
                if (showCard && Object.keys(filterValues).length > 0) {
                    for (const [key, value] of Object.entries(filterValues)) {
                        const cardValue = card.dataset[key];
                        if (cardValue !== value) {
                            showCard = false;
                            break;
                        }
                    }
                }
                
                card.style.display = showCard ? 'block' : 'none';
            });
        }
        
        filterInputs.forEach(input => {
            if (input.tagName === 'SELECT') {
                input.addEventListener('change', applyFilters);
            }
        });
        
        if (searchBtn) {
            searchBtn.addEventListener('click', applyFilters);
        }
        
        if (searchInput) {
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    applyFilters();
                }
            });
        }
    }
});
