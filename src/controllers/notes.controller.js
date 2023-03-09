const notesCtrl = {};
const Note = require('../models/Note');
const User = require('../models/User');
const moment = require('moment');
const mongoose = require('mongoose');

//controlador para renderizar vistas y procesar peticones.
notesCtrl.renderNoteform = async (req, res) => {
    const users = await User.find({ idCliente: req.user }).lean();
    const fechaHoy = moment().format('YYYY-MM-DD');
    res.render('notes/new-note', { users, fechaHoy });
};
//método para crear una nota nueva y gurdar en servidor
notesCtrl.createNewNote = async (req, res) => {
    const { title, description, fecha, hora, idEntrenador } = req.body;
    console.log("title: " + title + " desc: " + description + " fecha: " + fecha + " hora: " + "identre: " + idEntrenador);
    const newFecha = moment(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm').toDate();
    console.log("new fecha: " + newFecha);
    const newNote = new Note({ title, description, fecha: newFecha, idEntrenador });
    newNote.idCliente = req.user.id;
    await newNote.save();
    // mensaje
    req.flash('succes_msg', 'Nota agregada con éxito');
    res.redirect('/notes');
};
//Muestra todas las notas del usuario
notesCtrl.renderNotes = async (req, res) => {
    try {
        const today = moment().startOf('day');
        const notes = await Note.find({ idCliente: req.user.id, fecha: { $gte: today } }).sort({ fecha: 1 }).exec();

        const notesNombres = await Promise.all(notes.map(async (nota) => {
            const [entrenador] = await Promise.all([
                User.findById(nota.idEntrenador)
            ]);
            if (!entrenador) {
                console.log('Entrenador no encontrado: ${note._id}');
                return null;
            }
            return {
                _id: nota._id,
                title: nota.title,
                fecha: nota.fecha,
                description: nota.description,
                entrenador: entrenador.name
            };
        }));
        const year = new Date().getFullYear();
        let years = [];
        for (i = year; i <= year + 3; i++) {
            years.push(i);
        }
        console.log(years);
        res.render('notes/all-notes', { notes: notesNombres, years });
    } catch (error) {
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
    console.log('HoraCita: ' + horaCita)
    //Comprueba permiso de edición
    if (note.idCliente != req.user.id) {
        if (note.idEntrenador != req.user.id) {
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
    const entrenador = await User.findById(note.idEntrenador).lean();
    const he = entrenador.horas;
    const cliente = await User.findById(note.idCliente).lean();
    //citas el mismo día
    const citasEntrenador = await Note.find({ idEntrenador: note.idEntrenador, fecha: { $gte: diaInicio, $lt: diaFin }, _id: { $ne: note._id } });
    const citasCliente = await Note.find({ idCliente: note.idCliente, fecha: { $gte: diaInicio, $lt: diaFin }, _id: { $ne: note._id } });
    const hoE = citasEntrenador.map((citasEntrenador) => moment(citasEntrenador.fecha).format('HH:mm'));
    const hoC = citasCliente.map((citasCliente) => moment(citasCliente.fecha).format('HH:mm'));
    const horasOcupadas = [...new Set([...hoE, ...hoC])];
    //guarda las horas libres comparando horario y ocupadas
    var horasLibres = he.filter((hora) => !horasOcupadas.includes(hora));
    const hoy = moment().format('YYYY-MM-DD');
    if (dia == hoy) {
        const horaActual = moment().format('HH:mm');
        horasLibres = horasLibres.filter((hora) => moment(hora, 'HH:mm').isAfter(moment(horaActual, 'HH:mm')));
    }
    console.debug('HorasLibres: ' + horasLibres);
    res.render('notes/edit-note', { note, fechaHoy, horaCita, horasLibres });
};
//Manda la petición de edición y devuelve a /notes
notesCtrl.updateNote = async (req, res) => {
    const { title, description, fecha, hora } = req.body;
    const newFecha = moment(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm').toDate();
    await Note.findByIdAndUpdate(req.params.id, { title, description, fecha: newFecha })
    // mensaje
    req.flash('success_msg', 'Nota editada correctamente');
    var permisos = req.user.permisos;
    switch (permisos) {
        case 1:
            res.redirect('/entrenador/citas');
            break;
        case 2:
            res.redirect('/notes');
            break;
        default:
            res.redirect('/');
    }
};
// Método para borrar la nota y recargar la ventana
notesCtrl.deleteNote = async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Nota eliminada con éxito');
    res.redirect('/notes')
};

notesCtrl.usersCall = async (req, res) => {
    const id = req.params.id;
    const dia = req.params.dia;
    const diaInicio = moment(dia).startOf('day');
    const diaFin = moment(dia).endOf('day');
    const idCita = req.params.idCita;
    //Guardado de datos
    if (!idCita) {
        try {
            //Busca las horas del entrenador
            const user = await User.findById(id).lean();
            const horas = user.horas;
            //busca las horas existentes del entrenador y cliente del día seleccinado
            const citasEntrenador = await Note.find({ idEntrenador: id, fecha: { $gte: diaInicio, $lt: diaFin } });
            const citasCliente = await Note.find({ idCliente: req.params.id, fecha: { $gte: diaInicio, $lt: diaFin } });
            const hoE = citasEntrenador.map((citasEntrenador) => moment(citasEntrenador.fecha).format('HH:mm'));
            const hoC = citasCliente.map((citasCliente) => moment(citasCliente.fecha).format('HH:mm'));
            console.log(hoE);
            console.log(hoC);
            const horasOcupadas = [...new Set([...hoE, ...hoC])];
            //guarda las horas disponibles
            var horasLibres = horas.filter((hora) => !horasOcupadas.includes(hora));
            //si el día es el actual retira las horas que ya hayan pasado
            const hoy = moment().format('YYYY-MM-DD');
            if (dia == hoy) {
                const horaActual = moment().format('HH:mm');
                horasLibres = horasLibres.filter((hora) => moment(hora, 'HH:mm').isAfter(moment(horaActual, 'HH:mm')));
            }
            //retorna las horas
            res.json({ horas: horasLibres });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    } else {
        try {
            console.log('ejecuta segudo')
            //Busca las horas del entrenador
            const user = await User.findById(id).lean();
            const horas = user.horas;
            //saca el id del cliente de la cita.
            const cita = await Note.findById(idCita).lean();
            const idCliente = cita.idCliente;
            //busca las horas existentes de cliente y entrenador del día seleccinado.
            const citasEntrenador = await Note.find({ idEntrenador: req.params.id, fecha: { $gte: diaInicio, $lt: diaFin }, _id: { $ne: idCita } });
            const citasCliente = await Note.find({ idCliente: idCliente, fecha: { $gte: diaInicio, $lt: diaFin }, _id: { $ne: idCita } })
            const hoE = citasEntrenador.map((citasEntrenador) => moment(citasEntrenador.fecha).format('HH:mm'));
            const hoC = citasCliente.map((citasCliente) => moment(citasCliente.fecha).format('HH:mm'));
            const horasOcupadas = [...new Set([...hoE, ...hoC])];
            //guarda las horas disponibles
            var horasLibres = horas.filter((hora) => !horasOcupadas.includes(hora));
            //si el día es el actual retira las horas que ya hayan pasado
            const hoy = moment().format('YYYY-MM-DD');
            if (dia == hoy) {
                const horaActual = moment().format('HH:mm');
                horasLibres = horasLibres.filter((hora) => moment(hora, 'HH:mm').isAfter(moment(horaActual, 'HH:mm')));
            }
            //retorna las horas
            res.json({ horas: horasLibres });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
};
module.exports = notesCtrl;