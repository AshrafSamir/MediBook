const { json } = require("express");
const userModel = require("../models/user.model");

const signin = async (req, res) => {
  try {
    const { credential, password } = req.body;
    let user = await userModel.findByCredentials(credential, password);
    let token = await user.generateAuthToken(req, res);
    res.json({
      message: "user signed in successfully",
      user: { ...user._doc, token },
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
};
module.exports = { signin };
