const mongoose = require("mongoose");

const timeSlotsSchema = mongoose.Schema({
//   doctorId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "user",
//     require: true,
//   },

      date: { type: Date },
      from: { type: Date },
      to: { type: Date },
      maxReservations: { type: Number },
      fullyBooked: { type: Boolean, default: false },
      isHoliday:{type:Boolean,default:false},
    
  
});

module.exports = mongoose.model("timeslot", timeSlotsSchema);

