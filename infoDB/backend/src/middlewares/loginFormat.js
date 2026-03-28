exports.loginDataFormat = (req, res, next) => {
  let { email, password } = req.body;

  email = email?.trim().toLowerCase();
  password = password?.trim();

  req.body.email = email;
  req.body.password = password;

  next();
};
