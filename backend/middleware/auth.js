const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
    const token = req.cookies.accessToken || req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user from DB to ensure role is current (Token might have stale role)
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ message: 'User no longer exists' });

        // Normalize role to lowercase for consistent checking
        if (user.role) user.role = user.role.toLowerCase();

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
