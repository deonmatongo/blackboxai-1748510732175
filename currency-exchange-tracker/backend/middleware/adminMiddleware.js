const adminMiddleware = (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: Admins only' });
    }
  } catch (error) {
    console.error('Error in adminMiddleware:', error.message);
    res.status(500).json({ message: 'Internal server error in admin middleware' });
  }
};

module.exports = adminMiddleware;