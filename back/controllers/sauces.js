const sauce = require('../models/sauces');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLikes: [],
      usersDisliked: []
    });

  sauce.save()
  .then(() => { res.status(201).json({message: 'Sauce enregistrée !'})})
  .catch(error => { res.status(400).json( { error })})
};


exports.getOneSauce = (req, res, next) => {
  sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(403).json({ message : 'Not authorized'});
          } else {

          	// On récupère le nom de l'image précédente
          	const filename = sauce.imageUrl.split('/images/')[1];
          	//On met à jour l'objet
          	Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
        	  .then(() => {
        	  	res.status(200).json({message : 'Objet modifié!'})
        	  	// On supprime l'image précédente si une image a été uploadé
        	  	if(req.file) {
								fs.unlink(`images/${filename}`, () => {});
        	  	}
        	  })
        	  .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};


exports.deleteSauce = (req, res, next) => {
  sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.likeDislikeSauce = (req, res, next) => {
  sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    if (req.body.like === 1) {
      if (sauce.usersLiked.includes(req.body.userId)) 
      {
        res.status(401).json({error: 'Sauce déja liké'});
      }
      else
      {
        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } })
          .then((sauce) => res.status(200).json({ message: 'Like ajouté !' }))
          .catch(error => res.status(400).json({ error }))
      }

    } 
    else if (req.body.like === -1) {
      if (sauce.usersDisliked.includes(req.body.userId)) {
        res.status(401).json({error: 'Sauce déja disliké'});
      }
      else
      {   
        Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: (req.body.like++) * -1 }, $push: { usersDisliked: req.body.userId } })
          .then((sauce) => res.status(200).json({ message: 'Dislike ajouté !' }))
          .catch(error => res.status(400).json({ error }));
        }
    } 
    else 
    {
      if (sauce.usersLiked.includes(req.body.userId)) 
      {
        Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
          .then((sauce) => { res.status(200).json({ message: 'Like supprimé !' }) })
          .catch(error => res.status(400).json({ error }));
      } 
      else if (sauce.usersDisliked.includes(req.body.userId)) 
      {
        Sauce.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 } })
          .then((sauce) => { res.status(200).json({ message: 'Dislike supprimé !' }) })
          .catch(error => res.status(400).json({ error }));
        }
    }
  })
  .catch(error => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
}