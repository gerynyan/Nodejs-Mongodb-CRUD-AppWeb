//requiero solo el método router
const {Router} = require('express')
const router = Router();

const {renderIndex, renderAbout} = require('../controllers/index.controller');
const { render } = require('../server');
//Requiero que el usuario este identificado

//llama los renderizados que se encunetran en la carpeta controllers
router.get('/', renderIndex)
router.get('/about', renderAbout )

module.exports = router;