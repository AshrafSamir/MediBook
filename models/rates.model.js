const mongoose = require("mongoose");

const ratesSchema = mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  rate:{type:Number , default:null}
});
module.exports = mongoose.model("rate", ratesSchema);
