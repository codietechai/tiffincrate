import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ServiceProvider from "@/models/ServiceProvider";
import User from "@/models/User";
import Menu from "@/models/Menu";
import MenuItem from "@/models/MenuItem";
import bcrypt from "bcryptjs";

// Sample providers data
const sampleProviders = Array.from({ length: 10 }).map((_, i) => ({
  email: `provider${i + 1}@example.com`,
  name: `provider${i + 1}`,
  phone: `98765432${10 + i}`,
  businessName: `Provider${i + 1} Kitchen`,
  description: "Fresh homemade meals prepared with quality ingredients",
  cuisine: ["Indian", "Home Style"],
  deliveryAreas: ["Sector 1", "Sector 2", "Sector 3"],
  location: {
    coordinates: [77.209, 28.613],
    address: `Sector ${i + 1}, Delhi`
  },
  businessType: "home_kitchen" as const,
  serviceRadius: 7
}));

// Menu templates with provider name placeholders
const menuTemplates = {
  breakfast: [
    {
      name: "{provider} Morning Delight",
      description: "A wholesome breakfast to start your day right with {provider}'s special touch",
      image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0",
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
          day: "monday",
          images: [
            "https://images.unsplash.com/photo-1601050690597-df0568f70950"
          ]
        },
        {
          name: "{provider} Masala Oats",
          description: "Nutritious oats cooked {provider} style with vegetables",
          ingredients: ["oats", "vegetables", "spices", "milk"],
          day: "tuesday",
          images: [
            "https://images.unsplash.com/photo-1617196038435-13d4f3c8d2c6"
          ]
        },
        {
          name: "{provider} Poha Special",
          description: "Traditional poha with {provider}'s unique preparation",
          ingredients: ["flattened rice", "onions", "peanuts", "curry leaves"],
          day: "wednesday",
          images: [
            "https://images.unsplash.com/photo-1604908554025-2a33c6e6c6f1"
          ]
        },
        {
          name: "{provider} Upma Delight",
          description: "South Indian upma prepared the {provider} way",
          ingredients: ["semolina", "vegetables", "mustard seeds", "curry leaves"],
          day: "thursday",
          images: [
            "https://images.unsplash.com/photo-1589302168068-964664d93dc0"
          ]
        },
        {
          name: "{provider} Sandwich Combo",
          description: "Grilled sandwiches with {provider}'s special filling",
          ingredients: ["bread", "vegetables", "cheese", "chutney"],
          day: "friday",
          images: [
            "https://images.unsplash.com/photo-1554433607-66b5efe9d304"
          ]
        },
        {
          name: "{provider} Weekend Pancakes",
          description: "Fluffy pancakes made with {provider}'s special batter",
          ingredients: ["flour", "milk", "eggs", "honey", "fruits"],
          day: "saturday",
          images: [
            "https://images.unsplash.com/photo-1550317138-10000687a72b"
          ]
        },
        {
          name: "{provider} Sunday Brunch",
          description: "Special Sunday breakfast by {provider}",
          ingredients: ["mixed items", "fruits", "juice", "special treats"],
          day: "sunday",
          images: [
            "https://images.unsplash.com/photo-1484723091739-30a097e8f929"
          ]
        }
      ]
    },

    {
      name: "{provider} Healthy Start",
      description: "Nutritious breakfast options curated by {provider} for health-conscious customers",
      image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
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
          day: "monday",
          images: [
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
          ]
        },
        {
          name: "{provider} Green Smoothie",
          description: "Nutrient-packed smoothie from {provider}'s kitchen",
          ingredients: ["spinach", "banana", "apple", "chia seeds", "almond milk"],
          day: "tuesday",
          images: [
            "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af"
          ]
        },
        {
          name: "{provider} Avocado Toast",
          description: "Gourmet avocado toast prepared by {provider}",
          ingredients: ["whole grain bread", "avocado", "tomatoes", "herbs"],
          day: "wednesday",
          images: [
            "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2"
          ]
        },
        {
          name: "{provider} Muesli Mix",
          description: "Homemade muesli blend by {provider}",
          ingredients: ["oats", "dried fruits", "nuts", "seeds", "milk"],
          day: "thursday",
          images: [
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd"
          ]
        },
        {
          name: "{provider} Fruit Salad",
          description: "Fresh seasonal fruit salad by {provider}",
          ingredients: ["seasonal fruits", "honey", "mint", "lime"],
          day: "friday",
          images: [
            "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce"
          ]
        },
        {
          name: "{provider} Chia Pudding",
          description: "Overnight chia pudding prepared by {provider}",
          ingredients: ["chia seeds", "coconut milk", "vanilla", "berries"],
          day: "saturday",
          images: [
            "https://images.unsplash.com/photo-1617191519105-d07b98b10de6"
          ]
        },
        {
          name: "{provider} Wellness Bowl",
          description: "Complete wellness bowl by {provider}",
          ingredients: ["mixed grains", "superfoods", "fresh fruits", "nuts"],
          day: "sunday",
          images: [
            "https://images.unsplash.com/photo-1490645935967-10de6ba17061"
          ]
        }
      ]
    }
  ],

  lunch: [
    {
      name: "{provider} Traditional Thali",
      description: "Authentic Indian thali prepared with {provider}'s traditional recipes",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d",
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
          day: "monday",
          images: [
            "https://images.unsplash.com/photo-1626500154747-6c8c0c5c873d"
          ]
        },
        {
          name: "{provider} Rajma Chawal",
          description: "North Indian rajma chawal by {provider}",
          ingredients: ["kidney beans", "rice", "onions", "tomatoes", "spices"],
          day: "tuesday",
          images: [
            "https://images.unsplash.com/photo-1613145993483-6c90a1c6d7f2"
          ]
        },
        {
          name: "{provider} Chole Bhature",
          description: "Punjabi chole bhature from {provider}'s kitchen",
          ingredients: ["chickpeas", "flour", "spices", "yogurt", "pickles"],
          day: "wednesday",
          images: [
            "https://images.unsplash.com/photo-1626074353765-517a681e40be"
          ]
        }
      ]
    },

    {
      name: "{provider} Quick Bites",
      description: "Fast and delicious lunch options by {provider} for busy professionals",
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
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
          day: "monday",
          images: [
            "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d"
          ]
        },
        {
          name: "{provider} Pasta Bowl",
          description: "Italian pasta prepared {provider} style",
          ingredients: ["pasta", "vegetables", "herbs", "cheese"],
          day: "tuesday",
          images: [
            "https://images.unsplash.com/photo-1525755662778-989d0524087e"
          ]
        },
        {
          name: "{provider} Fried Rice",
          description: "Indo-Chinese fried rice by {provider}",
          ingredients: ["rice", "vegetables", "soy sauce", "spices"],
          day: "wednesday",
          images: [
            "https://images.unsplash.com/photo-1603133872878-684f208fb84b"
          ]
        }
      ]
    }
  ],

  dinner: [
    {
      name: "{provider} Evening Comfort",
      description: "Comforting dinner meals prepared with love by {provider}",
      image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
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
          day: "monday",
          images: [
            "https://images.unsplash.com/photo-1604908177225-d0f2d6b2b7d5"
          ]
        },
        {
          name: "{provider} Paneer Makhani",
          description: "Rich paneer makhani by {provider}",
          ingredients: ["paneer", "tomatoes", "cream", "spices", "naan"],
          day: "tuesday",
          images: [
            "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398"
          ]
        }
      ]
    },

    {
      name: "{provider} Light Dinner",
      description: "Light and healthy dinner options by {provider} for a peaceful night",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
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
          day: "monday",
          images: [
            "https://images.unsplash.com/photo-1604908554025-2a33c6e6c6f1"
          ]
        },
        {
          name: "{provider} Grilled Chicken",
          description: "Herb-grilled chicken prepared by {provider}",
          ingredients: ["chicken breast", "herbs", "vegetables", "quinoa"],
          day: "tuesday",
          images: [
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1"
          ]
        }
      ]
    }
  ]
};

