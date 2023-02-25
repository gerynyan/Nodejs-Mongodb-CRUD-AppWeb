const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const morgan = require('morgan');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const moment = require('moment');
const $ = require('jquery');

//Inicializaciones.
const app = express();
require('./config/passport'); //ubicación de la configuración de passport

//Configuraciones.
app.set('port', process.env.PORT || 4000); //conecta al puerto 4000.
app.set('views', path.join(__dirname ,'views')); //ubicación del directorio views.
app.engine('.hbs', exphbs.engine({   //Motor para utilizar las plantillas de Handlebars.
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs' ,

    helpers:{
        eq: function(op1, op2){
            console.log('Comparar nivel: '+ op1, op2)
            if (op1 == op2){
                return true;
            }else{
                return false
            }
        },
        moment: function(date, format){
            return moment(date).format(format);
        },
        HoraSeleccionada: function(horaUsuario, hora){
          if(horaUsuario && horaUsuario.includes(hora)){
            return true;
          }else{
            return false;
          }
        },
    }

}))
app.set('view engine', 'hbs');//Utiliza el motor anterior.

//Middleware.
app.use(express.urlencoded({extended: false}));//Convierte datos de formulario en Json.
app.use(morgan('dev'));//Habilita el uso de morgan en modo dev.
app.use(methodOverride('_method')); //permite métodos desde el formulario
app.use(session({      //permite guardar los mensajes en servidor
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());//mensajes.

//Variables Globales.
app.use((req, res, next) => {
    res.locals.success_msg =  req.flash('success_msg')
    res.locals.error_msg =  req.flash('error_msg')
    res.locals.error =  req.flash('error')
    res.locals.user = req.user || null;
    if (req.user && req.user.permisos !== undefined) {
      res.locals.perms = req.user.permisos;
    }
    next();
})

//Rutas.
app.use(require('./routes/index.routes'));
app.use(require('./routes/notes.routes'));
app.use(require('./routes/users.routes'));
app.use(require('./routes/admin.routes'));

//Archivos estáticos
app.use(express.static(path.join(__dirname, 'public'))); //permite el uso de los archivos en esta dirección.

//obtiene horas
app.post('/getAvailableTimes', (req, res) => {
    const selectedDate = moment(req.body.date).format('YYYY-MM-DD');
    Note.find({ date: selectedDate })
      .select('time')
      .sort('time')
      .exec((err, notes) => {
        if (err) {
          console.log(err);
          res.status(500).send('Error retrieving notes');
        } else {
          const unavailableTimes = notes.map(note => note.time);
          const availableTimes = [];
          let currentTime = moment('10:00', 'HH:mm');
          const endTime = moment('15:00', 'HH:mm');
          while (currentTime.isBefore(endTime)) {
            const timeString = currentTime.format('HH:mm');
            if (!unavailableTimes.includes(timeString)) {
              availableTimes.push(timeString);
            }
            currentTime = currentTime.add(30, 'minutes');
          }
          res.send(availableTimes);
        }
      });
  });
 
module.exports = app;//exporta el módulo