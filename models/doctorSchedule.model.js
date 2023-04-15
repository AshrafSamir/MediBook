const mongoose=require('mongoose');

 const doctorScheduleSchema=mongoose.Schema({
    doctorId:{type:mongoose.Schema.Types.ObjectId,ref:'user', require:true},
    schedule:[{
        timeSlotId:{type:mongoose.Schema.Types.ObjectId , ref:'timeslot' , required:false},

    }]
});
module.exports = mongoose.model('doctorSchedule', doctorScheduleSchema);

// {days,fromDay,from,to,maxRes,["arrayOfHolidys"]}
//    30    16/4  12   4   200