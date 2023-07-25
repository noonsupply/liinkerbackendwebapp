const express = require('express');
const router = express.Router();
const User = require("../models/users");
const GPSPosition = require('../models/gpsPosition');

router.get('/nearby', async (req, res) => {
  let { longitude, latitude } = req.query;

  // Vérifiez si la longitude et la latitude sont présentes
  if (!longitude || !latitude) {
    return res.status(400).json({ message: 'Les coordonnées de longitude et de latitude sont requises.' });
  }

  // Essayez de convertir les coordonnées en nombre
  longitude = parseFloat(longitude);
  latitude = parseFloat(latitude);

  // Vérifiez si la conversion a réussi
  if (isNaN(longitude) || isNaN(latitude)) {
    return res.status(400).json({ message: 'Les coordonnées de longitude et de latitude doivent être des nombres.' });
  }

  const radiusInRadians = 30 / 6371; // Convertir 30 mètres en radians
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); // Calculer l'heure qu'il était il y a 30 minutes

  try {
    const positions = await GPSPosition.find({
      coordinates: {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInRadians]
        }
      },
      updatedAt: {
        $gte: thirtyMinutesAgo,
      }
    });

    const users = await User.find({ gpsPosition: { $in: positions.map(position => position._id) } });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




router.put('/position/:id/gps', async (req, res) => {
  const { id } = req.params;
  const { longitude, latitude, profileId } = req.body;

  try {
    let position = await GPSPosition.findOne({ profileId: profileId });

    if (position) {
      // Si un document existe déjà pour cet utilisateur, mettez-le à jour
      position.type = 'Point';
      position.coordinates = [longitude, latitude];
      position.updatedAt = Date.now();
    } else {
      // Si aucun document n'existe pour cet utilisateur, créez-en un nouveau
      position = new GPSPosition({
        uniqueId: id,
        profileId: profileId,
        type: 'Point',
        coordinates: [longitude, latitude]
      });
    }

    await position.save();

    res.json(position);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
