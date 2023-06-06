const mongoose = require('mongoose');

const roomProfileSchema = new mongoose.Schema({
  roomId: {
    type: String,
    ref: 'Room',
    required: true
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }
});

const RoomProfile = mongoose.model('RoomProfile', roomProfileSchema);
module.exports = RoomProfile;
