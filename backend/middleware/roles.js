/**
 * Role-based access control guard.
 * Use AFTER the protect middleware.
 *
 * Usage:
 *   router.delete('/:id', protect, restrictTo('superadmin'), deleteOrganizer);
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }
    next();
  };
};

module.exports = { restrictTo };
