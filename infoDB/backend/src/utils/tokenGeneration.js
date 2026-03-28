const jwt = require("jsonwebtoken");

exports.tokenGenerator = (currUser, duration) => {
  return (token = jwt.sign(
    { id: currUser._id, role: currUser.role },
    process.env.JWT_SECRET,
    {
      expiresIn: duration,
    },
  ));
};
