const notesCtrl = {};
const Note = require('../models/Note');
const User = require('../models/User');  
const moment = require('moment');
const mongoose = require('mongoose');

const $ = require('jquery');


//controlador para renderizar vistas y procesar peticones.

notesCtrl.renderNoteform = async (req, res) => {
    const users = await User.find({idCliente: req.user}).lean();
    res.render('notes/new-note', {users});
};

//método para crear una nota nueva y gurdar en servidor
notesCtrl.createNewNote = async (req, res) => {
    const {title, description, fecha, hora, idEntrenador} = req.body;
    const newFecha = moment(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm').toDate();    
    const newNote = new Note({title, description, fecha: newFecha, idEntrenador});
    newNote.idCliente = req.user.id;   
    await newNote.save();
    // mensaje
    req.flash('succes_msg', 'Nota agregada con éxito');
    res.redirect('/notes');
};

//Muestra todas las notas del usuario
notesCtrl.renderNotes = async (req, res) => {
    try{
        const notes = await Note.find({idCliente: req.user.id}).sort({fecha: 1}).exec();

        const notesNombres = await Promise.all(notes.map(async (nota) => {
            const[entrenador] = await Promise.all([
                User.findById(nota.idEntrenador)
            ]);
            if(!entrenador){
                console.log('Entrenador no encontrado: ${note._id}');
                return null;
            }

            return{
                _id: nota._id,
                title: nota.title,
                fecha: nota.fecha,
                description: nota.description,
                entrenador: entrenador.name
            };
        }));
        res.render('notes/all-notes', {notes: notesNombres});
    }catch(error){
        console.error(error);
        res.status(500).send('server error');
    }
};

//Renderiza formulario para editar Notas
notesCtrl.renderEditForm = async (req, res) => {
    const note = await Note.findById(req.params.id).lean();
    if(note.idCliente != req.user.id){
        req.flash('error_msg', 'No tiene autorizción');
        return res.redirect('/notes');
    }
    console.log('RenderEditForm: '+note);
    res.render('notes/edit-note', {note});
};

//Manda la petición de edición y devuelve a /notes
notesCtrl.updateNote = async (req, res) => {
    const {title, description} = req.body;
    await Note.findByIdAndUpdate(req.params.id, {title, description})
    // mensaje
    req.flash('success_msg', 'Nota editada correctamente');
    res.redirect('/notes')
};

// Método para borrar la nota y recargar la ventana
notesCtrl.deleteNote = async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Nota eliminada con éxito');
    res.redirect('/notes')
};


//AJUSTE HORAS

module.exports = notesCtrl;