const adminCtrl = {};
const User = require('../models/User');  
const Note = require('../models/Note');
const mongoose = require('mongoose');
const moment = require('moment');

const allHours = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"];

//Renderiza permisos
adminCtrl.renderPermisos = async (req, res) =>{
    const user = await User.find({user: req.user}).lean();
    res.render('admin/permisos', {user});
}

//Renderiza formulario para editar Usuarios
adminCtrl.renderEditUserForm = async (req, res) => {
    const user = await User.findById(req.params.id).lean();
    console.debug('EditUserForm: '+user);
    res.render('admin/edit-usuario', {user});
};
//renderiza preferencias entrenador
adminCtrl.renderEntrenadorPref = async (req, res) => {
    const user = await User.findById(req.user.id).lean();
    console.debug('EditUserForm: '+ user);
    res.render('admin/entrenadorPref', {user, allHours});
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

//Manda la petición de edición y devuelve a /permisos
adminCtrl.updateEntrenador = async (req, res) => {
    const {name, email,horasCheck} = req.body;
    console.log('Update user' +name, email, horasCheck)
    await User.findByIdAndUpdate(req.params.id, {name, email, horas: horasCheck})
    // mensaje
    req.flash('success_msg', 'Preferencias editadas correctamente');
    res.redirect('/entrenador/preferencias')
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
        const notes = await Note.find({idEntrenador: req.user._id}).sort({fecha: 1}).exec();

        const notesNombres = await Promise.all(notes.map(async (nota) => {
            const[cliente] = await Promise.all([
                User.findById(nota.idCliente)
            ]);

            if (!cliente){
                console.log('Cliente o Entrenador no encontrados: ${note._id}');
                return null;
            }

            return{
                _id: nota._id,
                title: nota.title,
                fecha: nota.fecha,
                description: nota.description,
                cliente: cliente.name,
            };
        }))
        res.render('admin/citas', {notes: notesNombres,});
    }catch (error){
        console.error(error);
        res.status(500).send('server error');
    }
};

adminCtrl.renderCitasDia = async (req, res) => {
    try{
        const today = moment().startOf('day');
        const tomorrow = moment(today).add(1, 'day');
        const notes = await Note.find({idEntrenador: req.user._id, fecha: {$gte: today, $lt: tomorrow}}).sort({fecha: 1}).exec();

        const notesNombres = await Promise.all(notes.map(async (nota) => {
            const[cliente] = await Promise.all([
                User.findById(nota.idCliente)
            ]);

            if (!cliente){
                console.log('Cliente o Entrenador no encontrados: ${note._id}');
                return null;
            }

            return{
                _id: nota._id,
                title: nota.title,
                fecha: nota.fecha,
                description: nota.description,
                cliente: cliente.name,
            };
        }))
        res.render('admin/citas-dia', {notes: notesNombres,});
    }catch (error){
        console.error(error);
        res.status(500).send('server error');
    }
};



module.exports = adminCtrl;