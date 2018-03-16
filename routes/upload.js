const express = require('express');
const fileUpload = require('express-fileupload');
var dateFormat = require('dateformat');
var fs = require('fs');
const app = express();

// default options
app.use(fileUpload());

// Importar el Modelo
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.post('/:tipo/:iduser', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.iduser;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No files were uploaded.',
            error: { message: 'Debe seleccionar una imagen' }
        });
    }
    // Obtener Nombre del Archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones de Archivos Validas
    var extensionesValidas = ['png', 'gif', 'bmp', 'jpg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión de Archivo No Valida',
            error: { message: 'Debe seleccionar una imagen válida  ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre personalizado del Nombre del Archivo "user-yyyymmdd-HHMMss.extension"
    var nombreArchivo = `${ id }-${dateFormat(new Date(), "yyyymmdd-HHMss") }.${ extensionArchivo }`;

    // Mover Archivo del Temporal a un Path del Server
    var path = `./uploads/${ nombreArchivo }`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Mover archivo ',
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        /*return res.status(200).json({
            ok: true,
            mensaje: 'Archivo subido correctamente!! ',
            archivo: path,
            tipo: tipo
        });*/
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuarioEncontrado) => {

            if (!usuarioEncontrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar Usuario ',
                    error: err
                });
            }


            var pathViejo = 'uploads/' + usuarioEncontrado.img;
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Usuario ',
                    error: err
                });
            }
            // Si existe, sobreescribe la anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuarioEncontrado.img = nombreArchivo;

            usuarioEncontrado.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen ',
                        error: err
                    });
                }
                usuarioActualizado.password = ')';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Usuario Actualizada!! ',
                    usuario: usuarioActualizado
                });

            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medicoEncontrado) => {

            if (!medicoEncontrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar Medico ',
                    error: err
                });
            }

            var pathViejo = 'uploads/' + medicoEncontrado.img;
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Medico ',
                    error: err
                });
            }
            // Si existe, sobreescribe la anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medicoEncontrado.img = nombreArchivo;

            medicoEncontrado.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen ',
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Medico Actualizado!! ',
                    medico: medicoActualizado
                });

            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospitalEncontrado) => {

            if (!hospitalEncontrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar Hospital ',
                    error: err
                });
            }

            var pathViejo = 'uploads/' + hospitalEncontrado.img;
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Hospital ',
                    error: err
                });
            }
            // Si existe, sobreescribe la anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospitalEncontrado.img = nombreArchivo;

            hospitalEncontrado.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar imagen ',
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Hospital Actualizado!! ',
                    hospital: hospitalActualizado
                });

            });
        });
    }


}




module.exports = app;