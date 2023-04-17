const mongoose = require("mongoose");

const bookingAttchmentsSchema = mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "booking",
        require: true,
      },
    data:{
        type:String,
    }
    
});
module.exports = mongoose.model("bookingattachment", bookingAttchmentsSchema);
