const mongoose = require("mongoose");

const doctorInfoSchema = mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  specification: { type: String },
  role: { type: String, default: "human", enum: ["human", "veterinary"] },
  clinicAddress: { type: String, require: true },
  availability: { type: Boolean, default: true },
  doctorRate: { type: Number, default: null },
  // certificate: {
  //   type: String,
  //   default: null,
  // },
  // status: {
  //   type: String,
  //   default: "pending",
  //   enum: ["pending", "rejected", "accepted"],
  // },
});
module.exports = mongoose.model("doctorInfo", doctorInfoSchema);
