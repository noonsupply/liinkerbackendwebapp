const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  roomCode: {
    type: String,
    required: true
  },
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
