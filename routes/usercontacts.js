const express = require('express');
const router = express.Router();
const UserContact = require('../models/UserContacts');

router.post('/addContact', async (req, res) => {


    const { userId, profileId } = req.body;
    console.log("mon consolelog", req.body);
    // Assurez-vous que tous les champs requis sont présents
    if (!userId || !profileId) {
        return res
            .status(400)
            .json({ result: false, error: 'Missing user ID or profile ID' });
    }

    try {
        // Rechercher un enregistrement UserContact pour cet utilisateur
        let userContact = await UserContact.findOne({ userId });

        if (userContact) {
            // Si un enregistrement UserContact existe déjà, ajoutez le profileId au tableau de contacts
            if (userContact.contacts.includes(profileId)) {
                return res
                    .status(409)
                    .json({ error: 'Profile already in contacts' });
            } else {
                userContact.contacts.push(profileId);
            }
        } else {
            // Si un enregistrement UserContact n'existe pas, créez-en un
            userContact = new UserContact({
                userId,
                contacts: [profileId]
            });
        }

        // Enregistrer l'objet UserContact dans la base de données
        await userContact.save();

        return res
            .status(200)
            .json({ result: true, message: 'Profile added to contacts' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

});

module.exports = router;
