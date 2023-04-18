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
const addBookingData= async(req,res)=>{
    const bookingId= req.params.id;
    let booking = await bookingModel.findOne({$and:[{_id:bookingId},{ended:false}]});
    if(booking){
        // console.log(booking.patientId.toString());
        // console.log(req.user._id.toString());
        if(req.user._id.toString()===booking.patientId.toString()){
            if(req.file===undefined){
                res.json({message:"unsupported file type"})
            }
            else{
                let bookingAttachment = await bookingDataModel.create({bookingId,data:`http://localhost:3000/${req.file.path}`})
                res.json({message:"attachment uploaded successfully",bookingAttachment});
            }
        }
        else{
            res.json({message:"unAuthorized"})
        }
    }
    else{
        res.json({message:"you can't add attachments with this booking"})
    }

}

module.exports={createBooking, addBookingData}