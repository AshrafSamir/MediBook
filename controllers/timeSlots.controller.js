const timeSlotsModel = require("../models/timeSlots.model");

const getTimeSlot = async (req, res) => {
  try {
    console.log(req.params.id, "asd");
    const timeSlot = await timeSlotsModel.findById(req.params.id);

    res.status(200).json(timeSlot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getTimeSlot };
