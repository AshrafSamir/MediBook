const bookingRoute = require("express").Router();
const auth = require("../middleware/auth");
const { createBooking,
        addBookingData, 
        getAllBookings,
        getBookingById,
        getBookingData,
        getBookingbyPatientId,
        getUserBookings,
        addDoctorInstructions,
        endBooking,
        patientHistory,
} = require("../controllers/booking.controller");
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
bookingRoute.get("/allbookings",getAllBookings)
bookingRoute.get("/booking/:id",getBookingById)
bookingRoute.get("/bookingdata/:id",getBookingData)
bookingRoute.get("/userbookings/:id",getUserBookings)
bookingRoute.patch("/addDoctorInstructions/:id",auth,addDoctorInstructions)
bookingRoute.patch("/endBooking/:id",auth,endBooking)
bookingRoute.get("/patientHistory/:id",patientHistory)
module.exports = bookingRoute;
