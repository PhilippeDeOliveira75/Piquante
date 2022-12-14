const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

require('dotenv').config()

// importation des modèles sauces et users
const Sauce = require('./models/sauces');
const User = require('./models/users');

// importation des routes sauces et users
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/users');

const sanitize = require('express-mongo-sanitize');

const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const helmet = require("helmet");

const app = express();

// Connection avec la base de données MongoDB 
mongoose.connect('mongodb+srv://Philippe:Onizuka07@cluster.0ehnltw.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => {
    console.log('Connexion à MongoDB échouée !');
    console.log(err);
  });

app.use(express.json());

app.use(cors());

// Gestion des erreurs CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

app.use('/api', limiter);

app.use(sanitize());

app.use(helmet());

module.exports = app;