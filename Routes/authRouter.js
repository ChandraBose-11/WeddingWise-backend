const express =require('express');
const Auths =require('../Controllers/authController');






const router = express.Router();


router.post('/register-user',Auths.registerUser)
router.post('/login-user',Auths.loginUser)
router.post('/google',google)




module.exports= router;