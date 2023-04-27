const doctorScheduleRoute = require("express").Router();
const auth = require("../middleware/auth");
const {
  createSchedule,
  doctorTimeSlots,
  getDoctorsInfo,
  getTimeSlotBookings,
  timeSlotById
} = require("../controllers/doctorSchedule.controller");

doctorScheduleRoute.post("/createtimeslots/:id", auth, createSchedule);
doctorScheduleRoute.get("/doctorTimeSlots/:id", doctorTimeSlots);
doctorScheduleRoute.get("/getDoctorsInfo", getDoctorsInfo);
doctorScheduleRoute.get("/gettimeSlotbookings/:doctorId/:timeSlotId", getTimeSlotBookings);
doctorScheduleRoute.get("/gettimeslot/:id", timeSlotById);

module.exports = doctorScheduleRoute;
