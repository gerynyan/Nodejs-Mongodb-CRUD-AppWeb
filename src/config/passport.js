const passport = require('passport');
const User = require('../models/User');
const localStrategy = require('passport-local').Strategy;

//Definimos estrategia de autentificación Local.
passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {

    //¿existe correo?
    const user = await User.findOne({email})
    if(!user){
        return done(null, false, {message: 'No se ha encontrado usuario con dicho email o contraseña (email)'});
    }else{
        const match = await user.matchPassword(password);
        if(match){
            return done(null, user);
        }else{
            return done(null, false, {message: 'No se ha encontrado usuario con dicho email o contraseña (contraseña)'});
        }
    }

}));

//Guarda el usuario
passport.serializeUser((user, done) =>{
    done(null, user.id);
});
//comprueba permisos del usuario
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) =>{
        done(err, user);
    })
})