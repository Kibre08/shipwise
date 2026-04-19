const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Shipment = require('./models/Shipment');

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  const ships = await Shipment.find({createdAt: { $gte: startOfDay }});
  console.log(JSON.stringify(ships, null, 2));
  process.exit();
}

check();
