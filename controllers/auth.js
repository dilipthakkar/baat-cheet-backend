const User = require("../models/user");
var jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  //saving user in db
  const user = User({
    ...req.body,
    conversations: [],
  });
  try {
    const savedUser = await user.save();
    if (savedUser && !savedUser.error) {
      return res.status(200).json({
        isValidateExecution: true,
      });
    } else {
      throw new Error();
    }
  } catch (error) {
    let errorMsg = "error in saving user";
    if (error.code == 11000) {
      errorMsg = "phone number is already register";
    }
    return res.status(400).json({
      isValidateExecution: false,
      error: errorMsg,
    });
  }
};

exports.signin = async (req, res) => {
  const user = req.body;
  try {
    const userInDb = await User.findOne({ phoneNo: user.phoneNo });
    if (!userInDb) throw new Error("user not found");

    if (!userInDb.checkPassword(user.password)) {
      throw new Error("credential doesn't match");
    }

    const token = jwt.sign({ id: userInDb._id }, process.env.JWT_SECRET);
    userInDb.password = undefined;
    userInDb.createdAt = undefined;

    return res.status(200).json({
      isValidateExecution: true,
      user: userInDb,
      token,
    });
  } catch (error) {
    console.log(error);
    console.log({ error: error.message });
    return res.status(400).json({
      isValidateExecution: false,
      error: error.message,
    });
  }
};

exports.isAuthenticate = async (req, res, next) => {
  try {
    const tokenStr = req.headers["authorization"];
    if (!tokenStr) throw new Error("authentication fail due to missing token");
    const token = tokenStr.split(" ")[1];
    let decodeData;
    decodeData = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodeData.id;
    const user = await User.findById(userId);
    if (!user)
      throw new Error("authentication fail due to error in finding user");
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({
      isValidateExecution: false,
      error: error.message,
    });
  }
};

exports.userProfile = async (req, res) => {
  const user = req.user;
  return res.status(200).json({
    isValidateExecution: true,
    user,
  });
};
