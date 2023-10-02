var express = require("express");
var router = express.Router();
const vCard = require('vcards-js');


router.get("/generateVCard/:profilId", async (req, res) => {
  try {
    const profile = await Profil.findOne({ _id: req.params.profilId }).populate("userId");
    
    if (!profile) {
      return res.status(400).json({ error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    const card = vCard();

    card.firstName = profile.firstname;
    card.lastName = profile.lastname;
    card.organization = profile.title;
    card.cellPhone = profile.phone;
    card.email = profile.email;
    card.url = profile.website;

    // Convertir la carte en string
    const vCardString = card.getFormattedString();

    // Envoi de la vCard en tant que fichier téléchargeable
    res.set('Content-Type', 'text/vcard');
    res.set('Content-Disposition', `attachment; filename=${profile.firstname}_${profile.lastname}.vcf`);
    res.send(vCardString);
    
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: error });
  }
});

module.exports = router;
