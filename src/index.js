//Lee archivo .env en raíz y asigna las variables de entorno.
require('dotenv').config(); 

const app = require('./server');
require('./database');

app.listen(app.get('port'), () => {
    console.log('Servidor en puerto:', app.get('port'))
})