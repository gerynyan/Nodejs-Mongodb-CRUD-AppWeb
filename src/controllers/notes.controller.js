const notesCtrl = {};
const Note = require('../models/Note');
const User = require('../models/User');  

//controlador para renderizar vistas y procesar peticones.

notesCtrl.renderNoteform = async (req, res) => {
    const users = await User.find({user: req.user}).lean();
    res.render('notes/new-note', {users});
};

//método para crear una nota nueva y gurdar en servidor
notesCtrl.createNewNote = async (req, res) => {
    const {title, description, fecha, idEntrenador} = req.body;
    const newNote = new Note({title, description, fecha, idEntrenador});
    newNote.user = req.user.id;   
    await newNote.save();
    // mensaje
    req.flash('succes_msg', 'Nota agregada con éxito');
    res.redirect('/notes');
};

//Muestra todas las notas del usuario
notesCtrl.renderNotes = async (req, res) => {
    const notes = await Note.find({user: req.user.id}).lean();
    res.render('notes/all-notes', {notes});
};

//Renderiza formulario para editar Notas
notesCtrl.renderEditForm = async (req, res) => {
    const note = await Note.findById(req.params.id).lean();
    if(note.user != req.user.id){
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

//Método para borrar la nota y recargar la ventana
notesCtrl.deleteNote = async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Nota eliminada con éxito');
    res.redirect('/notes')
};

module.exports = notesCtrl;