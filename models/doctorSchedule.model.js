const mongoose=require('mongoose');

 const doctorScheduleSchema=mongoose.Schema({
    doctorId:{type:mongoose.Schema.Types.ObjectId,ref:'user', require:true},

});
module.exports = mongoose.model('doctorSchedule', doctorScheduleSchema);