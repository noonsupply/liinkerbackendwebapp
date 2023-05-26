const mongoose = require("mongoose");

const profilSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    unique: true,
  },
  title: { type: String, trim: true, default: "Pro" },
  firstname: { type: String, trim: true, default: "Firstname" },
  lastName: { type: String, trim: true, default: "Lastname" },
  jobTitle: { type: String, trim: true, default: "Job" },
  email: { type: String, trim: true, default: "Email" },
  website: { type: String, trim: true, default: "Website" },
  phone: { type: String, trim: true, default: "Phone" },
  address: { type: String, trim: true, default: "Adress" },
  city: { type: String, trim: true, default: "City" },
  linkedin: { type: String, trim: true, default: "Linkedin" },
  snapchat: { type: String, trim: true, default: "Snapchat" },
  instagram: { type: String, trim: true, default: "Instagram" },

  // trim supprime les espaces inutiles  avant et aprés la chaine de caractere
});

module.exports = mongoose.model("profils", profilSchema);
