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
} = require("../controllers/user.controller");
const multer = require("multer");
const { getDoctorIncomes, getDoctorBookings } = require("../controllers/doctorSchedule.controller");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profileImages");
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
    extension != "image/webp"
  ) {
    cb(null, false);
  } else {
    cb(null, true);
  }
}
const userImage = multer({
  dest: "uploads/profileImages",
  storage,
  fileFilter,
});
userRoute.post("/signin", signin);
userRoute.post("/signup", userImage.single("profileImage"), signup);
userRoute.post(
  "/createUser",
  userImage.single("profileImage"),
  auth,
  createUser
);
userRoute.delete("/deleteuser/:id", auth, deleteUser);
userRoute.patch(
  "/updateuser/:id",
  userImage.single("profileImage"),
  auth,
  updateUser
);
userRoute.get("/allusers", getAllUsers);
userRoute.get("/user/:id", getUserByid);
userRoute.get("/alldoctors", getAllDoctors);
userRoute.get("/alladmins", getAllAdmins);
userRoute.get("/allclients", getAllClients);
userRoute.get("/searchDoctors", searchDoctors);
userRoute.get("/getdoctorincomes/:id", getDoctorIncomes);
userRoute.get("/getdoctorbookings/:id", getDoctorBookings);
userRoute.get("/usercount", userCounts);

module.exports = userRoute;
