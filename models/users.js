const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    // You should hash passwords before saving to DB
    type: String,
    required: true,
  },
  //photo: String,
  firstname: String,
  lastname: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  uniqueId: { type: String, unique: true }, //token uuid4
});

module.exports = mongoose.model("users", UserSchema);
