const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to DB');
  const User = mongoose.model('User', new mongoose.Schema({name: String, email: String, role: String}));
  
  // Fix the test dispatcher account
  const res1 = await User.updateOne(
    { email: 'dispatcher@shipwise.com' }, 
    { $set: { role: 'dispatcher' } }
  );
  console.log('Dispatcher Update:', res1);

  // Fix the test courier account
  const res2 = await User.updateOne(
    { email: 'courier@shipwise.com' }, 
    { $set: { role: 'courier' } }
  );
  console.log('Courier Update:', res2);

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
