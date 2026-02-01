# Menu Seeding System

## Overview

The menu seeding system creates comprehensive sample data for the food delivery platform, including providers, menus, and menu items. Each provider gets personalized menus with items named after their business.

## Features

### Provider-Specific Menu Names
- Menu names start with provider's business name
- Daily menu items include provider's name
- Example: "Rajesh's Home Kitchen Morning Delight" with items like "Rajesh's Home Kitchen Special Paratha"

### Menu Templates
- **6 menu templates** (2 breakfast, 2 lunch, 2 dinner)
- **7 daily items** per menu (Monday to Sunday)
- **Distinct menus** for each provider with personalized naming

### Menu Categories
1. **Breakfast Menus:**
   - Morning Delight (traditional breakfast items)
   - Healthy Start (nutritious options)

2. **Lunch Menus:**
   - Traditional Thali (complete Indian meals)
   - Quick Bites (fast lunch options)

3. **Dinner Menus:**
   - Evening Comfort (hearty dinner meals)
   - Light Dinner (healthy evening options)

## API Endpoints

### 1. Seed Providers
```
POST /api/seed/providers
```
Creates 5 sample providers with different business types and cuisines.

### 2. Seed Menus
```
POST /api/seed/menus
```
Creates menus and menu items for all existing providers. Requires providers to exist first.

### 3. Seed All
```
POST /api/seed/all
```
Runs complete seeding process in sequence: providers → menus → delivery orders (optional).

### 4. Seed Delivery Orders
```
POST /api/seed/delivery-orders
```
Creates sample delivery orders for testing. Requires providers, customers, addresses, and menus.

## Usage Instructions

### Option 1: Complete Seeding
```bash
# Seed everything at once
curl -X POST http://localhost:3000/api/seed/all
```

### Option 2: Step-by-Step Seeding
```bash
# 1. Create providers first
curl -X POST http://localhost:3000/api/seed/providers

# 2. Create menus for providers
curl -X POST http://localhost:3000/api/seed/menus

# 3. (Optional) Create delivery orders
curl -X POST http://localhost:3000/api/seed/delivery-orders
```

## Sample Data Structure

### Providers Created
- **Rajesh's Home Kitchen** - North Indian home-cooked meals
- **Priya's Spice Corner** - South Indian delicacies
- **Amit's Food Delights** - Multi-cuisine restaurant
- **Meera's Healthy Bites** - Healthy and organic meals
- **Ravi's Traditional Kitchen** - Traditional sweets and snacks

### Menu Examples
Each provider gets 6 menus (2 per meal type):

**Breakfast:**
- "Rajesh's Home Kitchen Morning Delight"
- "Rajesh's Home Kitchen Healthy Start"

**Lunch:**
- "Rajesh's Home Kitchen Traditional Thali"
- "Rajesh's Home Kitchen Quick Bites"

**Dinner:**
- "Rajesh's Home Kitchen Evening Comfort"
- "Rajesh's Home Kitchen Light Dinner"

### Menu Items
Each menu has 7 daily items:
- Monday: "Rajesh's Home Kitchen Special Paratha"
- Tuesday: "Rajesh's Home Kitchen Masala Oats"
- Wednesday: "Rajesh's Home Kitchen Poha Special"
- ... and so on

## Database Schema Compliance

### Menu Model Fields
- `providerId`: Reference to ServiceProvider
- `name`: Provider-specific menu name
- `description`: Detailed description with provider name
- `category`: "breakfast" | "lunch" | "dinner"
- `basePrice`: Base price for single serving
- `monthlyPlanPrice`: Monthly subscription price
- `tags`: Descriptive tags for filtering
- `preparationTime`: Time in minutes
- `servingSize`: Number of people served
- `isActive`, `isAvailable`, `isVegetarian`: Boolean flags
- `weekType`: "whole" | "weekdays" | "weekends"
- `rating`, `userRatingCount`: Rating system

### MenuItem Model Fields
- `menuId`: Reference to Menu
- `name`: Provider-specific item name
- `description`: Detailed description
- `day`: "monday" to "sunday"
- `ingredients`: Array of ingredients
- `nutritionInfo`: Calories, protein, carbs, fat, fiber
- `allergens`: Array of allergen information
- `isSpicy`: Boolean flag
- `spiceLevel`: "mild" | "medium" | "hot" | "extra-hot"

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Menus and menu items created successfully",
  "data": {
    "providers": 5,
    "menusCreated": 30,
    "menuItemsCreated": 210,
    "breakdown": {
      "breakfast": 10,
      "lunch": 10,
      "dinner": 10
    },
    "sampleMenus": [...]
  }
}
```

### Error Response
```json
{
  "error": "No providers found. Please create providers first.",
  "suggestion": "Use /api/seed/providers to create sample providers"
}
```

## Testing

### Verify Seeding Results
1. Check provider count and names
2. Verify menu names include provider business names
3. Confirm menu items are properly linked to menus
4. Test that each provider has 6 menus with 7 items each

### Expected Results
- **5 providers** with unique business names
- **30 menus** (6 per provider)
- **210 menu items** (7 per menu)
- All menu and item names include provider's business name

## Integration with Delivery System

The seeded menus integrate with:
- **Order System**: Menus can be ordered by customers
- **Delivery System**: Orders create delivery assignments
- **Provider Dashboard**: Providers can manage their seeded menus
- **Customer App**: Customers can browse provider-specific menus

## Customization

To customize the seeding data:
1. Edit `menuTemplates` in `/api/seed/menus/route.ts`
2. Modify `sampleProviders` in `/api/seed/providers/route.ts`
3. Adjust pricing, preparation times, or nutritional information
4. Add new menu categories or meal types

## Notes

- Menu seeding requires existing providers in the database
- All placeholder `{provider}` text is replaced with actual business names
- Nutritional information is randomly generated within realistic ranges
- Spice levels and allergen information are randomly assigned
- The system clears existing menus before creating new ones