const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario.model');
const secretKey = require('../config/config').secret_key;

const app = express();

app.post('/', (req, res) => {
  const auth = req.body;

  // la busqueda primero se hace por email, ya que la contrasenia esta encriptada en una sola via
  Usuario.findOne({
    where: {
      email: auth.email
    }
  }).then((usuarioEncontrado) => {
    if (usuarioEncontrado) {
      // comparamos la contrasenia legible insertada con la encriptada (si es valida generamos el token)
      if (bcrypt.compareSync(auth.password, usuarioEncontrado.password)) {
        // jwt.sign(payload, secret_key, expitacion en segundos)
        usuarioEncontrado.password = '';
        const token = jwt.sign({ usuario: usuarioEncontrado }, secretKey, { expiresIn: 14400 });

        res.status(200).json({
          ok: true,
          mensaje: 'Credenciales correctas',
          token
        });
      } else {
        res.status(400).json({
          ok: false,
          mensaje: 'Bad Credentials'
        });
      }
    } else {
      res.status(400).json({
        ok: false,
        mensaje: 'Bad Credentials'
      });
    }
  }).catch(err => {
    res.status(500).json({
      ok: false,
      mensaje: 'Internal Server Error',
      error: err
    });
  });
});

module.exports = app;
