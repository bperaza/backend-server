var express = require('express');
var app = express();
var fs = require('fs');

app.get('/:img', (req, res, next) => {

    var img = req.params.img;
    var path = `./uploads/${ img }`;

    fs.exists(path, (existe) => {
        // Sino existe la imagen se envia una imagen Default
        if (!existe) {
            path = './assets/no-img.jpg';
        }
        //Si existe regresamos el File
        res.sendfile(path);
    });


});

module.exports = app;