const timeSlotRoute = require("express").Router();
const auth = require("../middleware/auth");

const { getTimeSlot } = require("../controllers/timeSlots.controller");

timeSlotRoute.get("/getTimeSlot/:id", auth, getTimeSlot);

module.exports = timeSlotRoute;
