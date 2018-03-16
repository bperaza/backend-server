// Rutas
var express = require('express');
var app = express();
// Para Encryptar Contraseñas
var bcrypt = require('bcryptjs');

var midAutenticacion = require('../middleware/autenticacion');

// BodyParser
// Parser para x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// Parser para json
app.use(express.json());


// Importar el Modelo
var Usuario = require('../models/usuario');

// =============================================
//  Mostrar Todos los Usuarios
// =============================================

app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({})
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'ERROR Cargando Usuarios',
                    errors: err
                });
            }
            Usuario.count({}, (err, total) => {
                res.status(200).json({
                    ok: true,
                    //mensaje: 'Petición GET de Usuarios',
                    usuarios: usuarios,
                    totalRegistro: total
                });
            });
        });
});


// =============================================
//  Crear un nuevo Usuario
// =============================================

app.post('/', midAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR Creando Usuario',
                errors: err
            });
        }
        // Code 201 = Created
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario,
            mensaje: 'CREATED'
        });

    });
});


// =============================================
//  Actualizar Usuario
// =============================================

app.put('/:id', midAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var id = req.params.id;
    Usuario.findById(id, (err, usuarioEncontrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR al Buscar Registro',
                errors: err
            });
        }

        usuarioEncontrado.nombre = body.nombre;
        usuarioEncontrado.email = body.email;


        usuarioEncontrado.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ERROR al Actualizar Usuario',
                    errors: err
                });
            }

            // No Mostrar el Password
            usuarioGuardado.password = 'No mames :)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                mensaje: 'Usuario Actualizado Correctamente OK!!'
            });

        });


    });
});

// =============================================
//  Delete Usuario
// =============================================
app.delete('/:id', midAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR al Borrar Usuario',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuarioBorrado: usuarioBorrado,
            mensaje: 'Borrado correctamente'
        });
    });
});

module.exports = app;