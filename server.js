const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const signupRoute = require("./routes/signup.routes");
const signinRoute = require("./routes/signin.routes");
const doctorScheduleRoute = require("./routes/doctorSchedule.routes");
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "server running successfully" });
});

app.use(signupRoute);
app.use(signinRoute);
app.use(doctorScheduleRoute);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(process.env.PORT, () => {
  console.log("http://localhost:3000/");
});
