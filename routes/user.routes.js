const userRoute = require("express").Router();
const auth = require("../middleware/auth");
const {
  signin,
  signup,
  createUser,
  getAllUsers,
  getUserByid,
  getAllDoctors,
  getAllAdmins,
  getAllClients,
  deleteUser,
  updateUser,
  searchDoctors,
  userCounts,
  getDoctor,
  getDoctorById,
  updateDoctorStatus,
} = require("../controllers/user.controller");
const multer = require("multer");
const {
  getDoctorIncomes,
  getDoctorBookings,
} = require("../controllers/doctorSchedule.controller");
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/profileImages");
//   },
//   filename: function (req, file, cb) {
//     x = file.originalname.replace(/\s+/g, "");
//     cb(null, Date.now() + x);
//   },
// });
var testStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if(file.fieldname==="profileImage"){
      cb(null, "uploads/profileImages");
    }
    else if(file.fieldname==="certificate"){
      cb(null, "uploads/certificates");
    }
  },
  filename: function (req, file, cb) {
    x = file.originalname.replace(/\s+/g, "");
    cb(null, Date.now() + x);
  },
});
function fileFilter(req, file, cb) {
  let extension = file.mimetype;
  if(file.fieldname==="profileImage"){
    if (
      extension != "image/png" &&
      extension != "image/jpg" &&
      extension != "image/jpeg" &&
      extension != "image/webp"
    ) {
      cb(null, false);
    } else {
      cb(null, true);
    }
  }
  else if (file.fieldname==="certificate"){
    if (
      extension != "image/png" &&
      extension != "image/jpg" &&
      extension != "image/jpeg" &&
      extension != "image/webp"&&
      extension!="application/pdf"&&
      extension!="application/msword"
    ) {
      cb(null, false);
    } else {
      cb(null, true);
    }
  }
}
const userImage = multer({
  storage:testStorage,
  fileFilter,
});
userRoute.post("/signin", signin);
userRoute.post("/signup", userImage.fields([{
  name: 'profileImage', maxCount: 1
}, {
  name: 'certificate', maxCount: 1
}]), signup);
// userRoute.post(
//   "/createUser",
//   userImage.single("profileImage"),
//   auth,
//   createUser
// );
userRoute.delete("/deleteuser/:id", auth, deleteUser);
userRoute.patch(
  "/updateuser/:id",
  userImage.single("profileImage"),
  auth,
  updateUser
);
userRoute.patch("/editDoctorStatus/:id",auth,updateDoctorStatus)
userRoute.get("/allusers", getAllUsers);
userRoute.get("/user/:id", getUserByid);
userRoute.get("/alldoctors", getAllDoctors);
userRoute.get("/alladmins", getAllAdmins);
userRoute.get("/allclients", getAllClients);

userRoute.get("/getdoctor/:id", getDoctorById);
userRoute.get("/searchDoctors", searchDoctors);
userRoute.get("/getdoctorincomes/:id", getDoctorIncomes);
userRoute.get("/getdoctorbookings/:id", getDoctorBookings);
userRoute.get("/usercount", userCounts);
userRoute.get("/doctor/:id", getDoctor);

module.exports = userRoute;
