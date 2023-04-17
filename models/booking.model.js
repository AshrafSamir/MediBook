const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
    timeSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "timeslot",
        require: true,
      },
    patientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        require:true,
    },
    ended:{
        type:Boolean,
        default:true
    }

});
module.exports = mongoose.model("booking", bookingSchema);
