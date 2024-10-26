
const jwt = require("jsonwebtoken");

const loginAuth = (req, res, next) => {
  const token = req.header("Authorization");

  try {
    if (!token) {
      return res.status(403).send({ message: "Token doen't exist" });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res
      .status(500)
      .send({ message: "Invalid token", err: err.message, path: "/" });
  }
};

module.exports = loginAuth;
