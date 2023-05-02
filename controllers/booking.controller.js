const bookingModel = require("../models/booking.model");
const bookingDataModel = require("../models/bookingData.model");
const doctorInfoModel = require("../models/doctorInfo.model");
const doctorScheduleModel = require("../models/doctorSchedule.model");
const timeSlotsModel = require("../models/timeSlots.model");
const userModel = require("../models/user.model");

const createBooking = async (req, res) => {
  let timeSlotId = req.params.id;
  const { username } = req.body;
  let timeSlot = await timeSlotsModel.findOne({
    $and: [{ _id: timeSlotId }, { isHoliday: false }],
  });
  let user = await userModel.findOne({ username }, { password: 0, __v: 0 });
  let doctorInfo = await doctorInfoModel.findOne({
    doctorId: timeSlot.doctorId,
  },{_id:0});
  if (req.user.username === user.username) {
    if (timeSlot) {
      if (timeSlot.fullyBooked === false) {
        let booking = await bookingModel.create({
          patientId: user._id,
          timeSlotId,
          doctorId:timeSlot.doctorId,
          departmentName:doctorInfo.specification
        });
        await timeSlotsModel.updateMany(
          { _id: timeSlotId },
          { $set: { reservations: ++timeSlot.reservations } }
        );
        if (timeSlot.reservations >= timeSlot.maxReservations) {
          await timeSlotsModel.updateMany(
            { _id: timeSlotId },
            { $set: { fullyBooked: true } }
          );
        }
        let doctorUser = await userModel.findOne({_id:timeSlot.doctorId},{password:0, __v:0});
      
    
        let doctor = {...doctorUser._doc,...doctorInfo._doc};
        console.log(doctor);
        
        let reservation = { user, timeSlot, doctor, booking:{...booking._doc,fees:timeSlot.bookingPrice} };
        res.json({ message: "session Booked successfully", reservation });
      } else {
        res.json({ message: "this session is fully booked" });
      }
    } else {
      res.json({ message: "invalid timeSlot ID" });
    }
  } else {
    res.json({ message: "unAuthorized" });
  }
};
const addBookingData = async (req, res) => {
  const bookingId = req.params.id;
  let booking = await bookingModel.findOne({
    $and: [{ _id: bookingId }, { ended: false }],
  });
  if (booking) {
    if (req.user._id.toString() === booking.patientId.toString()) {
      if (req.file === undefined) {
        res.json({ message: "unsupported file type" });
      } else {
        let bookingAttachment = await bookingDataModel.create({
          bookingId,
          data: `http://localhost:3000/${req.file.path}`,
        });
        res.json({
          message: "attachment uploaded successfully",
          bookingAttachment,
        });
      }
    } else {
      res.json({ message: "unAuthorized" });
    }
  } else {
    res.json({ message: "you can't add attachments with this booking" });
  }
};
const getAllBookings = async (req, res) => {
  const bookingsTemp = await bookingModel.find({});
  let bookings = [];
  if (bookingsTemp.length) {
    for (let i = 0; i < bookingsTemp.length; i++) {
      let user = await userModel.findOne(
        { _id: bookingsTemp[i].patientId },
        { password: 0, _v: 0 }
      );
      let timeSlot = await timeSlotsModel.findOne({
        _id: bookingsTemp[i].timeSlotId,
      });
      let doctorInfo = await doctorInfoModel.findOne({
        doctorId: timeSlot.doctorId,
      });
      let doctor = await userModel.findOne(
        { _id: timeSlot.doctorId },
        { password: 0, _v: 0 }
      );
      bookings.push({
        bookingInfo: bookingsTemp[i],
        user,
        timeSlot,
        doctor: { ...doctor._doc, ...doctorInfo._doc },
      });
    }
    if (bookings.length) {
      res.json({ bookings });
    }
  } else {
    res.json({ message: " there is no booking in the system" });
  }
};
const getBookingById = async (req, res) => {
  const _id = req.params.id;
  let bookingTemp = await bookingModel.findOne({ _id });
  let booking = {};
  if (bookingTemp) {
    let user = await userModel.findOne(
      { _id: bookingTemp.patientId },
      { password: 0, _v: 0 }
    );
    let timeSlot = await timeSlotsModel.findOne({
      _id: bookingTemp.timeSlotId,
    });
    let doctorInfo = await doctorInfoModel.findOne({
      doctorId: timeSlot.doctorId,
    });
    let doctor = await userModel.findOne(
      { _id: timeSlot.doctorId },
      { password: 0, _v: 0 }
    );
    booking = {
      ...bookingTemp._doc,
      fees:timeSlot.bookingPrice,
      user,
      timeSlot,
      doctor: { ...doctor._doc, ...doctorInfo._doc },
    };
    res.json({ booking });
  } else {
    res.json({ message: "invalid booking ID" });
  }
};
const getBookingData = async (req, res) => {
  let bookingId = req.params.id;
  let booking = await bookingModel.findOne({ _id: bookingId });
  let bookingData = {};
  if (booking) {
    let bookingDataTemp = await bookingDataModel.find({ bookingId });
    if (bookingDataTemp.length) {
      let user = await userModel.findOne(
        { _id: booking.patientId },
        { password: 0, _v: 0 }
      );
      let timeSlot = await timeSlotsModel.findOne({ _id: booking.timeSlotId });
      let doctorInfo = await doctorInfoModel.findOne({
        doctorId: timeSlot.doctorId,
      });
      let doctor = await userModel.findOne(
        { _id: timeSlot.doctorId },
        { password: 0, _v: 0 }
      );
      bookingData = {
        bookingInfo: booking,
        data: bookingDataTemp,
        user,
        timeSlot,
        doctorInfo,
        doctor,
      };
      res.json({ bookingData });
    } else {
      res.json({ message: "this booking has no data", booking });
    }
}
}
const getUserBookings = async(req,res)=>{
  let userId = req.params.id;
  let user = await userModel.findOne({_id:userId});
  let userBookings = [];
  if(user){
    let bookings = await bookingModel.find({patientId:user._id});
    if(bookings.length){
      for (let i = 0; i < bookings.length; i++) {
          let timeSlot = await timeSlotsModel.findOne({_id:bookings[i].timeSlotId});
          let doctorUser = await userModel.findOne({_id:timeSlot.doctorId});
          let doctorInfo = await doctorInfoModel.findOne({doctorId:doctorUser._id});
          let reservation = { user,
             timeSlot,
             doctor :{...doctorUser._doc,...doctorInfo._doc},
             booking:{...bookings[i]._doc,fees:timeSlot.bookingPrice} 
            };
          userBookings.push(reservation)
      }
      if(userBookings.length){
        res.json({userBookings});
      }
      else{
        res.json({message:"this user has no bookings"})
      }
    }
    else{
      res.json({message:"this user has no bookings"})
    }
  }
  else{
    res.json({message:"invalid user ID"})
  }
}
const addDoctorInstructions = async(req,res)=>{
  let bookingId = req.params.id;
  try{
    const {doctorInstructions,username} = req.body;
    if(req.user.type === "doctor"){
      let booking= await bookingModel.findOne({_id:bookingId});
      if(booking){
        let doctor = await userModel.findOne({username});
        if(doctor){
          await bookingModel.updateOne({_id:bookingId},{$set:{doctorInstructions:doctorInstructions}});
          booking= await bookingModel.findOne({_id:bookingId});
          res.json({message:"instructions added successfully",booking});
        }
        else{
          throw new Error ("invalid doctor ID")
        }
      }
      else{
        
        throw new Error ("invalid booking ID")
      }
    }
    else{
      throw new Error ("unAuthorized")
    }

  }
  catch(err){
    res.status(400).json(err.message)
  }
}
const endBooking = async(req,res)=>{
  const _id=req.params.id;
  try{
    if(req.user.type=="doctor"){
      let booking=await bookingModel.findOne({_id});
      if(booking){
        await bookingModel.updateOne({_id},{$set:{ended:true}});
          booking= await bookingModel.findOne({_id});
          res.json({message:"instructions added successfully",booking});
      }
      else{
        throw new Error ("invalid Booking ID")
      }

    }
    else{
      throw new Error("unAuthorized")
    }
  }
  catch(err){
    res.status(400).json(err.message)
  }
}
module.exports = {
  createBooking,
  addBookingData,
  getAllBookings,
  getBookingById,
  getBookingData,
  getUserBookings,
  addDoctorInstructions,
  endBooking
};

