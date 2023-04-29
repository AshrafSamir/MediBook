const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const doctorInfoModel = require("../models/doctorInfo.model");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const { userValidation } = require("../validation/userSchema");

const signin = async (req, res) => {
  try {
    const { credential, password } = req.body;
    console.log(req.body);
    let user = await userModel.findByCredentials(credential, password);
    let token = await user.generateAuthToken(req, res);
    res.json({
      message: "user signed in successfully",
      user: { ...user._doc, token },
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const signup = async (req, res) => {
  const {
    username,
    email,
    imageUrl,
    mobilePhone,
    clinicAddress,
    specification,
    role,
  } = req.body;

  let user = await userModel.findOne({
    $or: [{ username }, { email }, { mobilePhone }],
  });
  if (user) {
    res.json({ message: "already logged" });
  } else {
    if (req.file) {
      user = await userModel.create({
        ...req.body,
        imageUrl: `http://localhost:3000/${req.file.path}`,
      });
    } else {
      user = await userModel.create({
        ...req.body,
      });
    }

    let token = await user.generateAuthToken(req, res);

    if (user.type === "doctor") {
      let doctorInfo = await doctorInfoModel.create({
        doctorId: user._id,
        clinicAddress,
        specification,
        role,
      });
      user.doctorInfo = doctorInfo;
      res.json({
        message: "User create succesfully",
        user: { ...user._doc, ...doctorInfo._doc, token },
      });
    } else {
      res.json({
        message: "User create succesfully",
        user: { ...user._doc, token },
      });
    }
  }
};

const createUser = async (req, res) => {
  const { username, email, mobilePhone, clinicAddress, specification, role,type } =
    req.body;
  if (req.user.type === "admin") {
    let user = await userModel.findOne({
      $or: [{ username }, { email }, { mobilePhone }],
    });
    if (user) {
      res.json({ message: "User already exist" });
    } else {
      let user = await userModel.create({
        ...req.body,
        imageUrl: `http://localhost:3000/${req.file.path}`,
      });
      if (user.type === "doctor") {
        let doctorInfo = await doctorInfoModel.create({
          doctorId: user._id,
          clinicAddress,
          specification,
          role,
        });
        user.doctorInfo = doctorInfo;
        res.json({
          message: "User create succesfully",
          user: { ...user._doc, ...doctorInfo._doc },
        });
      } else {
        res.json({
          message: "User create succesfully",
          user: { ...user._doc },
        });
      }
    }
  }
};

const deleteUser = async (req, res) => {
  let _id = req.params.id;
  if (req.user.type === "admin") {
    await userModel.deleteOne({ _id });
    user = await userModel.findOne({ _id });
    if (!user) {
      res.json({ message: "user Deleted successfully" });
    } else {
      res.json({ message: "error in deletion" });
    }
  }
};

const updateUser = async (req, res) => {
  const { error, value } = userValidation.validate(req.body);

  if (error) {
    res.json({ message: error.details[0].message });
  }
  if (req.user.type === "doctor") {
    let { clinicAddress, specification, role } = req.body;
    // needs input validation with joi
    await doctorInfoModel.updateMany(
      { doctorId: req.user._id },
      {
        clinicAddress,
        specification,
        role,
      }
    );
  }
  let _id = req.user._id;
  await userModel.updateMany(
    { _id },
    {
      ...req.body,
      imageUrl: req.file
        ? `http://localhost:3000/${req.file.path}`
        : req.user.imageUrl,
    }
  );
  let updatedUser = await userModel.find({
    _id: req.user._id,
  });
  res.json({ message: "updated successfully", user: updatedUser });
};

const getAllUsers = async (req, res) => {
  let users = await userModel.find({});
  if (users.length) {
    res.json({ users, numberOfUsers: users.length });
  } else {
    res.json({ message: "there is no users" });
  }
};

const getUserByid = async (req, res) => {
  let _id = req.params.id;
  let user = await userModel.findOne({ _id });
  if (!user) {
    res.json({ message: "invalid user ID" });
  } else {
    res.json({ user });
  }
};

const getAllDoctors = async (req, res) => {
  let doctors = await userModel.find({ type: "doctor" });
  let allDoctorsData = [];
  for (let i = 0; i < doctors.length; i++) {
    let doctorInfo = await doctorInfoModel.findOne({
      doctorId: doctors[i]._id,
    });
    console.log(doctors[i]._id);
    allDoctorsData.push({ ...doctors[i]._doc, ...doctorInfo._doc });
  }
  if (doctors.length) {
    res.json({ allDoctorsData, numberOfDoctors: doctors.length });
  } else {
    res.json({ message: "there is no doctors" });
  }
};

const getAllAdmins = async (req, res) => {
  let admins = await userModel.find({ type: "admin" });
  if (admins.length) {
    res.json({ admins, numberOfAdmins: admins.length });
  } else {
    res.json({ message: "there is no admins" });
  }
};

const getAllClients = async (req, res) => {
  let clients = await userModel.find({ type: "patient" });
  if (clients.length) {
    res.json({ clients, numberOfClients: clients.length });
  } else {
    res.json({ message: "there is no clients" });
  }
};

/**
 * [ ]
 */

const searchDoctors = async (req, res) => {
  
  const {name, specification, clinicAddress}= req.query
  let doctorInfoKeys = {}
  let doctorUserKeys={}
  name?doctorUserKeys.name=name:null;
  console.log("doctorUserKeys",doctorUserKeys);
  let doctors = await userModel.find({$and:[{type: "doctor"},{...doctorUserKeys}]});
  console.log("doctors",doctors);
  let allDoctorsData = [];
  specification?doctorInfoKeys.specification=specification:null;
  clinicAddress?doctorInfoKeys.clinicAddress=clinicAddress:null;
  console.log("doctorInfoKeys",{...doctorInfoKeys});
  for (let i = 0; i < doctors.length; i++) {
    let doctorInfo = await doctorInfoModel.findOne({
      doctorId: doctors[i]._id,...doctorInfoKeys
    });
    // console.log(doctors[i]._id);
    console.log(doctorInfo);
    if(doctorInfo){
      allDoctorsData.push({ ...doctors[i]._doc, ...doctorInfo._doc });
    }
  }
  if (doctors.length) {
    res.json({ allDoctorsData, numberOfDoctors: doctors.length });
  } else {
    res.json({ message: "there is no doctors" });
  }
};
const userCounts = async(req,res)=>{
  let users = await userModel.count({});
  let admins = await userModel.count({type:"admin"});
  let patients = await userModel.count({type:"patient"});
  let doctors = await userModel.count({type:"doctor"});
  try{
    if(users){
      res.json({numberOfUsers:users,numberOfAdmins:admins,numberOfDoctors:doctors,numberOfClients:patients})
    }
    else{
      throw new Error( "no users");
    }
  }
  catch(err){
    res.status(400).json(err.message);
  }
}
const getDoctorById = async(req,res)=>{
  let _id = req.params.id;
  try{
    let doctorUser = await userModel.findOne({_id});
    let doctor={}
    if(doctorUser){
      let doctorInfo = await doctorInfoModel.findOne({doctorId:doctorUser._id});
      doctor={...doctorUser._doc,...doctorInfo._doc};
      res.json({doctor});
    } 
    else{
      throw new Error("invalid doctor Id");
    }
  }
  catch(err){
    res.status(200).json(err.message);
  }

}
module.exports = {
  signin,
  signup,
  createUser,
  getAllUsers,
  getUserByid,
  getAllDoctors,
  getAllAdmins,
  getAllClients,
  deleteUser,
  updateUser,
  searchDoctors,
  userCounts,
  getDoctorById
};
