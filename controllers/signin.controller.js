const jwt = require("jsonwebtoken");
const userModel = require('../models/user.model')
const bcrypt = require("bcrypt")
const signin=async(req,res)=>{
    const {credential,password}=req.body;
    let user = await userModel.findOne({$or:[{username:credential},{email:credential},{mobilePhone:credential}]});
    if(user){
        const match = await bcrypt.compare(password, user.password); 
        if(match){
            let token = await jwt.sign({role:user.type , username : user.username  },user.type)
            res.setHeader("auth",token)
            res.json({message:"user signed in successfully",user:{...user._doc,token}});
        }
        else{
            res.json({message:"wrong password"})
        }
    }
    else{
        res.json({message:"wrong username or email or phone "})
    }

}
module.exports={signin}