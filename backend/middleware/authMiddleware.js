import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  try {
    //console.log("Received Cookies:", req.cookies); // ✅ Debugging
    //console.log("Received Headers:", req.headers.authorization); // ✅ Debugging

    // ✅ First, check if token exists in cookies
    let token = req.cookies?.token;

    // ✅ If not found in cookies, check Authorization header
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1]; // Extract "Bearer <token>"
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, please login" });
    }

    // ✅ Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res
      .status(401)
      .json({ message: "Invalid token, please login again" });
  }
};

export default authMiddleware;
