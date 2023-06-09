const doctorScheduleModel = require("../models/doctorSchedule.model");
const timeSlotsModel = require("../models/timeSlots.model");
const doctorInfo = require("../models/doctorInfo.model");
let userModel = require("../models/user.model")
const moment = require("moment");
const bookingModel = require("../models/booking.model");
const doctorInfoModel = require("../models/doctorInfo.model");
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
    res.status(200).json(err.message);
  }
};
const timeSlotById = async(req,res)=>{
  try{
    let _id = req.params.id;
    let timeSlot = await timeSlotsModel.findOne({_id});
    if(timeSlot){
      let doctorUser = await userModel.findOne({_id:timeSlot.doctorId});
      let doctorInfo = await doctorInfoModel.findOne({doctorId:timeSlot.doctorId});
      let doctor = { ...doctorUser._doc,...doctorInfo._doc};
      res.json({...timeSlot._doc,...doctor});
    }
    else{
      throw new Error( "invalid timeSlot ID");
    }
  }
  catch(err){
    res.status(200).json(err.message);
  }
}
const getDoctorsInfo = async (req, res) => {
  try {
    let result = await doctorInfo.find({});
    if (result.length) {
      res.json(result);
    } else {
      throw new Error("there is no doctors info");
    }
  } catch (err) {
    res.status(200).json(err.message);
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
    let doctor={};
    let timeSlotBookings=[]
    if (timeSlot) {
      let doctorUser = await userModel.findOne({_id:timeSlot.doctorId});
      let doctorInfo= await doctorInfoModel.findOne({doctorId:doctorUser._id},{_id:0});
      doctor={...doctorUser._doc,...doctorInfo._doc}
      let bookings = await bookingModel.find({timeSlotId});
      if(bookings.length){
        for (let i = 0; i < bookings.length; i++) {
          let user = await userModel.findOne({_id:bookings[i].patientId},{password:0,__v:0});

          timeSlotBookings.push({user,...bookings[i]._doc})
        }
        res.json({timeSlotBookings,numberOfBookings:bookings.length,doctor,date:timeSlot.date,from:timeSlot.from,to:timeSlot.to})
      }
      else{
        res.json({message: "this time slot has not bookings"})
      }
    }
    else{
      res.json({message:"invalid doctor or time slot id"})
    }
  }
  const getDoctorBookings = async(req,res)=>{
    let _id = await req.params.id;
    let doctor = await userModel.findOne({_id});
    let doctorBookings = [];
    if(doctor){
      let timeSlots= await timeSlotsModel.find({doctorId:doctor._id});
      if(timeSlots.length){
        for (let i = 0; i < timeSlots.length; i++) {
          let bookings = await bookingModel.find({timeSlotId:timeSlots[i]._id});
          if(bookings.length){
            for (let j = 0; j < bookings.length; j++) {
              let patient = await userModel.findOne({_id:bookings[j].patientId})
              doctorBookings.push({timeSlot:timeSlots[i],patient,booking:bookings[i]});              
            }
          }          
        }
        if(doctorBookings.length){
          res.json({doctorBookings,numberOfBookings:doctorBookings.length})
        }
        else{
          res.json({message:"there is no bookings for any timeSlot"})
        }
      }
      else{
        res.json({message:"this doctor has no timeSlots"})
      }
    }
    else{
      res.json({message:"invalid user ID"})
    }
  }
  const userDoctorFrequency = async(req,res)=>{
    const _id = req.params.id;
    let userFrequency=[];
    let doctorId="";
    try{
      let user = await userModel.findOne({_id});
      if(user){
        let userBookings = await bookingModel.find({patientId:user._id});
        for (let i = 0; i < userBookings.length; i++) {
          if(doctorId.toString()!=userBookings[i].doctorId.toString()){
            doctorId= userBookings[i].doctorId;
            let frequency = await bookingModel.count({patientId:user._id,doctorId})
            // console.log(doctorId);
            let doctorUser = await userModel.findOne({_id:doctorId},{_id:0})
            // console.log(doctorUser);
            if(frequency){
              userFrequency.push({name:doctorUser.username,value:frequency});
            }
          }
        }
        if(userFrequency.length){
          res.json({userFrequency})
        }
        else{
          throw new Error("this user has no bookings")
        }
      }
      else{
        throw new Error("invalid User ID")
      }
    }
    catch(err){
      res.status(200).json(err.message);
    }
  }
  const userDepartmentFrequency=async(req,res)=>{
    let _id = req.params.id;
    try{
      let user = await userModel.findOne({_id});
      let bookings = [];
      let userDeptFrequency =[];
      let departmentName=""
      if(user){
        let userBookings = await bookingModel.find({patientId:user._id},{_id:0});;
        for (let i = 0; i < userBookings.length; i++) {
          let doctorInfo= await doctorInfoModel.findOne({doctorId:userBookings[i].doctorId});
          if(departmentName != doctorInfo.specification){
            departmentName = doctorInfo.specification;
            let frequency = await bookingModel.count({patientId:user._id,departmentName});
            if(frequency){
              userDeptFrequency.push({name:departmentName,value:frequency});
            }
          }
        }
        if(userDeptFrequency.length){
          res.json({userDeptFrequency})
        }
        else{
          throw new Error("this user has no bookings")
        }
      }
      else{
        throw new Error("invalid User ID")
      }
    }
    catch(err){
      res.status(200).json(err.message);
    }
  }
  const departmentsFrequency=async(req,res)=>{
    try{
      let bookings = await bookingModel.find({});
      let deptFrequency=[]
      let deptName="";
      if(bookings.length){
        for (let i = 0; i < bookings.length; i++) {
          if(deptName!=bookings[i].departmentName){
            deptName=bookings[i].departmentName
            let frequency = await bookingModel.count({departmentName:deptName});
            deptFrequency.push({name:deptName,value:frequency});
          }
        }
        if(deptFrequency.length){
          res.json({deptFrequency});
        }
        else{
          throw new Error ("there is no bookings")
        }
      }
      else{
        throw new Error("there is no bookings")
      }
    }
    catch(err){
      res.status(200).json(err.message);
    }
  }
  const doctorsFrequency = async(req,res)=>{
    try{
      let bookings = await bookingModel.find({});
      let doctorFrequency =[];
      let doctorId=""
      if(bookings){
        for (let i = 0; i < bookings.length; i++) {
          if(doctorId.toString()!=bookings[i].doctorId.toString()){
            doctorId=bookings[i].doctorId;
            let doctorUser = await userModel.findOne({_id:bookings[i].doctorId});  
            let frequency = await bookingModel.count({doctorId:doctorId});
            doctorFrequency.push({name:doctorUser.username,value:frequency})        
          }
        }
        res.json({doctorFrequency})
      }
      else{
        throw new Error("there is no bookings")
      }
    }
    catch(err){
      res.status(200).json(err.message)
    }
  }
  const doctorTimeSlotGraph = async(req,res)=>{
    let _id = req.params.id
    let graph=[]
    try{
      let doctorInfo = await doctorInfoModel.findOne({doctorId:_id});
      if(doctorInfo){
        let timeSlots = await timeSlotsModel.find({doctorId:_id});
        if(timeSlots){
/**
 * [{name:"25-4",series:{name:00:00-04:00,value:4}}]
 */
          for (let i = 0; i < timeSlots.length; i++) {
            if(timeSlots[i].reservations>0){
              let graphItem={
                name:moment(timeSlots[i].date).format("YYYY-MM-DD"),
                series:[{name:`${moment(timeSlots[i].from).format("hh:mm")}-${moment(timeSlots[i].to).format("hh:mm")}`,
                        value:timeSlots[i].reservations}]
              };
              graph.push(graphItem)
            }
          }

          res.json({graph})
        }
        else{
          throw new Error ("this doctor has no timeSlots")
        }
      }
      else{
        throw new Error ("invalid Doctor ID")
      }
    }
    catch(err){
      res.status(200).json(err.message)
    }
  }

  const userDepartmentOutcomes= async(req,res)=>{
    let _id = req.params.id;
    try{
      let user = await userModel.findOne({_id});
      let timeSlots = [];
      let bookings = [];
      let DeptIncomes =[];
      let departmentName=""
      /**
       * {
    "name": "General Medicine","series": [{"name": "January","value": 125}, {"name": "February","value": 197}, {"name": "March","value": 209
      }
    ]
  }
       */
      if(user){
        let userBookings = await bookingModel.find({patientId:user._id});;
        let deptName = ""
        for (let i = 0; i < userBookings.length; i++) {
          let timeSlot = await timeSlotsModel.findOne({_id:userBookings[i].timeSlotId});
          timeSlots.push({...timeSlot._doc,...userBookings[i]._doc})
        }
       
        deptName="";
        for (let i = 0; i < timeSlots.length; i++) {
          let temp={};
          if(deptName!==timeSlots[i].departmentName){
            deptName=timeSlots[i].departmentName;
            temp.name=deptName;
            temp.series=[]
            for (let j = 3; j >= 0; j--) {
              let frequency = timeSlots.filter((e)=>{
                return moment(e.date).format("MMMM")==moment().subtract(j,"months").format("MMMM")&&e.departmentName===deptName
              }).length;
              let month =moment().subtract(j,"months").format("MMMM")
              temp.series.push({name:month,value:frequency});
            }
            DeptIncomes.push(temp);
          }
        }
        res.json({DeptIncomes})
      }
      else{
        throw new Error("invalid User ID")
      }
    }
    catch(err){
      res.status(200).json(err.message);
    }
  }
module.exports = { 
    createSchedule,
    doctorTimeSlots,
    getDoctorsInfo,
    getDoctorIncomes,
    getTimeSlotBookings,
    getDoctorBookings,
    timeSlotById,
    userDoctorFrequency,
    userDepartmentFrequency,
    departmentsFrequency,
    doctorsFrequency,
    doctorTimeSlotGraph,
    userDepartmentOutcomes
   };


   /*/////////////////
depReservations:any[]=[ {
    "name": "General Medicine",
    "value": 3
  }, {
    "name": "Occupational Therapy",
    "value": 5
  }, {
    "name": "Radiology",
    "value": 7
  }, {
    "name": "Laboratory",
    "value": 9
  }, {
    "name": "Speech Therapy",
    "value": 10
  }]
depEarned: any[]=[{
    "name": "General Medicine",
    "series": [
      {
        "name": "January",
        "value": 125
      }, {
        "name": "February",
        "value": 197
      }, {
        "name": "March",
        "value": 209
      }
    ]
  }, {
    "name": "Occupational Therapy",
    "series": [
      {
        "name": "January",
        "value": 210
      }, {
        "name": "February",
        "value": 255
      }, {
        "name": "March",
        "value": 203
      }
    ]
    */