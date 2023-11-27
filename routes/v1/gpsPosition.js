const express = require("express");
const router = express.Router();
const GPSPosition = require("../../models/v1/gpsPosition");
const { ObjectId } = require("mongodb");

// Pour validation
const isValidCoordinates = (longitude, latitude) =>
  longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;

const getAllProfileIdsForUser = async (uniqueId) => {
  try {
    const positions = await GPSPosition.find({ uniqueId: uniqueId });
    return positions.map((position) => position.profileId);
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des profileIds pour uniqueId:",
      err
    );
    throw err; // ou vous pourriez retourner un tableau vide [] si vous préférez gérer les erreurs de cette façon
  }
};

router.get("/nearby", async (req, res) => {
  const { longitude, latitude, profileId, uniqueId } = req.query;

  // Validation des coordonnées et du profileId
  if (!longitude || !latitude || !profileId || !uniqueId) {
    return res
      .status(400)
      .json({ message: "Longitude, latitude et profileId sont requis." });
  }

  const parsedLongitude = parseFloat(longitude);
  const parsedLatitude = parseFloat(latitude);

  if (!isValidCoordinates(parsedLongitude, parsedLatitude)) {
    return res.status(400).json({ message: "Coordonnées invalides." });
  }

  // Récupérez tous les profileIds associés à ce userId
  const userProfiles = await getAllProfileIdsForUser(uniqueId);

  // Calculate the time 30 minutes ago
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  try {
    const positions = await GPSPosition.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parsedLongitude, parsedLatitude],
          },
          distanceField: "dist.calculated",
          maxDistance: 100,
          spherical: true,
        },
      },
      {
        $match: {
          profileId: { $nin: userProfiles }, //pour exclure le profil de l'utilisateur
          updatedAt: { $gte: thirtyMinutesAgo },
        },
      },
      {
        $lookup: {
          from: "profils",
          localField: "profileId",
          foreignField: "_id",
          as: "profile",
        },
      },
    ]);

    if (positions.length === 0) {
      return res.json({ message: "Vous semblez être seul ici." });
    }

    const profiles = positions.map(position => position.profile[0]);
    res.json({ data: profiles });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/position/:id/gps", async (req, res) => {
  const { id } = req.params;
  const { longitude, latitude, profileId } = req.body;

  // Validation des coordonnées et du profileId
  if (!longitude || !latitude || !profileId) {
    return res
      .status(400)
      .json({ message: "Longitude, latitude et profileId sont requis." });
  }

  const parsedLongitude = parseFloat(longitude);
  const parsedLatitude = parseFloat(latitude);

  if (!isValidCoordinates(parsedLongitude, parsedLatitude)) {
    return res.status(400).json({ message: "Coordonnées invalides." });
  }

  try {
    const updatedPosition = {
      uniqueId: id,
      profileId: profileId,
      type: "Point",
      coordinates: [parsedLongitude, parsedLatitude],
      updatedAt: Date.now(),
    };

    const position = await GPSPosition.findOneAndUpdate(
      { profileId: profileId },
      updatedPosition,
      { upsert: true, new: true }
    );

    res.json(position);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
