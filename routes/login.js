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

// =========================================
//  Autenticacion Google
// =========================================

const CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const CLIENT_SECRET = require('../config/config').GOOGLE_CLIENT_SECRET;

const { OAuth2Client } = require('google-auth-library');


app.post('/google', (req, res) => {

    const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, '');

    const token = req.body.token || '';

    client.verifyIdToken({ idToken: token, audience: CLIENT_ID }, (err, login) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Token No Valido',
                errors: err
            });
        }
        const payload = login.getPayload();
        const userid = payload['sub'];

        Usuario.findOne({ email: payload.email }, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al Buscar Usuario DB',
                    errors: err
                });
            }
            if (usuarioDB) {
                if (usuarioDB.google === false) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Debe usar su autenticacion normal',
                        errors: err
                    });
                } else {
                    // Crear un Token
                    usuarioDB.password = 'NoMaskes';
                    usuarioDB.google = true;

                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
                    // Token  expira en 4 horas
                    res.status(200).json({
                        ok: true,
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id
                    });


                }
                // Si el Usuario no Existe en la Base de Datos
            } else {
                var usuario = new Usuario();

                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = ':)';
                usuario.img = payload.picture;
                usuario.google = true;

                usuario.save((err, userDB) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al Crear Usuario Google en la Base de Datos User',
                            errors: err
                        });
                    }
                    var token = jwt.sign({ usuario: userDB }, SEED, { expiresIn: 14400 });
                    // Token  expira en 4 horas
                    res.status(200).json({
                        ok: true,
                        usuario: userDB,
                        token: token,
                        id: userDB._id
                    });


                });
            }



        });




    });



});

// =========================================
//  Autenticacion Normal
// =========================================



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