const mongoose=require('mongoose');

 const doctorInfoSchema=mongoose.Schema({
    doctorId:{type:mongoose.Schema.Types.ObjectId,ref:'user', require:true},
    doctorSpecification:{specification:{type:String},role:{type: String, default: 'patient', enum: ["patient", "doctor", "admin"]}},
    clinicAddress:{type:String,require:true},

});
module.exports = mongoose.model('doctorInfo', doctorInfoSchema);