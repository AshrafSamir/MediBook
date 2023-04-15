const mongoose=require('mongoose');

 const doctoTimeSlots=mongoose.Schema({
    doctorId:{type:mongoose.Schema.Types.ObjectId,ref:'user', require:true},
    schedule:[{
        from:{type:Date},
        to:{type:Date},
        day:{type:Date},
        maxReservations:{type:Number},
        fullyBooked:{type:Boolean,default:false}
    }]
});
module.exports = mongoose.model('doctorTimeSlot', doctoTimeSlots);

// {days,fromDay,from,to,maxRes,["arrayOfHolidys"]}
//    30    16/4  12   4   200