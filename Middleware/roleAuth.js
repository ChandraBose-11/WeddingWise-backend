const roleAuth = (value) => {
    return (req, res, next) => {
      if (value == req.user.role) {
        next();
      } else {
        res.status(401).json({
          message: "You are not authorized to access this route",
        });
      }
    };
  };
  
  module.exports = roleAuth;