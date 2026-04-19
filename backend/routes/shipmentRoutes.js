const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const auth = require('../middleware/auth');

const { shipmentSchema, updateStatusSchema, validateRequest } = require('../middleware/validation');

// Create new shipment (Dispatcher only)
router.post('/create', auth, validateRequest(shipmentSchema), async (req, res) => {
    try {
        if (req.user.role !== 'dispatcher') {
            return res.status(403).json({ message: 'Access denied. Dispatchers only.' });
        }
        
        const { sender, receiver, receiverPhone, item, originAddress, destinationAddress, destinationLat, destinationLng } = req.body;
        const trackingId = 'SW-' + Math.floor(100000 + Math.random() * 900000);
        const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
        
        const newShipment = new Shipment({
            trackingId,
            sender,
            receiver,
            receiverPhone,
            item,
            originAddress: originAddress || 'Warehouse',
            destinationAddress: destinationAddress || 'Pending',
            destinationLat: destinationLat || null,
            destinationLng: destinationLng || null,
            deliveryPin,
            status: 'Pending',
            history: [{ status: 'Pending', location: originAddress || 'Warehouse' }]
        });

        await newShipment.save();
        res.status(201).json(newShipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new shipment (Customer/Sender)
router.post('/sender/create', auth, validateRequest(shipmentSchema), async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Customers only.' });
        }
        
        const { sender, receiver, receiverPhone, item, originAddress, destinationAddress, destinationLat, destinationLng } = req.body;
        const trackingId = 'SW-' + Math.floor(100000 + Math.random() * 900000);
        const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
        
        const newShipment = new Shipment({
            trackingId,
            senderUserId: req.user.id,
            sender: sender || req.user.name,
            receiver,
            receiverPhone,
            item,
            originAddress: originAddress || 'Sender Hub',
            destinationAddress: destinationAddress || 'Pending',
            destinationLat: destinationLat || null,
            destinationLng: destinationLng || null,
            deliveryPin,
            status: 'Pre-advised',
            history: [{ status: 'Pre-advised', location: originAddress || 'Sender Hub' }]
        });

        await newShipment.save();
        res.status(201).json(newShipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get tracking info (Public)
router.get('/track/:id', async (req, res) => {
    try {
        const shipment = await Shipment.findOne({ trackingId: req.params.id });
        if (!shipment) return res.status(404).json({ message: 'Package not found' });
        res.json(shipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Dispatcher Scans a Pre-advised shipment
router.patch('/dispatcher/receive/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'dispatcher') {
            return res.status(403).json({ message: 'Access denied. Dispatchers only.' });
        }
        
        const shipment = await Shipment.findOne({ trackingId: req.params.id });
        if (!shipment) return res.status(404).json({ message: 'Package not found' });

        if (shipment.status === 'Pre-advised') {
            shipment.status = 'Received';
            shipment.history.push({ status: 'Received', location: 'Warehouse' });
            await shipment.save();
        }
        res.json(shipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update status (Courier only)
router.patch('/update/:id', auth, validateRequest(updateStatusSchema), async (req, res) => {
    try {
        if (req.user.role !== 'courier') {
            return res.status(403).json({ message: 'Access denied. Couriers only.' });
        }
        
        const { status, location, pin } = req.body;
        const shipment = await Shipment.findOne({ trackingId: req.params.id });
        
        if (!shipment) return res.status(404).json({ message: 'Package not found' });

        if (status === 'Delivered') {
            if (!pin || pin !== shipment.deliveryPin) {
                return res.status(400).json({ message: 'Invalid Delivery PIN' });
            }
        }

        shipment.status = status;
        shipment.history.push({ status, location });
        
        await shipment.save();
        res.json(shipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all shipments (Dispatcher) - With Pagination
router.get('/all', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const query = {};
        if (search) {
            query.$or = [
                { trackingId: { $regex: search, $options: 'i' } },
                { sender: { $regex: search, $options: 'i' } },
                { receiver: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Shipment.countDocuments(query);
        const shipments = await Shipment.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            shipments,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalShipments: total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get My Shipments (Customer/Sender) - With Pagination
router.get('/my-shipments', auth, async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Customers only.' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const total = await Shipment.countDocuments({ senderUserId: req.user.id });
        const shipments = await Shipment.find({ senderUserId: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            shipments,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalShipments: total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Assign Courier to Shipment (Dispatcher only)
router.patch('/assign/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'dispatcher') {
            return res.status(403).json({ message: 'Access denied. Dispatchers only.' });
        }
        const { courierId, courierName } = req.body;
        const shipment = await Shipment.findOne({ trackingId: req.params.id });
        if (!shipment) return res.status(404).json({ message: 'Package not found' });

        shipment.courierId = courierId;
        shipment.courierName = courierName || courierId;
        if (shipment.status === 'Received' || shipment.status === 'Pending') {
            shipment.status = 'In Transit';
            shipment.history.push({ status: 'In Transit', location: 'Dispatched to Courier' });
        }
        await shipment.save();
        res.json(shipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete / Cancel Shipment (Dispatcher only)
router.delete('/cancel/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'dispatcher') {
            return res.status(403).json({ message: 'Access denied. Dispatchers only.' });
        }
        const shipment = await Shipment.findOneAndDelete({ trackingId: req.params.id });
        if (!shipment) return res.status(404).json({ message: 'Package not found' });
        res.json({ message: 'Shipment cancelled and deleted', trackingId: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Analytics Summary (Dispatcher only)
router.get('/analytics', auth, async (req, res) => {
    try {
        if (req.user.role !== 'dispatcher') {
            return res.status(403).json({ message: 'Access denied. Dispatchers only.' });
        }
        const all = await Shipment.find();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = {
            total: all.length,
            preAdvised: all.filter(s => s.status === 'Pre-advised').length,
            active: all.filter(s => ['Received', 'Pending', 'In Transit', 'Out for Delivery', 'Picked Up'].includes(s.status)).length,
            delivered: all.filter(s => s.status === 'Delivered').length,
            deliveredToday: all.filter(s => s.status === 'Delivered' && new Date(s.createdAt) >= today).length,
            withGPS: all.filter(s => s.destinationLat && s.destinationLng).length,
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get My Tasks (Courier)
router.get('/courier/tasks', auth, async (req, res) => {
    try {
        if (req.user.role !== 'courier') {
            return res.status(403).json({ message: 'Access denied. Couriers only.' });
        }
        const shipments = await Shipment.find({ courierId: req.user.id, status: { $ne: 'Delivered' } }).sort({ createdAt: -1 });
        res.json(shipments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

