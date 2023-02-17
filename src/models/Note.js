//requerimos los modelos y esquemas del módulo de mongoose.
const { Schema, model} = require("mongoose");

//creo el esquema de una nota, que será guardada en la base de datos.
const NoteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    fecha:{
        type: Date,
        required: false
    },
    idEntrenador:{
        type: String,
        required: false
    },

}, {timestamps: true})

//creo el modelo en base al esquema y lo esporto
module.exports = model('Note', NoteSchema, 'Notas');