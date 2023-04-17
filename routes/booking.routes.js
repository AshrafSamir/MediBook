const bookingRoute = require("express").Router();
const auth = require("../middleware/auth");
const { createBooking } = require("../controllers/booking.controller");

bookingRoute.post("/book/:id", auth, createBooking);

module.exports = bookingRoute;
