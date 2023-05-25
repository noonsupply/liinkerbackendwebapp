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
var profils = require("./routes/profils");

var app = express();

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
app.use("/profils", profils);

module.exports = app;
