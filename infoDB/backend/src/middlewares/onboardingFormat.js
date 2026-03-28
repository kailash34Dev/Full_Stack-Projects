const capitalizeFunction = require("../utils/capitalize");

exports.onboardingDataFormat = (req, res, next) => {
  let {
    name,
    dob,
    gender,
    phoneNo,
    whatsAPPNo,
    address,
    city,
    state,
    country,
    pinCode,
    education,
    occupation,
    income,
    maritalStatus,
    bio,
  } = req.body;

  req.body.name = capitalizeFunction.capitalizeWords(name);
  req.body.gender = capitalizeFunction.capitalizeWords(gender);
  req.body.address = capitalizeFunction.capitalizeWords(address);
  req.body.city = capitalizeFunction.capitalizeWords(city);
  req.body.state = capitalizeFunction.capitalizeWords(state);
  req.body.country = capitalizeFunction.capitalizeWords(country);
  req.body.education = capitalizeFunction.capitalizeWords(education);
  req.body.occupation = capitalizeFunction.capitalizeWords(occupation);
  req.body.maritalStatus = capitalizeFunction.capitalizeWords(maritalStatus);
  req.body.bio = capitalizeFunction.capitalizePara(bio);

  next();
};
