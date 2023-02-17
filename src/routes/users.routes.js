const {Router} = require('express');
const router = Router();

//importo los métodos de la carpeta controladores
const { renderSignUpForm, signup, renderSignInForm, signin, logout } = require('../controllers/users.controllers');

//Renderizado de las siguientes ventanas relacionadas con los accesos.
router.get('/users/signup', renderSignUpForm);

router.post('/users/signup', signup);

router.get('/users/signin', renderSignInForm);

router.post('/users/signin', signin);

router.get('/users/logout', logout)


module.exports =  router;