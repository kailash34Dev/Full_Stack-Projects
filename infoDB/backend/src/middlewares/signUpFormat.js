exports.signupDataFormat = (req, res, next) => {
  let { email, role, password } = req.body;

  email = email?.trim().toLowerCase();
  password = password?.trim();

  req.body.email = email;
  req.body.password = password;

  next();
};