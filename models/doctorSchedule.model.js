const mongoose = require("mongoose");

const doctorScheduleSchema = mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  schedule: [
    {
      date: { type: Date },
      from: { type: Date },
      to: { type: Date },
      maxReservations: { type: Number },
      fullyBooked: { type: Boolean, default: false },
    },
    ,
  ],
});

module.exports = mongoose.model("doctorSchedule", doctorScheduleSchema);

