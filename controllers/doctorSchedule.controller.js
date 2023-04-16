const doctorScheduleModel = require("../models/doctorSchedule.model");
const moment = require("moment");
const createSchedule =  async (req, res) => {
    const { holidays, fromDate, toDate, from, to, maxReservation } = req.body;
    if (req.user.type === "doctor") {
      let schedule = [];
      let date = moment(fromDate);
      let fromTime = moment(from);
      let toTime = moment(to);
      // console.log(date);
      // let time = moment.time("17:21").format("hh:mma")
      console.log(moment().format("h:mma"));
      let endDate = moment(toDate);
      // console.log("is before :", moment(date).isBefore(endDate));
      let isValid = true;
      if (moment(date).isBefore(endDate) && moment(fromTime).isBefore(toTime)) {
        for (let i = 0; i < holidays.length; i++) {
          isValid = moment(holidays[i]).isBetween(date, endDate); // true
          // console.log(i, isValid);
          if (!isValid) break;
        }
        if (isValid) {
          while (date <= endDate) {
            if (holidays.indexOf(date.format("YYYY-MM-DD")) === -1) {
              schedule.push({
                date: date.format("YYYY-MM-DD"),
                from: moment(fromTime).add(2, "hours"),
                to: moment(toTime).add(2, "hours"),
                maxReservation,
                fullyBooked: false,
              });
            }
            fromTime.add(1, "days")
            toTime.add(1, "days")
            date.add(1, "days");
          }
  
          //insert in database
  
          let newSchedule = await doctorScheduleModel.create({
            doctorId: req.params.id,
            schedule,
          });
          console.log("newSchedule",newSchedule);
  
          res.json({ message: "schedule created successfully", newSchedule });
        } 
        else {
          res.json({ message: "holidays are not in the range of the dates" });
        }
      }
      else {
        res.json({ message: "invalid interval" })
      }
    }
    else {
      res.json({ message: "unAuthorized" })
    }
  }

  module.exports={createSchedule}