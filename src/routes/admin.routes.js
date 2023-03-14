const { Router } = require('express');
const router = Router();

//importo los métodos de la carpeta controladores
const { renderPermisos, renderNoteformE, createNewNoteE, deleteUser, renderEditUserForm, updateUser, renderCitas, renderCitasDia, renderEntrenadorPref, updateEntrenador, deletecitasTodas, deletecitasDia } = require('../controllers/admin.controllers');

//Requiero que el usuario este identificado
const { isAdmin, isEntrenador } = require('../helpers/auth')

//ADMIN
    //Renderiza usuarios
    router.get('/admin/permisos', isAdmin, renderPermisos);

    //Editar usuario
    router.get('/admin/permisos/edit-usuario/:id', isAdmin, renderEditUserForm)
    router.put('/admin/permisos/edit-usuario/:id', isAdmin, updateUser)

    //Eliminar usuario
    router.delete('/admin/permisos/delete/:id', isAdmin, deleteUser);

//ENTRENADOR
    //Preferencias
    router.get('/entrenador/preferencias', isEntrenador, renderEntrenadorPref)
    router.put('/entrenador/preferencias/:id', isEntrenador, updateEntrenador)

    //Renderiza citas
    router.get('/entrenador/citas', isEntrenador, renderCitas);
    router.get('/entrenador/citas-dia', isEntrenador, renderCitasDia);

    //Elimina citas
    router.delete('/entrenador/citas/delete/:id', isEntrenador, deletecitasTodas);
    router.delete('/entrenador/citas-dia/delete/:id', isEntrenador, deletecitasDia);

    //Crea citas
    router.get('/entrenador/nueva-cita', isEntrenador, renderNoteformE);
    router.post('/entrenador/new-note', isEntrenador, createNewNoteE);

module.exports = router;