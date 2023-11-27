require("dotenv").config();
require("./models/v1/connection");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/v1/index");
var usersRouter = require("./routes/v1/users");
var signinRouter = require("./routes/v1/signin");
var signupRouter = require("./routes/v1/signup");
var uploadPhotoRouter = require("./routes/v1/uploadPhoto");
var profilsRouter = require("./routes/v1/profils");
var roomsRouter = require("./routes/v1/rooms");
var roomProfilesRouter = require("./routes/v1/roomProfiles");
var signupAdminRouter = require("./routes/v1/signupAdmin");
var signinAdminRouter = require("./routes/v1/signinAdmin");
var usercontacts = require("./routes/v1/usercontacts");
var gpsPosition = require("./routes/v1/gpsPosition");
var sharingVcf = require("./routes/v1/sharingVcf");
var roles = require("./routes/v1/roles");
var profilNetworkLink = require("./routes/v1/profilNetworkLink")

var app = express();
const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/v1", indexRouter);
app.use("/v1/users", usersRouter);
app.use("/v1/signin", signinRouter);
app.use("/v1/signup", signupRouter);
app.use("/v1/uploadPhoto", uploadPhotoRouter);
app.use("/v1/profils", profilsRouter);
app.use("/v1/rooms", roomsRouter);
app.use("/v1/roomProfiles", roomProfilesRouter);
app.use("/v1/signupAdmin", signupAdminRouter);
app.use("/v1/signinAdmin", signinAdminRouter);
app.use("/v1/usercontacts", usercontacts);
app.use("/v1/gpsPosition", gpsPosition);
app.use("/v1/sharingVcf", sharingVcf);
app.use("/v1/roles", roles);
app.use("/v1/profilNetworkLink", profilNetworkLink);



module.exports = app;
