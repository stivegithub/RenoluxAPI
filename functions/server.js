const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const Joi = require("joi");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "digitalwaycameroun@gmail.com",
    pass: "enozqadteybdydxe",

  },
});

const port = process.env.PORT || 2003;
const app = express();

app.use(cors({
  origin: "https://renolux.netlify.app", // Remplacez par votre domaine
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
}));

app.use(express.json());

app.post("/rendez-vous", async (req, res) => {
  const { email, date, heure, prenom, travaux } = req.body;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    date: Joi.string().required(),
    heure: Joi.string().required(),
    prenom: Joi.string().required(),
    travaux: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  const mailOptions = {
    from: "RENOLUX CAMEROUN",
    to: 'renolux3@gmail.com',
    subject: `Nouvelle demande de rendez-vous`,
    text: `M./Mme ${prenom} dont l'email est ${email}, aimerait avoir un rendez-vous avec vous le ${date} à ${heure}. Son intérêt est porté sur ${travaux}.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Erreur lors de l'envoi de l'email");
    } else {
      console.log("Email envoyé" + info.response);
      return res.status(200).send("Email envoyé avec succès.");
    }
  });
});

app.listen(port, () => {
  console.log(`Le serveur a démarré sur le port ${port}`);
});

module.exports = app;
