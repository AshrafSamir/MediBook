const jwt = require("jsonwebtoken");
const userModel = require('../models/user.model')
const doctorInforModel = require('../models/doctorInfo.model')
const bcrypt = require("bcrypt");
const signup=async (req,res)=>{
    const { name, username, email, password, gender, type, imageUrl, mobilePhone } =req.body;
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
        await userModel.insertMany(req.body);
        user = await userModel.findOne({username},{password:0})
        let token = await jwt.sign({role:user.type , username : user.username  },user.type)
        // console.log(token);
        res.setHeader("auth",token)
        user.token = token
        console.log(user);
        res.json({message:"User create succesfully",user})
    }
}
const createUser=(req,res)=>{
    res.json({message:"helloCreateUser"})
}
const deleteUser=(req,res)=>{
    res.json({message:"helloDeleteUser"})
}

module.exports={signup}