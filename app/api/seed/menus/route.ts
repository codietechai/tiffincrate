import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Menu from "@/models/Menu";
import MenuItem from "@/models/MenuItem";
import ServiceProvider from "@/models/ServiceProvider";

// Menu templates with provider name placeholders
const menuTemplates = {
    breakfast: [
        {
            name: "{provider} Morning Delight",
            description: "A wholesome breakfast to start your day right with {provider}'s special touch",
            tags: ["healthy", "fresh", "morning", "energizing"],
            preparationTime: 25,
            servingSize: 1,
            basePrice: 120,
            monthlyPlanPrice: 3000,
            items: [
                {
                    name: "{provider} Special Paratha",
                    description: "Freshly made parathas with {provider}'s secret spice blend",
                    ingredients: ["wheat flour", "ghee", "spices", "vegetables"],
                    day: "monday"
                },
                {
                    name: "{provider} Masala Oats",
                    description: "Nutritious oats cooked {provider} style with vegetables",
                    ingredients: ["oats", "vegetables", "spices", "milk"],
                    day: "tuesday"
                },
                {
                    name: "{provider} Poha Special",
                    description: "Traditional poha with {provider}'s unique preparation",
                    ingredients: ["flattened rice", "onions", "peanuts", "curry leaves"],
                    day: "wednesday"
                },
                {
                    name: "{provider} Upma Delight",
                    description: "South Indian upma prepared the {provider} way",
                    ingredients: ["semolina", "vegetables", "mustard seeds", "curry leaves"],
                    day: "thursday"
                },
                {
                    name: "{provider} Sandwich Combo",
                    description: "Grilled sandwiches with {provider}'s special filling",
                    ingredients: ["bread", "vegetables", "cheese", "chutney"],
                    day: "friday"
                },
                {
                    name: "{provider} Weekend Pancakes",
                    description: "Fluffy pancakes made with {provider}'s special batter",
                    ingredients: ["flour", "milk", "eggs", "honey", "fruits"],
                    day: "saturday"
                },
                {
                    name: "{provider} Sunday Brunch",
                    description: "Special Sunday breakfast by {provider}",
                    ingredients: ["mixed items", "fruits", "juice", "special treats"],
                    day: "sunday"
                }
            ]
        },
        {
            name: "{provider} Healthy Start",
            description: "Nutritious breakfast options curated by {provider} for health-conscious customers",
            tags: ["healthy", "organic", "low-calorie", "nutritious"],
            preparationTime: 20,
            servingSize: 1,
            basePrice: 150,
            monthlyPlanPrice: 3800,
            items: [
                {
                    name: "{provider} Protein Bowl",
                    description: "High-protein breakfast bowl designed by {provider}",
                    ingredients: ["quinoa", "nuts", "seeds", "fruits", "yogurt"],
                    day: "monday"
                },
                {
                    name: "{provider} Green Smoothie",
                    description: "Nutrient-packed smoothie from {provider}'s kitchen",
                    ingredients: ["spinach", "banana", "apple", "chia seeds", "almond milk"],
                    day: "tuesday"
                },
                {
                    name: "{provider} Avocado Toast",
                    description: "Gourmet avocado toast prepared by {provider}",
                    ingredients: ["whole grain bread", "avocado", "tomatoes", "herbs"],
                    day: "wednesday"
                },
                {
                    name: "{provider} Muesli Mix",
                    description: "Homemade muesli blend by {provider}",
                    ingredients: ["oats", "dried fruits", "nuts", "seeds", "milk"],
                    day: "thursday"
                },
                {
                    name: "{provider} Fruit Salad",
                    description: "Fresh seasonal fruit salad by {provider}",
                    ingredients: ["seasonal fruits", "honey", "mint", "lime"],
                    day: "friday"
                },
                {
                    name: "{provider} Chia Pudding",
                    description: "Overnight chia pudding prepared by {provider}",
                    ingredients: ["chia seeds", "coconut milk", "vanilla", "berries"],
                    day: "saturday"
                },
                {
                    name: "{provider} Wellness Bowl",
                    description: "Complete wellness bowl by {provider}",
                    ingredients: ["mixed grains", "superfoods", "fresh fruits", "nuts"],
                    day: "sunday"
                }
            ]
        }
    ],
    lunch: [
        {
            name: "{provider} Traditional Thali",
            description: "Authentic Indian thali prepared with {provider}'s traditional recipes",
            tags: ["traditional", "complete meal", "homestyle", "authentic"],
            preparationTime: 35,
            servingSize: 1,
            basePrice: 180,
            monthlyPlanPrice: 4500,
            items: [
                {
                    name: "{provider} Dal Rice Combo",
                    description: "Classic dal rice prepared {provider} style",
                    ingredients: ["rice", "lentils", "spices", "ghee", "vegetables"],
                    day: "monday"
                },
                {
                    name: "{provider} Rajma Chawal",
                    description: "North Indian rajma chawal by {provider}",
                    ingredients: ["kidney beans", "rice", "onions", "tomatoes", "spices"],
                    day: "tuesday"
                },
                {
                    name: "{provider} Chole Bhature",
                    description: "Punjabi chole bhature from {provider}'s kitchen",
                    ingredients: ["chickpeas", "flour", "spices", "yogurt", "pickles"],
                    day: "wednesday"
                },
                {
                    name: "{provider} Biryani Special",
                    description: "Aromatic biryani prepared by {provider}",
                    ingredients: ["basmati rice", "meat/vegetables", "saffron", "spices"],
                    day: "thursday"
                },
                {
                    name: "{provider} South Indian Meal",
                    description: "Traditional South Indian meal by {provider}",
                    ingredients: ["rice", "sambar", "rasam", "vegetables", "curd"],
                    day: "friday"
                },
                {
                    name: "{provider} Weekend Special",
                    description: "Special weekend meal by {provider}",
                    ingredients: ["special curry", "rice", "bread", "dessert"],
                    day: "saturday"
                },
                {
                    name: "{provider} Sunday Feast",
                    description: "Grand Sunday feast prepared by {provider}",
                    ingredients: ["multiple curries", "rice", "bread", "sweets"],
                    day: "sunday"
                }
            ]
        },
        {
            name: "{provider} Quick Bites",
            description: "Fast and delicious lunch options by {provider} for busy professionals",
            tags: ["quick", "office lunch", "convenient", "tasty"],
            preparationTime: 20,
            servingSize: 1,
            basePrice: 140,
            monthlyPlanPrice: 3500,
            items: [
                {
                    name: "{provider} Wrap Special",
                    description: "Healthy wraps prepared by {provider}",
                    ingredients: ["tortilla", "vegetables", "protein", "sauce"],
                    day: "monday"
                },
                {
                    name: "{provider} Pasta Bowl",
                    description: "Italian pasta prepared {provider} style",
                    ingredients: ["pasta", "vegetables", "herbs", "cheese"],
                    day: "tuesday"
                },
                {
                    name: "{provider} Fried Rice",
                    description: "Indo-Chinese fried rice by {provider}",
                    ingredients: ["rice", "vegetables", "soy sauce", "spices"],
                    day: "wednesday"
                },
                {
                    name: "{provider} Burger Combo",
                    description: "Gourmet burger prepared by {provider}",
                    ingredients: ["bun", "patty", "vegetables", "sauce", "fries"],
                    day: "thursday"
                },
                {
                    name: "{provider} Salad Bowl",
                    description: "Fresh and healthy salad by {provider}",
                    ingredients: ["mixed greens", "vegetables", "protein", "dressing"],
                    day: "friday"
                },
                {
                    name: "{provider} Pizza Slice",
                    description: "Artisan pizza prepared by {provider}",
                    ingredients: ["pizza base", "sauce", "cheese", "toppings"],
                    day: "saturday"
                },
                {
                    name: "{provider} Noodle Bowl",
                    description: "Asian noodles prepared {provider} style",
                    ingredients: ["noodles", "vegetables", "sauce", "herbs"],
                    day: "sunday"
                }
            ]
        }
    ],
    dinner: [
        {
            name: "{provider} Evening Comfort",
            description: "Comforting dinner meals prepared with love by {provider}",
            tags: ["comfort food", "homestyle", "satisfying", "warm"],
            preparationTime: 40,
            servingSize: 1,
            basePrice: 200,
            monthlyPlanPrice: 5000,
            items: [
                {
                    name: "{provider} Butter Chicken",
                    description: "Creamy butter chicken prepared by {provider}",
                    ingredients: ["chicken", "tomatoes", "cream", "spices", "rice"],
                    day: "monday"
                },
                {
                    name: "{provider} Paneer Makhani",
                    description: "Rich paneer makhani by {provider}",
                    ingredients: ["paneer", "tomatoes", "cream", "spices", "naan"],
                    day: "tuesday"
                },
                {
                    name: "{provider} Fish Curry",
                    description: "Traditional fish curry prepared by {provider}",
                    ingredients: ["fish", "coconut", "spices", "curry leaves", "rice"],
                    day: "wednesday"
                },
                {
                    name: "{provider} Mutton Curry",
                    description: "Slow-cooked mutton curry by {provider}",
                    ingredients: ["mutton", "onions", "spices", "yogurt", "rice"],
                    day: "thursday"
                },
                {
                    name: "{provider} Vegetable Korma",
                    description: "Mixed vegetable korma prepared by {provider}",
                    ingredients: ["mixed vegetables", "coconut", "spices", "rice"],
                    day: "friday"
                },
                {
                    name: "{provider} Weekend Roast",
                    description: "Special weekend roast by {provider}",
                    ingredients: ["roasted meat/vegetables", "gravy", "sides"],
                    day: "saturday"
                },
                {
                    name: "{provider} Sunday Special",
                    description: "Grand Sunday dinner by {provider}",
                    ingredients: ["special curry", "rice", "bread", "dessert"],
                    day: "sunday"
                }
            ]
        },
        {
            name: "{provider} Light Dinner",
            description: "Light and healthy dinner options by {provider} for a peaceful night",
            tags: ["light", "healthy", "digestible", "peaceful"],
            preparationTime: 25,
            servingSize: 1,
            basePrice: 160,
            monthlyPlanPrice: 4000,
            items: [
                {
                    name: "{provider} Soup & Salad",
                    description: "Nutritious soup and salad combo by {provider}",
                    ingredients: ["seasonal vegetables", "herbs", "broth", "greens"],
                    day: "monday"
                },
                {
                    name: "{provider} Grilled Chicken",
                    description: "Herb-grilled chicken prepared by {provider}",
                    ingredients: ["chicken breast", "herbs", "vegetables", "quinoa"],
                    day: "tuesday"
                },
                {
                    name: "{provider} Steamed Fish",
                    description: "Delicately steamed fish by {provider}",
                    ingredients: ["fish fillet", "ginger", "soy sauce", "vegetables"],
                    day: "wednesday"
                },
                {
                    name: "{provider} Vegetable Stir-fry",
                    description: "Colorful vegetable stir-fry by {provider}",
                    ingredients: ["mixed vegetables", "garlic", "ginger", "brown rice"],
                    day: "thursday"
                },
                {
                    name: "{provider} Lentil Soup",
                    description: "Protein-rich lentil soup by {provider}",
                    ingredients: ["mixed lentils", "vegetables", "spices", "bread"],
                    day: "friday"
                },
                {
                    name: "{provider} Quinoa Bowl",
                    description: "Nutritious quinoa bowl prepared by {provider}",
                    ingredients: ["quinoa", "roasted vegetables", "nuts", "dressing"],
                    day: "saturday"
                },
                {
                    name: "{provider} Comfort Porridge",
                    description: "Soothing porridge prepared by {provider}",
                    ingredients: ["oats/rice", "milk", "nuts", "honey", "fruits"],
                    day: "sunday"
                }
            ]
        }
    ]
};

