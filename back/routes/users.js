const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/users');

router.get('/signup', userCtrl.signup);
router.get('/login', userCtrl.login);

module.exports = router;