const {Router} = require('express');
const router = Router();

//importo los métodos de la carpeta controladores
const { renderPermisos, deleteUser, renderEditUserForm, updateUser, renderCitas, renderCitasDia, renderEntrenadorPref,updateEntrenador } = require('../controllers/admin.controllers');

//Requiero que el usuario este identificado
const {isAdmin, isEntrenador} = require('../helpers/auth')

//RENDERIZA USUARIOS
router.get('/admin/permisos', isAdmin, renderPermisos );

//RENDERIZA CITAS
router.get('/entrenador/citas', isEntrenador, renderCitas );
router.get('/entrenador/citas-dia', isEntrenador, renderCitasDia);

//Editar usuario
router.get('/admin/permisos/edit-usuario/:id', isAdmin, renderEditUserForm)
router.put('/admin/permisos/edit-usuario/:id', isAdmin, updateUser)

//ELIMINAR USUARIO
router.delete('/admin/permisos/delete/:id', isAdmin, deleteUser)

//edita entrenador
router.get('/entrenador/preferencias', isEntrenador, renderEntrenadorPref)
router.put('/entrenador/preferencias/:id', isEntrenador, updateEntrenador)


module.exports = router;