const doctorScheduleRoute = require("express").Router();
const auth = require("../middleware/auth");
const {
  createSchedule,
  doctorTimeSlots,
  getDoctorsInfo,
  getTimeSlotBookings,
  timeSlotById,
  userDoctorFrequency,
  userDepartmentFrequency
} = require("../controllers/doctorSchedule.controller");

doctorScheduleRoute.post("/createtimeslots/:id", auth, createSchedule);
doctorScheduleRoute.get("/doctorTimeSlots/:id", doctorTimeSlots);
doctorScheduleRoute.get("/getDoctorsInfo", getDoctorsInfo);
doctorScheduleRoute.get("/gettimeSlotbookings/:doctorId/:timeSlotId", getTimeSlotBookings);
doctorScheduleRoute.get("/gettimeslot/:id", timeSlotById);
doctorScheduleRoute.get("/userDoctorsFrequency/:id", userDoctorFrequency);
doctorScheduleRoute.get("/userDepartmentFrequency/:id", userDepartmentFrequency);

module.exports = doctorScheduleRoute;
