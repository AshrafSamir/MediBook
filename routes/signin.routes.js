const signinRoute = require("express").Router();
const { signin } = require("../controllers/signin.controller");

signinRoute.post("/signin", signin);

module.exports = signinRoute;
