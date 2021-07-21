const express = require('express');
const { signup, signin, isAuthenticate, userProfile} = require('../controllers/auth');
const router = express.Router();

router.post('/signup' , signup);
router.post('/signin' , signin);
router.get('/userprofile' , isAuthenticate , userProfile);



 


module.exports = router;