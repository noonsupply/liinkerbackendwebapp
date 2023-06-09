const mongoose = require('mongoose');

const roomProfileSchema = new mongoose.Schema({
  roomId: {
    type: String,
    ref: 'Room',
    required: true
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profils',
    required: true
  },
  validity: {
    type: Date,
    required: true,
  }
});

const RoomProfile = mongoose.model('RoomProfile', roomProfileSchema);
module.exports = RoomProfile;
