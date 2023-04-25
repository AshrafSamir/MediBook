const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const userRoute = require("./routes/user.routes");
const doctorScheduleRoute = require("./routes/doctorSchedule.routes");
const bookingRoute = require("./routes/booking.routes");
const timeSlotRoute = require("./routes/timeSlot.route");

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "server running successfully" });
});

app.use(userRoute);
app.use(doctorScheduleRoute);
app.use(bookingRoute);
app.use(timeSlotRoute);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(process.env.PORT, () => {
  console.log("http://localhost:3000/");
});
