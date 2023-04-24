const rateRoute = require("express").Router();
const auth = require("../middleware/auth");
const {addRate, mostRated} = require("../controllers/rate.controller")

rateRoute.post("/addRate/:id",auth,addRate);
rateRoute.get("/mostrated",mostRated);

module.exports = rateRoute;
