const mongoose = require('mongoose'); //Guardo el módulo de mongoose

//Obtiene los valores desde .env
const {NOTES_APP_MONGODB_HOST, NOTES_APP_MONGODB_DATABASE} = process.env;
const MONGODB_URL = `mongodb+srv://${NOTES_APP_MONGODB_HOST}.${NOTES_APP_MONGODB_DATABASE}`;

mongoose.connect(MONGODB_URL, { //método para conectar con la base de datos, 
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
//Mensajes de conexión o error
    .then(db => console.log('Database conectado'))
    .catch(err => console.log(err));

