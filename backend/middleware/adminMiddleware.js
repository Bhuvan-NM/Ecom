const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = requireAdmin;
