const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'No token, authorization denied' 
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is verified
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User no longer exists' 
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        success: false, 
        error: 'Please verify your email address before accessing this resource',
        requiresEmailVerification: true
      });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ 
      success: false, 
      error: 'Token is not valid' 
    });
  }
};