async function seedProviders() {
    // Clear existing providers and their users
    const existingProviders = await ServiceProvider.find();
    const providerUserIds = existingProviders.map(p => p.userId);

    await ServiceProvider.deleteMany({});
    await User.deleteMany({ _id: { $in: providerUserIds } });

    const createdProviders = [];

    for (const providerData of sampleProviders) {
        // Create user account for provider
        const hashedPassword = await bcrypt.hash("password123", 12);

        const user = new User({
            name: providerData.name,
            email: providerData.email,
            phone: providerData.phone,
            password: hashedPassword,
            role: "provider",
            isVerified: true,
            tokenVersion: 0
        });

        await user.save();

        // Create service provider profile
        const provider = new ServiceProvider({
            userId: user._id,
            businessName: providerData.businessName,
            description: providerData.description,
            cuisine: providerData.cuisine,
            deliveryAreas: providerData.deliveryAreas,
            location: {
                type: "Point",
                coordinates: providerData.location.coordinates,
                address: providerData.location.address
            },
            businessType: providerData.businessType,
            serviceRadius: providerData.serviceRadius,
            isVerified: true,
            isActive: true,
            rating: Math.random() * 2 + 3, // 3-5 rating
            totalOrders: Math.floor(Math.random() * 100) + 50, // 50-150 orders
            avgDeliveryTime: Math.floor(Math.random() * 20) + 25, // 25-45 minutes
            operatingHours: {
                breakfast: {
                    enabled: true,
                    selfDelivery: true
                },
                lunch: {
                    enabled: true,
                    selfDelivery: true
                },
                dinner: {
                    enabled: true,
                    selfDelivery: true
                }
            }
        });

        await provider.save();
        createdProviders.push({
            user: user,
            provider: provider
        });
    }

    return {
        success: true,
        message: "Sample providers created successfully",
        data: {
            providersCreated: createdProviders.length,
            providers: createdProviders.map(({ user, provider }) => ({
                id: provider._id,
                businessName: provider.businessName,
                email: user.email,
                phone: user.phone,
                cuisine: provider.cuisine,
                businessType: provider.businessType,
                serviceRadius: provider.serviceRadius,
                location: provider.location.address
            }))
        }
    };
}

