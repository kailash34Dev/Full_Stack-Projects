exports.onboardingValidation = (req, res, next) => {
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

  name = name?.trim();
  phoneNo = phoneNo?.trim();
  whatsAPPNo = whatsAPPNo?.trim();
  address = address?.trim();
  city = city?.trim();
  state = state?.trim();
  country = country?.trim();
  pinCode = pinCode?.trim();
  education = education?.trim();
  occupation = occupation?.trim();
  bio = bio?.trim();

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (!dob) {
    return res.status(400).json({ message: "Date of birth is required" });
  } else {
    const date = new Date(dob);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date of birth" });
    }
  }

  if (!gender) {
    return res.status(400).json({ message: "Gender is required" });
  } else {
    const validGender = ["male", "female", "other"];
    if (!validGender.includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }
  }

  const phoneRegex = /^[6-9]\d{9}$/;

  if (!phoneNo) {
    return res.status(400).json({ message: "Phone no required" });
  } else {
    if (!phoneRegex.test(phoneNo)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }
  }

  if (!whatsAPPNo) {
    return res.status(400).json({ message: "Whatsapp number required" });
  } else {
    if (!phoneRegex.test(whatsAPPNo)) {
      return res.status(400).json({ message: "Invalid whatsapp number" });
    }
  }

  if (!address) {
    return res.status(400).json({ message: "Address is required" });
  }

  if (!city) {
    return res.status(400).json({ message: "City is required" });
  }

  if (!state) {
    return res.status(400).json({ message: "State is required" });
  }

  if (!country) {
    return res.status(400).json({ message: "Country is required" });
  }

  if (!pinCode) {
    return res.status(400).json({ message: "Pin code is required" });
  } else {
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(pinCode)) {
      return res.status(400).json({ message: "Invalid pin code" });
    }
  }

  if (!education) {
    return res.status(400).json({ message: "Education is required" });
  }

  if (!occupation) {
    return res.status(400).json({ message: "Occupation is required" });
  }

  if (!income) {
    return res.status(400).json({ message: "Income is required" });
  }

  if (!maritalStatus) {
    return res.status(400).json({ message: "Marital status is required" });
  } else {
    const validStatus = ["single", "married", "divorced", "widowed"];
    if (!validStatus.includes(maritalStatus)) {
      return res.status(400).json({ message: "Invalid marital status" });
    }
  }

  if (!bio) {
    return res.status(400).json({ message: "Bio is required" });
  } else if (bio.length > 500) {
    return res
      .status(400)
      .json({ message: "Bio must be less than 500 characters" });
  }

  req.body.name = name;
  req.body.phoneNo = phoneNo;
  req.body.whatsAPPNo = whatsAPPNo;
  req.body.address = address;
  req.body.city = city;
  req.body.state = state;
  req.body.country = country;
  req.body.pinCode = pinCode;
  req.body.education = education;
  req.body.occupation = occupation;
  req.body.bio = bio;

  next();
};
