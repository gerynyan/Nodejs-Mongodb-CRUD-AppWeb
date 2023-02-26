const usersCtrl = {};

//controlador para renderizar vistas y procesar peticones.  
const passport = require('passport')
const User = require('../models/User');

//Requiero que el usuario este identificado
const {isAdmin} = require('../helpers/auth')

//Renderiza registro
usersCtrl.renderSignUpForm = (req, res) =>{
    res.render('users/signup');
}
//realiza registro
usersCtrl.signup = async (req, res) =>{
    const errors = []
    //VERIFICA CONTRASEÑA Y EMAIL
    const {name,surname, email, password, confirm_password} = req.body;
    if(password != confirm_password){
        errors.push({text: 'Contraseñas no coinciden'});
    }
    if(password.length < 4){
        errors.push({text: 'La contraseña deben tener al menos 5 caracteres'});
    }
    if(errors.length > 0){
        res.render('users/signup', {
            errors,
            name, 
            surname,
            email,
            password,
            confirm_password
        })
    }else{
        const emailUser = await User.findOne({email: email});
        if(emailUser){
            req.flash('error_msg', 'El correo ya está en uso');
            res.redirect('/users/signup');
        }else{
            // CREA USUSARIO Y AÑADE A BD
            const newUser = new User({name: name+' '+surname, email, password, permisos:2});
            newUser.password = await newUser.encryptPassword(password)
            await newUser.save();
            req.flash('success_msg', 'Usuario registrado con éxito');
            res.redirect('/users/signin');
        }
    }
};

//LOGIN
usersCtrl.renderSignInForm = (req, res) => {
    res.render('users/signin');
}
// Verifica si el acceso ha tenido éxito
usersCtrl.signin = function(req, res, next){ 
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return req.flash('error_msg', 'Correo o contraseña incorectos.') && res.redirect('/users/signin'); }

        req.logIn(user, function(err) {
            if (err) { return next(err); }
            var permisos = user.permisos;
            switch (permisos) {
              case 0:
                res.redirect('/admin/permisos');
                break;
              case 1:
                res.redirect('/entrenador/citas-dia');
                break;
              case 2:
                res.redirect('/notes');
                break;
              default:
                res.redirect('/');
            }
        });
    })(req, res, next);
};

// Verifica si el acceso ha tenido éxito ANTERIOR
// usersCtrl.signin = passport.authenticate('local',  {
//     failureRedirect: '/users/signin',
//     successRedirect: '/notes',
//     failureFlash: true
// })


//Para cerrar sesión
usersCtrl.logout = (req, res) => {
    req.logout(function(err){ // antes req.logout() deprecado para evitar "session fixation attacks."
        if(err) {return next(err); }
        req.flash('success_msg', 'Desconectado con éxito.');
        res.redirect('/users/signin');
    });
    
}

module.exports = usersCtrl;