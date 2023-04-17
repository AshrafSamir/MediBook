const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const doctorInfoModel = require("../models/doctorInfo.model");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const { userValidation } = require("../validation/userSchema");

const signup = async (req, res) => {
  const {
    name,
    username,
    email,
    password,
    gender,
    type,
    mobilePhone,
    clinicAddress,
    doctorSpecification,
  } = req.body;

  req.body.password = await userModel.hashPassword(password);
  let user = await userModel.findOne({
    $or: [{ username }, { email }, { mobilePhone }],
  });
  if (user) {
    res.json({ message: "already logged" });
  } else {
    let user = await userModel.create({
      ...req.body,
      imageUrl: `http://localhost:3000/${req.file.path}`,
    });

    let token = await user.generateAuthToken(req, res);

    if (user.type === "doctor") {
      let doctorInfo = await doctorInfoModel.create({
        doctorId: user._id,
        clinicAddress,
        doctorSpecification,
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
  const {
    name,
    username,
    email,
    password,
    gender,
    type,
    mobilePhone,
    clinicAddress,
    doctorSpecification,
  } = req.body;
  if (req.user.type === "admin") {
    let user = await userModel.findOne({
      // validation not correct
      $or: [{ username }, { email }],
    });

    if (user) {
      res.json({ message: "already logged" });
    } else {
      await userModel.insertMany({
        ...req.body,
        imageUrl: `http://localhost:3000/${req.file.path}`,
      });
      user = await userModel.findOne({ username }, { password: 0 });
      if (user.type === "doctor") {
        await doctorInfoModel.insertMany({
          doctorId: user._id,
          clinicAddress,
          doctorSpecification,
        });
        let doctorInfo = await doctorInfoModel.findOne(
          { doctorId: user._id },
          { _id: 0 }
        );
        console.log("doctor", doctorInfo);
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
  let user = await userModel.findOne({ _id });
  console.log(req.user);
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
    console.log(error.details[0].message);
    res.json({ message: error.details[0].message });
  }

  if (req.user.type === "doctor") {
    let { clinicAddress } = req.body;
    await doctorInfoModel.updateMany(
      { doctorId: req.user._id },
      {
        clinicAddress: clinicAddress || req.user.clinicAddress,
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
  res.json({ message: "updated successfully", user: req.user });
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
  if (doctors.length) {
    res.json({ doctors, numberOfDoctors: doctors.length });
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

module.exports = {
  signup,
  createUser,
  getAllUsers,
  getUserByid,
  getAllDoctors,
  getAllAdmins,
  getAllClients,
  deleteUser,
  updateUser,
};
