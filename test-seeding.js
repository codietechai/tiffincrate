// Simple test script to verify menu seeding
const mongoose = require('mongoose');

// Connect to MongoDB
async function testSeeding() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery');
        console.log('Connected to MongoDB');

        // Import models
        const ServiceProvider = require('./models/ServiceProvider').default;
        const Menu = require('./models/Menu').default;
        const MenuItem = require('./models/MenuItem').default;

        // Check providers
        const providers = await ServiceProvider.find();
        console.log(`Found ${providers.length} providers:`);
        providers.forEach(p => console.log(`- ${p.businessName}`));

        // Check menus
        const menus = await Menu.find();
        console.log(`\nFound ${menus.length} menus:`);
        menus.slice(0, 5).forEach(m => console.log(`- ${m.name} (${m.category})`));

        // Check menu items
        const menuItems = await MenuItem.find();
        console.log(`\nFound ${menuItems.length} menu items:`);
        menuItems.slice(0, 5).forEach(mi => console.log(`- ${mi.name} (${mi.day})`));

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');

    } catch (error) {
        console.error('Test error:', error);
        process.exit(1);
    }
}

testSeeding();