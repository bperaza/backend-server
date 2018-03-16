// Rutas
var express = require('express');
var app = express();
var midAutenticacion = require('../middleware/autenticacion');
// BodyParser
// Parser para x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// Parser para json
app.use(express.json());

// Importar el Modelo
var Registro = require('../models/medico');

// =============================================
//  Mostrar Todos los Registros
// =============================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Registro.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, registros) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'ERROR Cargando Registros',
                    errors: err
                });
            }
            Registro.count({}, (err, total) => {
                res.status(200).json({
                    ok: true,
                    registros: registros,
                    total: total
                });

            });

        });
});


// =============================================
//  Crear un nuevo Registro
// =============================================

app.post('/', (req, res) => {
    var body = req.body;
    var registro = new Registro({
        nombre: body.nombre,
        usuario: body.usuario,
        hospital: body.hospital
    });

    registro.save((err, registroGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR Creando Registro',
                errors: err
            });
        }
        // Code 201 = Created
        res.status(201).json({
            ok: true,
            registro: registroGuardado,
            mensaje: 'CREATED'
        });

    });
});



// =============================================
//  Actualizar Registro
// =============================================

app.put('/:id', (req, res) => {

    var body = req.body;
    var id = req.params.id;

    Registro.findById(id, (err, registroEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR al Buscar Registro con Id= ' + id,
                errors: err
            });
        }

        if (!registroEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El Registro con el Id ' + id + ' no existe.',
                errors: err
            });
        }

        registroEncontrado.nombre = body.nombre;


        registroEncontrado.save((err, registroGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ERROR al Actualizar Registro',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                registro: registroGuardado,
                mensaje: 'Registro Actualizado Correctamente OK!!'
            });

        });


    });
});

// =============================================
//  Delete Registro
// =============================================
app.delete('/:id', (req, res) => {

    var id = req.params.id;

    Registro.findByIdAndRemove(id, (err, registroBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR al Borrar Registro',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            registro: registroBorrado,
            mensaje: 'Registro Borrado Correctamente'
        });
    });
});

module.exports = app;