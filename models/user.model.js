const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    default: "male",
    enum: ["male", "female"],
    required: true,
  },
  type: {
    type: String,
    default: "patient",
    enum: ["patient", "doctor", "admin"],
    required: true,
  },

  imageUrl: { type: String },
  mobilePhone: { type: String, required: true },
  registrationDate: { type: String },
});

userSchema.methods.generateAuthToken = async function (req, res) {
  const user = this;
  const token = jwt.sign(
    { role: user.type, username: user.username, _id: user._id.toString() },
    process.env.JWT_SECRET
  );

  res.setHeader("auth", token);

  return token;
};

userSchema.statics.findByCredentials = async (credential, password) => {
  let user = await User.findOne({
    $or: [
      { username: credential },
      { email: credential },
      { mobilePhone: credential },
    ],
  });

  if (!user) {
    throw new Error("Can't find user");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  console.log(isMatch);
  if (!isMatch) {
    throw new Error("Wrong Password");
  }

  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }

  next();
});

userSchema.pre("updateMany", async function (next) {
  const user = this;
  let { password } = user._update;
  if (password) {
    user._update.password = await bcrypt.hash(password, 10);
  }

  next();
});

const User = mongoose.model("user", userSchema);

module.exports = User;
