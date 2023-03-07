const notesCtrl = {};
const Note = require('../models/Note');
const User = require('../models/User');  
const moment = require('moment');
const mongoose = require('mongoose');

const $ = require('jquery');


//controlador para renderizar vistas y procesar peticones.

notesCtrl.renderNoteform = async (req, res) => {
    const users = await User.find({idCliente: req.user}).lean();
    const fechaHoy = moment().format('YYYY-MM-DD');

    res.render('notes/new-note', {users, fechaHoy});
};

notesCtrl.usersCall = async (req, res) => {
    const id = req.params.id;
    const dia = req.params.dia;
    const diaInicio = moment(dia).startOf('day');
    const diaFin = moment(dia).endOf('day');
    const idCita = req.params.idCita;
    //Guardado de datos
    if(!idCita){
        try {
            //Busca las horas del entrenador
            const user = await User.findById(id).lean();
            const horas = user.horas;
            //busca las horas existentes del día seleccinado
            const notes = await Note.find({idEntrenador: id, fecha:{$gte: diaInicio, $lt: diaFin}});
            const horasOcupadas = notes.map((note) => moment(note.fecha).format('HH:mm'));
            //guarda las horas disponibles
            var horasLibres = horas.filter((hora) => !horasOcupadas.includes(hora));
            //si el día es el actual retira las horas que ya hayan pasado
            const hoy = moment().format('YYYY-MM-DD');
            if (dia == hoy){
                const horaActual = moment().format('HH:mm');
                horasLibres = horasLibres.filter((hora) => moment(hora, 'HH:mm').isAfter(moment(horaActual, 'HH:mm')));
            }
            //retorna las horas
            res.json({ horas: horasLibres });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: 'Server error' });
        }
    }else{
        try{
        console.log('ejecuta segudo')
        //Busca las horas del entrenador
        const user = await User.findById(id).lean();
        const horas = user.horas;
        //busca las horas existentes del día seleccinado
        const notes = await Note.find({idEntrenador: id, fecha:{$gte: diaInicio, $lt: diaFin}, _id:{$ne: idCita}});
        const horasOcupadas = notes.map((note) => moment(note.fecha).format('HH:mm'));
        //guarda las horas disponibles
        var horasLibres = horas.filter((hora) => !horasOcupadas.includes(hora));
        //si el día es el actual retira las horas que ya hayan pasado
        const hoy = moment().format('YYYY-MM-DD');
        if (dia == hoy){
            const horaActual = moment().format('HH:mm');
            horasLibres = horasLibres.filter((hora) => moment(hora, 'HH:mm').isAfter(moment(horaActual, 'HH:mm')));
        }
        //retorna las horas
        res.json({ horas: horasLibres });
        }catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }

};

//método para crear una nota nueva y gurdar en servidor
notesCtrl.createNewNote = async (req, res) => {

    const {title, description, fecha, hora, idEntrenador} = req.body;
    console.log("title: "+title+" desc: "+description+" fecha: "+fecha+" hora: "+ "identre: " +idEntrenador);
    const newFecha = moment(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm').toDate();    
    console.log("new fecha: "+newFecha);
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
        const today = moment().startOf('day');
        const notes = await Note.find({idCliente: req.user.id, fecha:{$gte: today}}).sort({fecha: 1}).exec();

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
        const year = new Date().getFullYear();
        let years = [];
        for (i = year ; i <= year + 3; i++){
            years.push(i);
        }
        console.log(years);

        res.render('notes/all-notes', {notes: notesNombres, years});
    }catch(error){
        console.error(error);
        res.status(500).send('server error');
    }
};

//Renderiza formulario para editar Notas
notesCtrl.renderEditForm = async (req, res) => {
    const fechaHoy = moment().format('YYYY-MM-DD');
    //Busca la cita
    const note = await Note.findById(req.params.id).lean();
    const horaCita = moment(note.fecha).format('HH:mm');
    console.log('HoraCita: '+horaCita)
    //Comprueba permiso de edición
    if(note.idCliente != req.user.id){
        if(note.idEntrenador != req.user.id){
            req.flash('error_msg', 'No tiene autorizción');
            return res.redirect('/');
        }
    }
    //busca el resto de horas libres para el primer renderizado
    //día de la nota
    const dia = note.fecha;
    const diaInicio = moment(dia).startOf('day');
    const diaFin = moment(dia).endOf('day');
    //horario del entrenador
    const user = await User.findById(note.idEntrenador).lean();
    const horario = user.horas;
    //citas el mismo día
    const horas = await Note.find({idEntrenador: note.idEntrenador, fecha:{$gte: diaInicio, $lt: diaFin}, _id:{$ne: note._id}});
    const horasOcupadas = horas.map((horas) => moment(horas.fecha).format('HH:mm'));
    //guarda las horas libres comparando horario y ocupadas
    var horasLibres = horario.filter((hora) => !horasOcupadas.includes(hora));
    const hoy = moment().format('YYYY-MM-DD');
    if (dia == hoy){
        const horaActual = moment().format('HH:mm');
        horasLibres = horasLibres.filter((hora) => moment(hora, 'HH:mm').isAfter(moment(horaActual, 'HH:mm')));
    }
    console.debug('HorasLibres: '+horasLibres);
    res.render('notes/edit-note', {note, fechaHoy, horaCita, horasLibres});
};

//Manda la petición de edición y devuelve a /notes
notesCtrl.updateNote = async (req, res) => {
    const {title, description, fecha, hora} = req.body;
    const newFecha = moment(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm').toDate();    
    await Note.findByIdAndUpdate(req.params.id, {title, description, fecha: newFecha})
    // mensaje
    if(req.user.permisos === 1){
        req.flash('success_msg', 'Nota editada correctamente');
        res.redirect('/entrenador/citas')
    }
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