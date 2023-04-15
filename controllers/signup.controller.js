const jwt = require("jsonwebtoken");
const userModel = require('../models/user.model')
const doctorInfoModel = require('../models/doctorInfo.model')
const bcrypt = require("bcrypt");
const {check , validationResult} = require('express-validator');

const signup=async (req,res)=>{
    const { name, username, email, password, gender, type, mobilePhone, clinicAddress, doctorSpecification } =req.body;
    const saltOrRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    req.body.password = hashedPassword
    console.log(req.body.password);
    let user = await userModel.findOne({$or:[{username},{email},{mobilePhone}]});
    console.log(user);
    if(user){
        res.json({message:"already logged"})
    }
    else{
        await userModel.insertMany({...req.body,imageUrl:`http://localhost:3000/${req.file.path}`});
        user = await userModel.findOne({username},{password:0})
        let token = await jwt.sign({role:user.type , username : user.username  },user.type)
        res.setHeader("auth",token)
        console.log({...user}._doc);
        if(user.type==="doctor"){
            await doctorInfoModel.insertMany({doctorId:user._id,clinicAddress,doctorSpecification});
            let doctorInfo = await doctorInfoModel.findOne({doctorId:user._id},{_id:0});         
            console.log("doctor",doctorInfo);   
            user.doctorInfo=doctorInfo;
            res.json({message:"User create succesfully",user:{...user._doc,...doctorInfo._doc,token}});
        }
        else{
            res.json({message:"User create succesfully",user:{...user._doc,token}})
        }
    }
}
const createUser=(req,res)=>{
    res.json({message:"helloCreateUser"})
}
const deleteUser=(req,res)=>{
    res.json({message:"helloDeleteUser"})
}

module.exports={signup}