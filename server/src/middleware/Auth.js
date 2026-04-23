const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.userId = decoded.id; // Add this line to provide req.userId for posts routes
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};