export async function POST(_request: NextRequest) {
    try {
        await connectMongoDB();

        // Get all providers
        const providers = await ServiceProvider.find();

        if (providers.length === 0) {
            return NextResponse.json({
                error: "No providers found. Please create providers first.",
                suggestion: "Use /api/seed/providers to create sample providers"
            }, { status: 400 });
        }

        // Clear existing menus and menu items
        await Menu.deleteMany({});
        await MenuItem.deleteMany({});

        const createdMenus: any[] = [];
        const createdMenuItems: any[] = [];

        // Create menus for each provider
        for (const provider of providers) {
            const providerName = provider.businessName || `Provider ${provider._id.toString().slice(-4)}`;

            // Create menus for each meal type
            for (const [mealType, templates] of Object.entries(menuTemplates)) {
                for (const template of templates) {
                    // Replace {provider} placeholder with actual provider name
                    const menuName = template.name.replace(/{provider}/g, providerName);
                    const menuDescription = template.description.replace(/{provider}/g, providerName);

                    // Create the menu
                    const menu = new Menu({
                        providerId: provider._id,
                        name: menuName,
                        description: menuDescription,
                        tags: template.tags,
                        preparationTime: template.preparationTime,
                        servingSize: template.servingSize,
                        basePrice: template.basePrice,
                        monthlyPlanPrice: template.monthlyPlanPrice,
                        category: mealType as "breakfast" | "lunch" | "dinner",
                        isActive: true,
                        isAvailable: true,
                        isVegetarian: true,
                        weekType: "whole" as "whole" | "weekdays" | "weekends",
                        rating: 0,
                        userRatingCount: 0
                    });

                    await menu.save();
                    createdMenus.push(menu);

                    // Create menu items for each day
                    for (const itemTemplate of template.items) {
                        const itemName = itemTemplate.name.replace(/{provider}/g, providerName);
                        const itemDescription = itemTemplate.description.replace(/{provider}/g, providerName);

                        const menuItem = new MenuItem({
                            menuId: menu._id,
                            name: itemName,
                            description: itemDescription,
                            ingredients: itemTemplate.ingredients,
                            day: itemTemplate.day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
                            images: [],
                            nutritionInfo: {
                                calories: Math.floor(Math.random() * 200) + 300, // 300-500 calories
                                protein: `${Math.floor(Math.random() * 20) + 10}g`,    // 10-30g protein
                                carbs: `${Math.floor(Math.random() * 40) + 30}g`,      // 30-70g carbs
                                fat: `${Math.floor(Math.random() * 15) + 5}g`,         // 5-20g fat
                                fiber: `${Math.floor(Math.random() * 8) + 2}g`         // 2-10g fiber
                            },
                            allergens: [],
                            isSpicy: Math.random() > 0.7, // 30% chance of being spicy
                            spiceLevel: ["mild", "medium", "hot", "extra-hot"][Math.floor(Math.random() * 4)] as "mild" | "medium" | "hot" | "extra-hot"
                        });

                        await menuItem.save();
                        createdMenuItems.push(menuItem);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Menus and menu items created successfully",
            data: {
                providers: providers.length,
                menusCreated: createdMenus.length,
                menuItemsCreated: createdMenuItems.length,
                breakdown: {
                    breakfast: createdMenus.filter(m => m.category === "breakfast").length,
                    lunch: createdMenus.filter(m => m.category === "lunch").length,
                    dinner: createdMenus.filter(m => m.category === "dinner").length
                },
                sampleMenus: createdMenus.slice(0, 3).map(menu => ({
                    name: menu.name,
                    provider: providers.find(p => p._id.equals(menu.providerId))?.businessName,
                    category: menu.category,
                    itemCount: createdMenuItems.filter(item => item.menuId.equals(menu._id)).length
                }))
            }
        });

    } catch (error) {
        console.error("Seed menus error:", error);
        return NextResponse.json(
            {
                error: "Failed to seed menus",
                message: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}