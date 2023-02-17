const helpers = {};
const User = require('../models/User');  


//Verifica si el usuario está identificado
helpers.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()){
        return next();
    }
    req.flash('error_msg', 'No está autorizado')
    res.redirect('/users/signin');
}

//Verifica si el usuario es administrador
helpers.isAdmin = (req, res, next) => {
    if (req.isAuthenticated()){
        if(res.locals.user.permisos == 0){
            return next();
        }
    }
    req.flash('error_msg', 'No está autorizado')
    res.redirect('/notes');
}

//Verifica si el usuario es administrador
helpers.isEntrenador = (req, res, next) => {
    if (req.isAuthenticated()){
        if(res.locals.user.permisos === 1){
            console.log(res.locals.user.permisos);
            return next();
        }
    }
    req.flash('error_msg', 'No está autorizado')
    res.redirect('/notes');
}

module.exports = helpers;