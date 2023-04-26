const doctorScheduleModel = require("../models/doctorSchedule.model");
const timeSlotsModel = require("../models/timeSlots.model");
const doctorInfo = require("../models/doctorInfo.model");
let userModel = require("../models/user.model")
const moment = require("moment");
const bookingModel = require("../models/booking.model");
const createSchedule = async (req, res) => {
  const {
    holidays,
    fromDate,
    toDate,
    from,
    to,
    maxReservations,
    bookingPrice,
  } = req.body;
  if (req.user.type === "doctor") {
    let schedule = [];
    let date = moment(fromDate);
    let fromTime = moment(from);
    let toTime = moment(to);

    console.log(moment().format("h:mma"));
    let endDate = moment(toDate);
    let isValid = true;
    if (moment(date).isBefore(endDate) && moment(fromTime).isBefore(toTime)) {
      if(holidays.length){
        for (let i = 0; i < holidays.length; i++) {
          isValid = moment(holidays[i]).isBetween(date, endDate);
          if (!isValid) break;
        }
      }
      if (isValid) {
        while (date <= endDate) {
          if (holidays.indexOf(date.format("YYYY-MM-DD")) === -1) {
            let newTimeSlot = await timeSlotsModel.create({
              doctorId: req.params.id,
              date: date.format("YYYY-MM-DD"),
              from: moment(fromTime).add(2, "hours"),
              to: moment(toTime).add(2, "hours"),
              maxReservations,
              fullyBooked: false,
              isHoliday: false,
              bookingPrice,
            });
            schedule.push({
              timeSlotId: newTimeSlot._id,
            });
          } else {
            let newTimeSlot = await timeSlotsModel.create({
              doctorId: req.params.id,
              date: date.format("YYYY-MM-DD"),
              from: moment(fromTime).add(2, "hours"),
              to: moment(toTime).add(2, "hours"),
              maxReservations,
              fullyBooked: false,
              isHoliday: true,
              bookingPrice: 0,
            });
            schedule.push({
              timeSlotId: newTimeSlot._id,
            });
          }

          fromTime.add(1, "days");
          toTime.add(1, "days");
          date.add(1, "days");
        }

        let newSchedule = await doctorScheduleModel.create({
          doctorId: req.params.id,
          schedule,
        });

        res.json({ message: "schedule created successfully", newSchedule });
      } else {
        res.json({ message: "holidays are not in the range of the dates" });
      }
    } else {
      res.json({ message: "invalid interval" });
    }
  } else {
    res.json({ message: "unAuthorized" });
  }
};
const doctorTimeSlots = async (req, res) => {
  const doctorId = req.params.id;
  try {
    let timeSlots = await timeSlotsModel.find({ doctorId });
    if (timeSlots.length) {
      res.json(timeSlots);
    } else {
      throw new Error("this doctor has no timeSlots");
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
};
const getDoctorsInfo = async (req, res) => {
  try {
    let result = await doctorInfo.find({});
    if (result.length) {
      res.json(result);
    } else {
      throw new Error("there is no doctors info");
    }
  } catch (err) {
    res.status(400).json(err.message);
  }
};
const getDoctorIncomes = async (req,res)=>{
  let _id = req.params.id;
  let doctor = await userModel.findOne({_id},{password:0,__v:0});
  let doctorIncomes = [];
  if(doctor){
    let doctorInfo = await userModel.findOne({doctorId:doctor._id})
    let timeSlots = await timeSlotsModel.find({doctorId:doctor._id}).sort({reservations:-1})
    if(timeSlots.length){
      for (let i = 0; i < timeSlots.length; i++) {
        let income = timeSlots[i].reservations * timeSlots[i].bookingPrice;
        doctorIncomes.push({timeSlot:timeSlots[i],income})
      }
      res.json({doctorIncomes})
    }
    else{
      res.json({message:"this doctor has no time Slots"})
    }
  }
  else{
    res.json({message:"invalid user ID"})
  }
}
// const getDoctorAppointments = async(req,res)=>{
//   let _id = req.params.id;
//   let doctor = await userModel.findOne({_id});
//   if(doctor){
//     let timeSlots = await timeSlotsModel.find({doctorId:doctor._id});
//     if(timeSlots.length){
//       for (let i = 0; i < timeSlots.length; i++) {
//         let booking = await bookingModel.fin        
//       }
//     }else{
//       res.json({message:"this doctor has no time slots"})
//     }
//   }
//   else{
//     res.json({message:"invalid user id"})
//   }
// }
  const getTimeSlotBookings = async(req,res)=>{
    let doctorId = req.params.doctorId;
    let timeSlotId = req.params.timeSlotId;
    let timeSlot = await timeSlotsModel.findOne({doctorId,_id:timeSlotId});
    let timeSlotBookings=[]
    if (timeSlot) {
      let bookings = await bookingModel.find({timeSlotId});
      if(bookings.length){
        for (let i = 0; i < bookings.length; i++) {
          let user = await userModel.findOne({_id:bookings[i].patientId},{password:0,__v:0});

          timeSlotBookings.push({...timeSlot._doc,user,...bookings[i]._doc})
        }
        res.json({timeSlotBookings,numberOfBookings:bookings.length})
      }
      else{
        res.json({message: "this time slot has not bookings"})
      }
    }
    else{
      res.json({message:"invalid doctor or time slot id"})
    }
  }
module.exports = { 
    createSchedule,
    doctorTimeSlots,
    getDoctorsInfo,
    getDoctorIncomes,
    getTimeSlotBookings
   };
