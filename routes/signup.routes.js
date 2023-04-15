const signupRoute = require("express").Router();
const {signup,createUser} = require('../controllers/signup.controller')
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/profileImages')
    },
    filename: function (req, file, cb) {
        x=file.originalname.replace(/\s+/g, '');
      cb(null, Date.now()+x  )
    }
  })    
  function fileFilter (req, file, cb) {
    let extension = file.mimetype;
    if(extension!="image/png"&&extension!="image/jpg"&&extension!="image/jpeg"&&extension!="image/webp"){
        cb(null,false);
    }
    else{
        cb(null , true);
    }   
  }
  const userImage = multer({dest:'uploads/profileImages',storage , fileFilter });
signupRoute.post('/signup',userImage.single("profileImage"),signup)
signupRoute.post('/createUser',userImage.single("profileImage"),createUser)




module.exports=signupRoute;