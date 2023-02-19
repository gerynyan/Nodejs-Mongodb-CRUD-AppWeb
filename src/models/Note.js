//requerimos los modelos y esquemas del módulo de mongoose.
const mongoose = require('mongoose');

//creo el esquema de una nota, que será guardada en la base de datos.
const NoteSchema = new mongoose.Schema({
    title: {type: String,required: true},
    description: {type: String,required: true},
    fecha:{
        type: Date,
        required: false
    },
    idCliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    idEntrenador:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {timestamps: true})

//creo el modelo en base al esquema y lo esporto
module.exports = mongoose.model('Note', NoteSchema, 'Notas');