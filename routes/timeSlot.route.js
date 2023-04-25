const timeSlotRoute = require("express").Router();

const { getTimeSlot } = require("../controllers/timeSlots.controller");

timeSlotRoute.get("/getTimeSlot/:id", getTimeSlot);

module.exports = timeSlotRoute;
