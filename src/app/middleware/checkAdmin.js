const checkAdmin = (req, res, next) => {
  if (!req.user.roles || !req.user.roles.includes("admin")) {
    return res.status(403).json({ message: "Bạn không có quyền truy cập" });
  }
  next();
};

module.exports = checkAdmin;
