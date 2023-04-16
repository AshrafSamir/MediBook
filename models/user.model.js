const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  type: {
    type: String,
    default: "patient",
    enum: ["patient", "doctor", "admin"],
    required: true,
  },
  //    doctorSpecification:{type:{specification:String,role:String ,default:"human" ,enum:["human","veterinary"]}},
  imageUrl: { type: String },
  mobilePhone: { type: String },
  registrationDate: { type: String },
});
module.exports = mongoose.model("user", userSchema);
