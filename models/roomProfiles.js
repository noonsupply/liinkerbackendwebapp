const mongoose = require('mongoose');

const roomProfileSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profils',
    required: true
  },
  validity: {
    type: Date,
    required: true,
  }
});

const RoomProfile = mongoose.model('roomprofiles', roomProfileSchema);
module.exports = RoomProfile;
