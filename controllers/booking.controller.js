const bookingModel = require("../models/booking.model")
const bookingDataModel = require("../models/bookingData.model");
const doctorInfoModel = require("../models/doctorInfo.model");
const doctorScheduleModel = require("../models/doctorSchedule.model");
const timeSlotsModel = require("../models/timeSlots.model");
const userModel = require("../models/user.model");
const createBooking= async(req,res)=>{
    let timeSlotId = req.params.id;
    const {username} = req.body
    let timeSlot = await timeSlotsModel.findOne({$and:[{_id:timeSlotId},{isHoliday:false}]});
    let user = await userModel.findOne({username},{password:0,__v:0})
    if(req.user.username===user.username){ 
        if(timeSlot){
            if(timeSlot.fullyBooked===false){
                let booking = await bookingModel.create({patientId:user._id,timeSlotId});
                await timeSlotsModel.updateMany({_id:timeSlotId},{$set:{reservations:++timeSlot.reservations}});
                if(timeSlot.reservations>=timeSlot.maxReservations){
                    await timeSlotsModel.updateMany({_id:timeSlotId},{$set:{fullyBooked:true}});
                }
                let doctor = await doctorInfoModel.findOne({doctorId:timeSlot.doctorId});
                let reservation = {user,timeSlot,doctor,booking}
                res.json({message:"session Booked successfully",reservation})
            }
            else{
                res.json({message:"this session is fully booked"})
            }
        }
        else{
            res.json({message:"invalid timeSlot ID"})
        }
    }
    else{
        res.json({message:"unAuthorized"})
    }
}


module.exports={createBooking}