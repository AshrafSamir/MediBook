const bookingRoute = require("express").Router();
const auth = require("../middleware/auth");
const { createBooking, addBookingData } = require("../controllers/booking.controller");
const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/bookingAttachments");
  },
  filename: function (req, file, cb) {
    x = file.originalname.replace(/\s+/g, "");
    cb(null, Date.now() + x);
  },
});
function fileFilter(req, file, cb) {
  let extension = file.mimetype;
  if (
    extension != "image/png" &&
    extension != "image/jpg" &&
    extension != "image/jpeg" &&
    extension != "image/webp" &&
    extension!="application/pdf"&&
    extension!="application/msword"
  ) {
    cb(null, false);
  } else {
    cb(null, true);
  }
}
const bookingAttachments = multer({
  dest: "uploads/bookingAttachments",
  storage,
  fileFilter,
});
bookingRoute.post("/book/:id", auth, createBooking);
bookingRoute.post("/addbookingdata/:id", auth, bookingAttachments.single("bookingAttachment"), addBookingData);

module.exports = bookingRoute;
