const mongoose = require("mongoose");

const doctorInfoSchema = mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  doctorSpecification: {
    specification: { type: String },
    role: { type: String, default: "human", enum: ["human", "veterinary"] },
  },
  clinicAddress: { type: String, require: true },
  availability: { type: Boolean, default: true },
});
module.exports = mongoose.model("doctorInfo", doctorInfoSchema);
