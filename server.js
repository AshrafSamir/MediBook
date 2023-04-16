const express=require('express');
const app=express();
const mongoose=require('mongoose');
const cors = require('cors');
const path=require('path');
const signupRoute = require('./routes/signup.routes');
const signinRoute = require('./routes/signin.routes');
const port=3000;
app.use(express.json());
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use(cors());
app.get('/',(req,res)=>{
    res.json({message:'server running successfully'});
})
app.use(signupRoute)
app.use(signinRoute)
mongoose.connect('mongodb://127.0.0.1:27017/gpiti',{useNewUrlParser:true , useUnifiedTopology:true});
app.listen(process.env.PORT || port,()=>{
    console.log("http://localhost:3000/");
})