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
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        require:true,
    },
    departmentName:{
        type:String,
        require:true,
    },
    ended:{
        type:Boolean,
        default:false
    },
    doctorInstructions:{
        type:String,
        default:null
    }

});
module.exports = mongoose.model("booking", bookingSchema);
