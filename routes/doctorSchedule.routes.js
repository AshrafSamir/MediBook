const doctorScheduleRoute = require("express").Router();
const doctorScheduleModel = require("../models/doctorSchedule.model");
const auth = require("../middleware/auth");
const moment = require("moment");

doctorScheduleRoute.post("createtimeslots/:id", auth, async (req, res) => {
  const { holidays, fromDate, toDate, from, to, maxReservation } = req.body;
  if (req.user.type === "doctor") {
    let schedule = [];
    let date = moment(fromDate);
    let endDate = moment(toDate);
    let isValid = true;
    for (let i = 0; i < holidays.length; i++) {
      isValid = moment(holidays[i]).isBetween(date, endDate); // true
      if (!isValid) break;
    }
    if (isValid) {
      while (date <= endDate) {
        if (holidays.indexOf(date.format("YYYY-MM-DD")) === -1) {
          schedule.push({
            date: date.format("YYYY-MM-DD"),
            from,
            to,
            maxReservation,
            fullyBooked: false,
          });
        }
        date.add(1, "days");
      }

      //insert in database

      await doctorScheduleModel.create({
        doctorId: req.params.id,
        schedule,
      });
      res.json({ message: "schedule created successfully", schedule });
    } else {
      res.json({ message: "holidays are not in the range of the dates" });
    }
  }
});

module.exports = doctorScheduleRoute;
