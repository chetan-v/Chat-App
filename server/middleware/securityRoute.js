const jwt = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ message: "token Expired" });
  } else {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Authentication" });
      } else {
        req.user = {
          name: decoded.name,
          email: decoded.email,
          user_id: decoded._id,
        };
        next();
      }
    });
  }
};

module.exports = verifyUser;
