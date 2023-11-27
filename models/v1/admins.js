const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // required: true : Cette propriété signifie que l'email est obligatoire. Lors de la création d'un nouvel objet (par exemple, un utilisateur), l'email doit être fourni, sinon une erreur sera générée.
  // unique: true : Cette propriété garantit que chaque email doit être unique dans la collection. En d'autres termes, il ne peut pas y avoir deux objets (par exemple, deux utilisateurs) ayant la même adresse e-mail. Mongoose s'assurera qu'aucun enregistrement existant dans la base de données ne possède la même adresse e-mail avant d'insérer ou de mettre à jour un objet.
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  uniqueId: { type: String }, //token uuid4
});

module.exports = mongoose.model("admins", UserSchema);
