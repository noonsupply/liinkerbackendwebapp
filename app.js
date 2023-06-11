require("dotenv").config();
require("./models/connection");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var signinRouter = require("./routes/signin");
var signupRouter = require("./routes/signup");
var uploadPhoto = require("./routes/uploadPhoto");
var profilsRouter = require("./routes/profils");
var roomsRouter = require("./routes/rooms");
var roomProfilesRouter = require("./routes/roomProfiles");
var signupAdminRouter = require("./routes/signupAdmin");
var signinAdminRouter = require("./routes/signinAdmin");

var app = express();
const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/signin", signinRouter);
app.use("/signup", signupRouter);
app.use("/upload", uploadPhoto);
app.use("/profils", profilsRouter);
app.use("/rooms", roomsRouter);
app.use("/roomProfiles", roomProfilesRouter);
app.use("/signupAdmin", signupAdminRouter);
app.use("/signinAdmin", signinAdminRouter);

module.exports = app;
