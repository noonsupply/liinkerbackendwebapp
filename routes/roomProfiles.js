const express = require('express');
const RoomProfile = require('../models/RoomProfiles');
const router = express.Router();


router.post('/room-profiles', async (req, res) => {
    const roomProfile = new RoomProfile({
      roomId: req.body.roomId,
      profileId: req.body.profileId
    });
  
    try {
      const savedRoomProfile = await roomProfile.save();
      res.json(savedRoomProfile);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  

  router.get('/room-profiles/:roomId', async (req, res) => {
    try {
      const roomProfiles = await RoomProfile.find({ roomId: req.params.roomId }).populate('profileId');
      if (roomProfiles == null) {
        return res.status(404).json({ message: 'Cannot find profiles' });
      }
      res.json(roomProfiles);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  module.exports = router;
