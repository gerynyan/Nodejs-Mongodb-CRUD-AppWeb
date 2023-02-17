//requerimos los modelos y esquemas del módulo de mongoose y bcryptjs.
const {Schema, model} = require('mongoose');
const bcrypt = require('bcryptjs');

//creo el esquema de una usuaro, que será guardado en la base de datos.
const UserSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    permisos: {type: Number, required: true},
}, {timestamps: true})

//Función para encriptar la contraseña al registro
UserSchema.methods.encryptPassword = async password => {
   const salt = await bcrypt.genSalt(10);
   return await bcrypt.hash(password, salt);
};
//Función para verficar contraseña en Acceso
UserSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password)
}

//Creo el modelo en base al esquema y lo exporto
module.exports = model('User', UserSchema);