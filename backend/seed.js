const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to DB');
        
        await User.deleteMany({});

        const users = [
            { name: 'Kibre Moges', email: 'dispatcher@shipwise.com', password: 'password123', role: 'dispatcher' },
            { name: 'John Driver', email: 'courier@shipwise.com', password: 'password123', role: 'courier' },
            { name: 'Alice Smith', email: 'customer@shipwise.com', password: 'password123', role: 'customer' }
        ];

        for (let u of users) {
          try {
            const user = new User(u);
            await user.save();
            console.log(`✅ Created ${u.role}: ${u.email}`);
          } catch (e) {
            console.error(`❌ Failed to create ${u.role}:`, e.message);
          }
        }

        console.log('Seed completed!');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
