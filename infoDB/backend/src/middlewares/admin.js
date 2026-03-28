exports.verifyAdmin = (req, res, next) => {
  if (!req.currUser || req.currUser.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }

  next();
};
