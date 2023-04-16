const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const auth = async (req, res, next) => {
  try {
    const token = req.header("auth");
    // console.log(token);
    const { username, _id } = await jwt.verify(token, "thisisasecretformyapp");
    // console.log(_id,username);
    let user = await userModel.findOne({ _id });
    // console.log(user);
    if (!user) {
      throw new Error();
    }

    req.user = user;

    next();
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = auth;
