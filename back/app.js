const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// importation des modèles sauces et users
const Sauce = require('./models/sauces');
const User = require('./models/users');

// importation des routes sauces et users
const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/users');

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

module.exports = app;