const bookingModel = require("../models/booking.model");
const doctorInfoModel = require("../models/doctorInfo.model");
const ratesModel = require("../models/rates.model")
const userModel = require("../models/user.model");
const addRate= async(req,res)=>{
    const doctorId = req.params.id;
    const {username,rate}=req.body;
    if (req.user.username===username){
        let doctor = await doctorInfoModel.findOne({doctorId});
        if(doctor){
            let userRate = await ratesModel.findOne({doctorId,userId:req.user._id});
            if(userRate){
                res.json({message:"can't add new rate for the same doctor"});
            }
            else{
                userRate = await ratesModel.create({doctorId,userId:req.user._id,rate});
                let doctorRates = await ratesModel.find({doctorId});
                console.log(doctorRates);
                if(doctorRates.length){
                    let ratesTemp = []
                    for (let i = 0; i < doctorRates.length; i++) {
                        ratesTemp.push(doctorRates[i].rate);
                    }
                    let  doctorRate= ratesTemp.reduce((accumulator, currentValue)=>accumulator+currentValue)/doctorRates.length;
                    await doctorInfoModel.updateMany({doctorId},{$set:{doctorRate:doctorRate}});
                    let doctor = await doctorInfoModel.findOne({doctorId});
                    res.json({message:"rateAdded successfully",userRate,doctor})
                }
                else{
                    res.json({message:"there is no rates for this doctor"})
                }
            }
        }
        else{
            res.json({message:"invalid Doctor ID"})
        }
    }else{
        res.json({ message: "unAuthorized" });
    }
}


module.exports = {
    addRate,

};

