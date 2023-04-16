const doctorScheduleRoute = require("express").Router();
const auth = require("../middleware/auth");
const { createSchedule } = require("../controllers/doctorSchedule.controller");

doctorScheduleRoute.post("/createtimeslots/:id", auth,createSchedule);

module.exports = doctorScheduleRoute;
