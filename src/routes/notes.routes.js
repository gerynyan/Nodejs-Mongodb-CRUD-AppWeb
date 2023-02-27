const {Router} = require('express')
const router = Router();

//importo los métodos de la carpeta controladores
const {
    renderNoteform, 
    usersCall,
    horasCall,
    createNewNote, 
    renderNotes, 
    renderEditForm, 
    updateNote, 
    deleteNote 
} =  require('../controllers/notes.controller');

//Requiero que el usuario este identificado
const {isLoggedIn} = require('../helpers/auth')

//NUEVA NOTA, siempre requiero que esté identificado
router.get('/notes/add', isLoggedIn, renderNoteform );
router.post('/notes/new-note', isLoggedIn, createNewNote );
router.get('/users/horas/:id/:dia', isLoggedIn, usersCall);

//TODAS LAS NOTAS
router.get('/notes', isLoggedIn, renderNotes )

//EDITAR NOTA
router.get('/notes/edit/:id', isLoggedIn, renderEditForm)

router.put('/notes/edit/:id', isLoggedIn, updateNote)

//ELIMINAR NOTA
router.delete('/notes/delete/:id', isLoggedIn, deleteNote)

module.exports = router;