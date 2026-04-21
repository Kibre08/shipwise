const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust Render's load balancer to allow Secure cookies
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL // Support the live Vercel frontend
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or check if the origin is in our allowed list
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Routes
const shipmentRoutes = require('./routes/shipmentRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/shipments', shipmentRoutes);
app.use('/api/auth', authRoutes);

// Basic health check
app.get('/health', (req, res) => res.json({ 
    status: 'ok', 
    project: 'ShipWise',
    environment: process.env.NODE_ENV || 'development'
}));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Production Guard: Ensure MONGO_URI exists
if (!MONGO_URI) {
    console.error('❌ CRITICAL ERROR: MONGO_URI is not defined in environment variables.');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => console.log(`🚀 ShipWise Backend running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error Details:', {
            message: err.message,
            code: err.code,
            name: err.name
        });
        process.exit(1);
    });
