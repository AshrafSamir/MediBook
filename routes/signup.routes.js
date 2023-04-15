const signupRoute = require("express").Router();
const {signup} = require('../controllers/signup.controller')
signupRoute.post('/signup',signup)




module.exports=signupRoute;