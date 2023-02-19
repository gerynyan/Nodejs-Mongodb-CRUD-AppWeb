const adminCtrl = {};
const User = require('../models/User');  
const Note = require('../models/Note');
const mongoose = require('mongoose');

//Renderiza permisos
adminCtrl.renderPermisos = async (req, res) =>{
    const user = await User.find({user: req.user}).lean();
    res.render('admin/permisos', {user});
}

//Renderiza formulario para editar Usuarios
adminCtrl.renderEditUserForm = async (req, res) => {
    const user = await User.findById(req.params.id).lean();
    console.log('EditUserForm: '+user);
    res.render('admin/edit-usuario', {user});
};

//Manda la petición de edición y devuelve a /permisos
adminCtrl.updateUser = async (req, res) => {
    const {name, email, permisos} = req.body;
    console.log('Update user' +name, email, permisos)
    await User.findByIdAndUpdate(req.params.id, {name, email, permisos})
    // mensaje
    req.flash('success_msg', 'Usuario editado correctamente');
    res.redirect('/admin/permisos')
};

//Método para borrar usuario y recargar la ventana
adminCtrl.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Usuario eliminado con éxito');
    res.redirect('/admin/permisos')
};

//Renderiza citas
adminCtrl.renderCitas = async (req, res) =>{
    try{
        const notes = await Note.find({idEntrenador: req.user._id}).exec();

        const notesNombres = await Promise.all(notes.map(async (nota) => {
            const[cliente, entrenador] = await Promise.all([
                User.findById(nota.idCliente),
                User.findById(nota.idEntrenador),
            ]);

            if (!cliente || !entrenador){
                console.log('Cliente o Entrenador no encontrados: ${note._id');
                return null;
            }

            return{
                _id: nota._id,
                title: nota.title,
                fecha: nota.fecha,
                description: nota.description,
                cliente: cliente.name,
                entrenador: entrenador.name,
            };
        }))
        res.render('admin/citas', {notes: notesNombres,});
    }catch (error){
        console.error(error);
        res.status(500).send('server error');
    }
};



module.exports = adminCtrl;