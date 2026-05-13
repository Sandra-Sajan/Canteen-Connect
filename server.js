import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import orderRoutes from './routes/orders.js';
import announcementRoutes from './routes/announcements.js';

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        console.log('🔄 Attempting to connect to Local MongoDB...');
        await mongoose.connect('mongodb://127.0.0.1:27017/canteen-connect', {
            serverSelectionTimeoutMS: 5000 // Fail fast if local DB is not running
        });
        console.log('✅ MongoDB Connected (Local)');
    } catch (err) {
        console.log('⚠️ Local MongoDB not found (or timed out), starting persistent local database...');
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const path = await import('path');
            const fs = await import('fs');
            const { fileURLToPath } = await import('url');

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            const dbPath = path.join(__dirname, 'data', 'db');
            if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

            // Clean up old lock files that might prevent startup if previously crashed
            const lockFile = path.join(dbPath, 'mongod.lock');
            const wtLockFile = path.join(dbPath, 'WiredTiger.lock');
            try {
                if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
                if (fs.existsSync(wtLockFile)) fs.unlinkSync(wtLockFile);
            } catch (e) { /* ignore */ }

            const mongod = await MongoMemoryServer.create({
                instance: {
                    dbPath: dbPath,
                    storageEngine: 'wiredTiger'
                }
            });
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log('✅ MongoDB Connected (Persistent Local DB)');

            // Graceful shutdown
            process.on('SIGINT', async () => {
                console.log('🛑 Shutting down server and MongoDB...');
                await mongoose.disconnect();
                if (mongod) await mongod.stop();
                process.exit(0);
            });
            process.on('SIGTERM', async () => {
                console.log('🛑 Shutting down server and MongoDB...');
                await mongoose.disconnect();
                if (mongod) await mongod.stop();
                process.exit(0);
            });

            // Seed Default User for Testing
            try {
                const User = (await import('./models/User.js')).default;
                const existingUser = await User.findOne({ id: 'student' });
                if (!existingUser) {
                    await User.create({
                        id: 'student',
                        name: 'Student User',
                        password: 'student123', // Matches user attempt
                        role: 'user',
                        wallet: 500,
                        loyalty: { points: 100, totalSpent: 0, badge: 'Bronze', birthday: '' },
                        preferences: { diet: 'None', allergies: [] }
                    });
                    console.log('✨ Seeded User: student / student123');
                }

                // Seed St. Thomas College Student
                const stcStudent = await User.findOne({ id: 'STC23CS040' });
                if (!stcStudent) {
                    await User.create({
                        id: 'STC23CS040',
                        name: 'STC Student',
                        password: 'password',
                        role: 'user',
                        wallet: 1000,
                        loyalty: { points: 50, totalSpent: 0, badge: 'Silver', birthday: '' },
                        preferences: { diet: 'None', allergies: [] }
                    });
                    console.log('✨ Seeded User: STC23CS040 / password');
                }

                // Seed St. Thomas College Staff
                const stcStaff = await User.findOne({ id: 'STC_STAFF_01' });
                if (!stcStaff) {
                    await User.create({
                        id: 'STC_STAFF_01',
                        name: 'STC Staff Member',
                        password: 'password',
                        role: 'user', // Staff uses user interface for ordering, or admin if preferred. keeping as user for now as per request "staffs can login using their respective staffid" implies they order too.
                        wallet: 2000,
                        loyalty: { points: 500, totalSpent: 0, badge: 'Gold', birthday: '' },
                        preferences: { diet: 'None', allergies: [] }
                    });
                    console.log('✨ Seeded User: STC_STAFF_01 / password');
                } else {
                    // Update password if user exists (Fixes "Invalid Credentials" if old seed used)
                    existingUser.password = 'student123';
                    await existingUser.save();
                    console.log('🔄 Updated User Password: student / student123');
                }

                // Seed Items

                const Item = (await import('./models/Item.js')).default;

                const ALL_ITEMS = [
                    // Existing
                    { id: 1, name: "Veg Burger", price: 50, category: "Snacks", dietary: "Veg", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", description: "Classic veggie patty with fresh lettuce and sauce.", stock: 50 },
                    { id: 2, name: "Chicken Sandwich", price: 80, category: "Snacks", dietary: "Non-Veg", image: "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", description: "Grilled chicken with mayo and cheese.", stock: 50 },
                    { id: 3, name: "Cold Coffee", price: 40, category: "Beverages", dietary: "Veg", image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", description: "Chilled brewed coffee with ice cream.", stock: 50 },
                    { id: 4, name: "Masala Dosa", price: 60, category: "Breakfast", dietary: "Veg", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", description: "Crispy crepe with spiced potato filling.", stock: 50 },
                    { id: 5, name: "Rajma Rice Bowl", price: 90, category: "Lunch", dietary: "Veg", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", description: "Comforting kidney beans curry with steamed rice.", stock: 50 },

                    // New Items
                    { id: 11, name: "Samosa (2 pcs)", price: 30, category: "Snacks", dietary: "Veg", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60", description: "Crispy pastry filled with spiced potatoes.", stock: 100 },
                    { id: 12, name: "Veg Cutlet", price: 25, category: "Snacks", dietary: "Veg", image: "https://images.unsplash.com/photo-1522299836371-d6872718e873?w=500&auto=format&fit=crop&q=60", description: "Spiced vegetable patties, fried to perfection.", stock: 80 },
                    { id: 13, name: "Lays - Classic Salted", price: 20, category: "Packaged", dietary: "Veg", image: "https://images.unsplash.com/photo-1566478919030-4151834f71f9?w=500&auto=format&fit=crop&q=60", description: "Classic salted potato chips.", stock: 200 },
                    { id: 14, name: "Kurkure - Masala Munch", price: 20, category: "Packaged", dietary: "Veg", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&auto=format&fit=crop&q=60", description: "Spicy and crunchy Indian tea-time snack.", stock: 200 },
                    { id: 15, name: "Chicken Meat Roll", price: 45, category: "Snacks", dietary: "Non-Veg", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=60", description: "Spiced chicken filling rolled in paratha.", stock: 60 },
                    { id: 16, name: "Fruit Fizz", price: 35, category: "Beverages", dietary: "Veg", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60", description: "Refreshing sparkling fruit drink.", stock: 100 },
                    { id: 17, name: "Masala Chai", price: 15, category: "Beverages", dietary: "Veg", image: "https://images.unsplash.com/photo-1576092768241-dec231847233?w=500&auto=format&fit=crop&q=60", description: "Traditional Indian spiced milk tea.", stock: 200 },
                    { id: 18, name: "Hot Coffee", price: 20, category: "Beverages", dietary: "Veg", image: "https://images.unsplash.com/photo-1520986606214-8b456906c813?w=500&auto=format&fit=crop&q=60", description: "Freshly brewed hot coffee.", stock: 200 },
                    { id: 19, name: "Dairy Milk Chocolate", price: 40, category: "Packaged", dietary: "Veg", image: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=500&auto=format&fit=crop&q=60", description: "Smooth and creamy milk chocolate.", stock: 150 },
                    { id: 20, name: "KitKat", price: 25, category: "Packaged", dietary: "Veg", image: "https://images.unsplash.com/photo-1627041846618-205193910c59?w=500&auto=format&fit=crop&q=60", description: "Crispy wafer fingers covered in chocolate.", stock: 150 }
                ];

                for (const item of ALL_ITEMS) {
                    await Item.findOneAndUpdate({ name: item.name }, item, { upsert: true });
                }
                console.log('🍔 Seeded/Updated Items');
            } catch (seedErr) {
                console.error("Seed Error:", seedErr);
            }
        } catch (memErr) {
            console.error('❌ MongoDB Connection Error (Both Local & In-Memory):', memErr);
            process.exit(1);
        }
    }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/announcements', announcementRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('API is Running...');
});

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
    });
});
