import os
import json
import logging
import re
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Create required directories
os.makedirs('static/data', exist_ok=True)

# Configure the Gemini API
try:
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "your-api-key"))
    model = genai.GenerativeModel('gemini-2.0-flash')
    logging.info("Gemini API configured successfully")
except Exception as e:
    logging.error(f"Error configuring Gemini API: {e}")

# Sample recipe data (this would typically come from a database)
with open('static/data/recipes.json', 'w') as f:
    json.dump({
        "veg_recipes": [
            {
                "id": 1,
                "name": "Paneer Butter Masala",
                "cooking_time": "30 mins",
                "tags": ["North Indian", "Main Course", "Rich"],
                "type": "veg",
                "image_url": "https://bing.com/th?id=OSK.6ef923eb7c70b925ed2e7161de03fcb8"
            },
            {
                "id": 2,
                "name": "Masala Dosa",
                "cooking_time": "45 mins",
                "tags": ["South Indian", "Breakfast", "Popular"],
                "type": "veg",
                "image_url": "https://bing.com/th?id=OSK.63f3098e3cd341284d3239c70092d1ad"
            },
            {
                "id": 3,
                "name": "Vegetable Biryani",
                "cooking_time": "60 mins",
                "tags": ["Hyderabadi", "Main Course", "Spicy"],
                "type": "veg",
                "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            }
        ],
        "nonveg_recipes": [
            {
                "id": 4,
                "name": "Butter Chicken",
                "cooking_time": "45 mins",
                "tags": ["North Indian", "Main Course", "Popular"],
                "type": "chicken",
                "image_url": "https://bing.com/th?id=OSK.9b10bf0e6c131bef38afd8fd180b1539"
            },
            {
                "id": 5,
                "name": "Chicken Biryani",
                "cooking_time": "60 mins",
                "tags": ["Hyderabadi", "Main Course", "Spicy"],
                "type": "chicken",
                "image_url": "https://bing.com/th?id=OSK.6325d80d22f063e84a6ab0ed10595cf2"
            },
            {
                "id": 6,
                "name": "Egg Curry",
                "cooking_time": "30 mins",
                "tags": ["Bengali", "Main Course", "Easy"],
                "type": "egg",
                "image_url": "https://bing.com/th?id=OSK.d168a4676756fa1089adf2770ad4951c"
            }
        ]
    }, f)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ingredients')
def ingredients():
    return render_template('ingredients.html')

@app.route('/veg-recipes')
def veg_recipes():
    with open('static/data/recipes.json', 'r') as f:
        recipes = json.load(f)
    return render_template('veg_recipes.html', recipes=recipes['veg_recipes'])

@app.route('/nonveg-recipes')
def nonveg_recipes():
    with open('static/data/recipes.json', 'r') as f:
        recipes = json.load(f)
    return render_template('nonveg_recipes.html', recipes=recipes['nonveg_recipes'])

@app.route('/explore')
def explore():
    with open('static/data/recipes.json', 'r') as f:
        recipes_data = json.load(f)
    all_recipes = recipes_data['veg_recipes'] + recipes_data['nonveg_recipes']
    return render_template('explore.html', recipes=all_recipes)

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/suggest-recipe', methods=['POST'])
def suggest_recipe():
    try:
        ingredients = request.json.get('ingredients', [])
        
        if not ingredients:
            return jsonify({"error": "No ingredients provided"}), 400
        
        # Format the prompt for the AI
        prompt = f"""
        I have the following ingredients: {', '.join(ingredients)}. 
        Please suggest an Indian recipe (with detailed instructions) that I can make with these ingredients.
        Format your response as JSON with the following structure:
        {{
            "recipe_name": "Name of the dish",
            "ingredients_required": ["ingredient1", "ingredient2", ...],
            "missing_ingredients": ["ingredient1", "ingredient2", ...],
            "instructions": ["step1", "step2", ...],
            "cooking_time": "30 mins",
            "cuisine_type": "North Indian/South Indian/etc",
            "meal_type": "Breakfast/Lunch/Dinner",
            "is_vegetarian": true/false
        }}
        
        IMPORTANT: Do not use markdown formatting within the instructions array. Each step should be a plain text string without markdown number prefixes. The steps will be automatically numbered by the frontend.
        """
        
        # Call the Gemini API
        response = model.generate_content(prompt)
        
        # Extract JSON from the response
        try:
            # Get the text content and try to parse it as JSON
            response_text = response.text
            # Remove markdown code block markers if present
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            
            recipe_data = json.loads(response_text)
            
            # Clean up any markdown formatting in the instructions
            if "instructions" in recipe_data and isinstance(recipe_data["instructions"], list):
                recipe_data["instructions"] = [
                    # Remove markdown number prefixes like "1. " or "1) " if present
                    re.sub(r'^\d+[\.\)]\s*', '', instruction.strip())
                    for instruction in recipe_data["instructions"]
                ]
                
            return jsonify(recipe_data)
        except json.JSONDecodeError as e:
            logging.error(f"Error parsing JSON from API response: {e}")
            logging.debug(f"Response content: {response.text}")
            return jsonify({
                "error": "Could not parse recipe data",
                "raw_response": response.text
            }), 500
        
    except Exception as e:
        logging.error(f"Error in suggest-recipe: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/chatbot', methods=['POST'])
def chatbot():
    try:
        user_message = request.json.get('message', '')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Format the prompt for the AI
        prompt = f"""
        You are a helpful cooking assistant for Indian cuisine. The user is asking: {user_message}
        
        IMPORTANT FORMATTING INSTRUCTIONS:
        1. Format your response using Markdown.
        2. Use **bold** for dish names and important terms.
        3. Use *italics* for emphasis on key points.
        4. Use bullet points or numbered lists for steps or lists of ingredients.
        5. Use headings (## or ###) for section titles like "Ingredients" and "Instructions".
        
        Provide a helpful, concise response related to Indian cooking. If they ask for a recipe, 
        provide ingredients as a bulleted list and instructions as a numbered list.
        """
        
        # Call the Gemini API
        response = model.generate_content(prompt)
        
        return jsonify({"response": response.text})
        
    except Exception as e:
        logging.error(f"Error in chatbot: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
