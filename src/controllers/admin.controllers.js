const adminCtrl = {};
const User = require('../models/User');  
const Note = require('../models/Note');

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
    const notes = await Note.find({idEntrenador: req.user._id}).lean();
    const users = await User.findById(notes.idCliente).lean();
    console.log('Notas: '+notes);

    console.log('Cita: id del cliente: '+notes.idCliente);
    console.log('Cita:Busca users: '+users);
    res.render('admin/citas', {notes});
}



module.exports = adminCtrl;