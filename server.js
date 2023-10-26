const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "digitalwaycameroun@gmail.com",
    pass: "enozqadteybdydxe",
  },
});
const port = 2003;

const app = express();

const jwt_secret = process.env.JWT_SECRET;
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// passport.use(new GoogleStrategy({
//   clientSecret:,
//   clientID:,
//   callbackURL:'/auth/google/callback'
// },(accessToken, refreshToken, profile, done)=>{
//   const user= await Google.findOne({googleId:profile.id})
//   if(!user){
//     const newGoogleUser= new Google({
//       googleId:profile.id,
//       displayName:profile.displayName
//     })
//     await newGoogleUser.save()
//     done(null, newGoogleUser)
//   }
//   return done(null, user)
// }))

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });
// passport.deserializeUser((user, done) => {
//   Google.findById(id, (err, googl) => {
//     done(err, googl);
//   });
// });

// app.use(passport.initialize());
// app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/authApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const googleSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
});
const Google = mongoose.model("google", googleSchema);

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  category: String,
  token: String,
  createdAt: { type: Date, default: Date.now() },
});
const User = mongoose.model("User", userSchema);

app.use(express.json());
app.use(cors());

app.post("/register", async (req, res) => {
  const { email, password, category, username } = req.body;
  if (!username) {
    return res
      .status(400)
      .send({ usename: "le nom d'utilisateur n'est pas valide" });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).send({ email: "Email non valide" });
  }
  if (!password || password.length < 8) {
    return res.status(400).send({
      password: "Le mot de passe doit contenir au moins 08 caracteres.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    email,
    password: hashedPassword,
    category,
  });
  await user.save();
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  user.token = token;
  await user.save();
  res.send({ message: "User registered !", token });
  const mailOptions = {
    from: "digital way",
    to: email,
    subject: `Bienvenue dans la communauté , ${email}`,
    text: "c'est un reel plaisir de vous compter desormais comme l'un de nos utilisateurs. Merci infiniment.",
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send("une erreur d'envoie a ete remarquée");
    } else {
      console.log("Email envoyé" + info.response);
      return res.status(200).send("Email envoyé avec succes.");
    }
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res
      .status(400)
      .send({ message1: "les chanps ne doivent pas etre vides." });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send({ message2: "Email not found" });
  }
  const hash = await bcrypt.compare(password, user.password);
  if (!hash) {
    return res
      .status(400)
      .send({ message3: `Le mot de passe n' est pas valide , ${hash}` });
  }

  const token = jwt.sign({ id: user._id }, jwt_secret);
  user.token = token;
  await user.save();
  const category = user.category;
  res.send({ token, message: "connexion en cours...", category });
});

app.post("/change-password", async (req, res) => {
  const { token, newPassord } = req.body;
  if (!token) return res.status(400).send({ error: "Token required!" });
  const decoded = jwt.verify(token, jwt_secret);
  const hashedPassword = await bcrypt.hash(newPassord, 10);
  await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
  res.send({ message: "Password Updated!" });
});

// notre middleware pour verifier le token

const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).send({ message: "No token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).send({
        message: "Token does not match or user not found ",
        decoded,
        user,
      });
    }

    (req.userId = decoded.id),
      (req.email = user.email),
      (req.category = user.category);
    next();
  } catch (error) {
    return res
      .status(500)
      .send({ message: `Failed to authenticated token, ${error}` });
  }
};

app.get("/verify-token", verifyToken, (req, res) => {
  res.send({
    valid: true,
    message: "Token is valid",
    email: req.email,
    category: req.category,
  });
});

const postRoute = require("./routes/Post");
app.use("/posts", postRoute);

app.listen(port, () => {
  console.log(`le server a demaré sur le port ${port}`);
});
