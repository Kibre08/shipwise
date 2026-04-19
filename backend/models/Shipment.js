const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
    trackingId: { type: String, required: true, unique: true },
    senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    receiverPhone: { type: String, required: true },
    item: { type: String, required: true },
    originAddress: { type: String, required: true },
    destinationAddress: { type: String, required: true },
    destinationLat: { type: Number, default: null },
    destinationLng: { type: Number, default: null },
    deliveryPin: { type: String },
    status: { 
        type: String, 
        enum: ['Pre-advised', 'Received', 'Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'],
        default: 'Pending' 
    },
    courierId: { type: String, default: null },
    history: [
        {
            status: String,
            timestamp: { type: Date, default: Date.now },
            location: String
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Shipment', ShipmentSchema);
