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
const createUser=async (req,res)=>{
    const { name, username, email, password, gender, type, mobilePhone, clinicAddress, doctorSpecification } =req.body;
    let token = req.header("auth")
    console.log("token : ",token);
    if (token) {
        await jwt.verify(token, "admin", async (err, verifiedData) => {
            if (err) {
                res.json({ message: "error in token" });
            }
            else {
                if (verifiedData) {
                    console.log(verifiedData);
                    let user = await userModel.findOne({$or:[{username},{email},{mobilePhone}]});
                    if(user){
                        res.json({message:"already logged"});
                    }
                    else{
                        await userModel.insertMany({...req.body,imageUrl:`http://localhost:3000/${req.file.path}`});
                        user = await userModel.findOne({username},{password:0})
                        if(user.type==="doctor"){
                            await doctorInfoModel.insertMany({doctorId:user._id,clinicAddress,doctorSpecification});
                            let doctorInfo = await doctorInfoModel.findOne({doctorId:user._id},{_id:0});         
                            console.log("doctor",doctorInfo);   
                            user.doctorInfo=doctorInfo;
                            res.json({message:"User create succesfully",user:{...user._doc,...doctorInfo._doc}});
                        }
                        else{
                            res.json({message:"User create succesfully",user:{...user._doc}})
                        }                    
                    }
                }
            }
        }
        )
    }
    else {
        res.json({ message: "there is no tokens", status: "failed" })
    }
}
const deleteUser=(req,res)=>{
    res.json({message:"helloDeleteUser"})
}

const getAllUsers=async (req,res)=>{
    let users = await userModel.find({});
    if(users.length){
        res.json(users);
    }
    else{
        res.json({message:"there is no users"});
    }
}

const getUserByid= async(req,res)=>{
    let _id = req.params.id;
    let user = await userModel.findOne({_id});
    if(!user){
        res.json({message:"invalid user ID"});
    }
    else{
        res.json({user});
    }
}

const getAllDoctors=async (req,res)=>{
    let doctors = await userModel.find({type:"doctor"});
    if(doctors.length){
        res.json(doctors);
    }
    else{
        res.json({message:"there is no doctors"});
    }
}

const getAllAdmins=async(req,res)=>{
    let admins = await userModel.find({type:"admin"});
    if(admins.length){
        res.json(admins);
    }
    else{
        res.json({message:"there is no admins"});
    }
    
}

const getAllClients=async(req,res)=>{
    let clients = await userModel.find({type:"patient"});
    if(clients.length){
        res.json(clients);
    }
    else{
        res.json({message:"there is no clients"});
    }
    
}

module.exports={signup,createUser,getAllUsers,getUserByid,getAllDoctors,getAllAdmins,getAllClients}