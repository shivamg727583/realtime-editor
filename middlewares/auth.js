const jwt = require("jsonwebtoken");

// Middleware to authenticate JWT token from cookies
module.exports.authenticateToken = (req, res, next) => {
   
  const token = req.cookies.token; // Extract token from cookies

  // If no token found, return 403 (forbidden)
  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  // Verify token
  jwt.verify(token, "jwtSecret", (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    // Attach the user information (decoded from token) to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  });
};