async function seedMenus() {
    // Get all providers
    const providers = await ServiceProvider.find();

    if (providers.length === 0) {
        throw new Error("No providers found. Please create providers first.");
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
                    image: template.image,
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
                        images: itemTemplate.images,
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

    return {
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
    };
}

export async function POST(_request: NextRequest) {
    try {
        await connectMongoDB();
        const results = [];

        // 1. Seed providers first
        console.log('Seeding providers...');
        const providersResult = await seedProviders();
        results.push({ step: 'providers', ...providersResult });

        if (!providersResult.success) {
            throw new Error(`Provider seeding failed: ${providersResult.message}`);
        }

        // 2. Seed menus
        console.log('Seeding menus...');
        const menusResult = await seedMenus();
        results.push({ step: 'menus', ...menusResult });

        if (!menusResult.success) {
            throw new Error(`Menu seeding failed: ${menusResult.message}`);
        }

        // 3. Skip delivery orders for now (requires customers and addresses)
        console.log('Skipping delivery orders - requires customers and addresses');
        results.push({
            step: 'delivery-orders',
            success: false,
            message: 'Skipped - requires customers and addresses to be seeded first'
        });

        return NextResponse.json({
            success: true,
            message: "Database seeding completed successfully",
            results: results,
            summary: {
                providers: (results.find(r => r.step === 'providers') as any)?.data?.providersCreated || 0,
                menus: (results.find(r => r.step === 'menus') as any)?.data?.menusCreated || 0,
                menuItems: (results.find(r => r.step === 'menus') as any)?.data?.menuItemsCreated || 0,
                deliveryOrders: 0
            }
        });

    } catch (error) {
        console.error("Seed all error:", error);
        return NextResponse.json(
            {
                error: "Failed to seed database",
                message: error instanceof Error ? error.message : "Unknown error",
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}