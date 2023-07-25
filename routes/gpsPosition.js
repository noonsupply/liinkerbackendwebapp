const express = require('express');
const router = express.Router();
const User = require("../models/users");
const GPSPosition = require('../models/gpsPosition');

const { ObjectId } = require('mongodb'); // Ajouter en haut de votre fichier

router.get('/nearby', async (req, res) => {
  let { longitude, latitude, profileId } = req.query;
  const profileIdObj = new ObjectId(profileId);

  if (!longitude || !latitude) {
    return res.status(400).json({ message: 'Les coordonnées de longitude et de latitude sont requises.' });
  }

  longitude = parseFloat(longitude);
  latitude = parseFloat(latitude);

  if (isNaN(longitude) || isNaN(latitude)) {
    return res.status(400).json({ message: 'Les coordonnées de longitude et de latitude doivent être des nombres.' });
  }

  const thirtyMinutesAgo = new Date(Date.now() - 60 * 1000);

  try {
    const positions = await GPSPosition.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          distanceField: "dist.calculated",
          maxDistance: 30,
          spherical: true
        }
      },
      {
        $match: {
          updatedAt: {
            $gte: thirtyMinutesAgo
          },
          profileId: {
            $ne: profileIdObj
          }
        }
      },
      {
        $lookup: {
          from: "profils",
          localField: "profileId",
          foreignField: "_id",
          as: "profile"
        }
      }
    ]);

    res.json(positions);
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
