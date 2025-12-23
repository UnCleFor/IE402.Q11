const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  // format "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);// Giải mã token
    req.user = decoded; // Gắn thông tin user vào req để các middleware/controller sau có thể sử dụng
    next(); //
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;
