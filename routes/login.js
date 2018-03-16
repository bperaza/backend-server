var express = require('express');
var bcrypt = require('bcryptjs');
// sign with default (HMAC SHA256)
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// Parser para x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// Parser para json
app.use(express.json());

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR FindOne Usuario',
                errors: err
            });
        }

        if (!userDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - password',
                errors: err
            });
        }

        userDB.password = 'No Enviar Contraseña :)';
        // Crear un Token
        var token = jwt.sign({ usuario: userDB }, SEED, { expiresIn: 14400 });
        // Token  expira en 4 horas

        res.status(200).json({
            ok: true,
            usuario: userDB,
            token: token,
            id: userDB._id
        });


    });



});

module.exports = app;