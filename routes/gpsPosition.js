const express = require('express');
const router = express.Router();
const User = require("../models/users");
const GPSPosition = require('../models/gpsPosition');

router.get('/nearby', async (req, res) => {
  const { longitude, latitude } = req.query;

  const radiusInRadians = 30 / 6371; // Convertir 30 mètres en radians

  try {
    const positions = await GPSPosition.find({
      coordinates: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInRadians]
        }
      }
    });

    const users = await User.find({ gpsPosition: { $in: positions.map(position => position._id) } });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/position/:id/gps', async (req, res) => {
    const { id } = req.params;
    const { longitude, latitude } = req.body;
  
    try {
      // Créer un nouveau document GPSPosition avec les coordonnées fournies et l'ID utilisateur
      const position = new GPSPosition({
        uniqueId: id,
        type: 'Point',
        coordinates: [longitude, latitude]
      });
  
      await position.save();
  
      res.json(position);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  


module.exports = router;
