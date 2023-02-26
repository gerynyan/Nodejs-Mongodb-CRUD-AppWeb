const helpers = {};
const User = require('../models/User');  


//Verifica si el usuario está identificado
helpers.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()){
        return next();
    }
    req.flash('error_msg', 'No está autorizado')
    res.redirect('/');
}

//Verifica si el usuario es administrador
helpers.isAdmin = (req, res, next) => {
    if (req.isAuthenticated()){
        if(res.locals.user.permisos === 0){
            return next();
        }
    }
    req.flash('error_msg', 'No está autorizado')
    res.redirect('/');
}

//Verifica si el usuario es entrenador
helpers.isEntrenador = (req, res, next) => {
    if (req.isAuthenticated()){
        if(res.locals.user.permisos === 1){
            return next();
        }
    }
    req.flash('error_msg', 'No está autorizado')
    res.redirect('/');
}

module.exports = helpers;