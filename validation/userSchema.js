const Joi = require("joi");
const { model } = require("mongoose");

const userSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  username: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string(),
  gender: Joi.string().valid("male", "female"),
  type: Joi.string().valid("patient", "doctor", "admin"),
  imageUrl: Joi.string().allow(null),
  doctorSpecification: Joi.object({
    specification: Joi.string(),
    role: Joi.string().valid("human", "veterinary").default("human"),
  }),
  clinicAddress: Joi.string().min(1),
  availability: Joi.boolean().default(true),
  //   mobilePhone: Joi.string().pattern(/^[0-9]{11}$/),
  //   registrationDate: Joi.date().iso(),
});

module.exports = { userValidation: userSchema };

// const { error, value } = userSchema.validate(userInput);

// if (error) {
//   console.log(error.details[0].message);
// } else {
//   console.log(value);
// }
