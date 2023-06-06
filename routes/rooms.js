const express = require('express');
const Room = require('../models/Room');
const RoomProfile = require('../models/RoomProfile');
const router = express.Router();

router.post('/rooms', async (req, res) => {
    const room = new Room({
      roomId: req.body.roomId,
      roomCode: req.body.roomCode
    });
  
    try {
      const savedRoom = await room.save();
      res.json(savedRoom);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  

  router.get('/rooms/:roomId', async (req, res) => {
    try {
      const room = await Room.findOne({ roomId: req.params.roomId });
      if (room == null) {
        return res.status(404).json({ message: 'Cannot find room' });
      }
      res.json(room);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  