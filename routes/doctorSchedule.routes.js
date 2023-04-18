const doctorScheduleRoute = require("express").Router();
const auth = require("../middleware/auth");
const {
  createSchedule,
  doctorTimeSlots,
  getDoctorsInfo,
} = require("../controllers/doctorSchedule.controller");

doctorScheduleRoute.post("/createtimeslots/:id", auth, createSchedule);
doctorScheduleRoute.get("/doctorTimeSlots/:id", doctorTimeSlots);
doctorScheduleRoute.get("/getDoctorsInfo", getDoctorsInfo);
module.exports = doctorScheduleRoute;
