const express = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario.model');
// este es el middleware encargado de revisar si el token de autorizacion es correcto
const autenticacion = require('../middlewares/autenticacion');

const app = express();

// ======================================================
// OBTENER TODOS LOS USUARIOS
// ======================================================
app.get('/', (req, res, next) => {
  Usuario.findAll().then((users) => {
    if (users.length == 0) {
      res.status(404).json({
        ok: true,
        mensaje: 'No existe ningún usuario registrado en la base de datos!'
      });
    } else {
      res.status(200).json({
        ok: true,
        mensaje: 'Usuarios recuperados',
        usuarios: users
      });
    }
  }).catch((err) => {
    res.status(500).json({
      ok: false,
      mensaje: 'Internal Server Error'
    });
  });
});

// ======================================================
// CREAR NUEVO USUARIO (autenticacion.verificaToken es el middleware)
// ======================================================
app.post('/', autenticacion.verificaToken, (req, res) => {
  // obtenemos el RequestBody con ayuda del middleware BoddyParser
  const usuario = req.body;
  usuario.password = bcrypt.hashSync(usuario.password, 10);

  Usuario.create(usuario).then((usuarioCreado) => {
    usuarioCreado.password = '';
    res.status(201).json({
      ok: true,
      mensaje: 'Usuario Creado satisfactoriamente',
      usuarioCreado
    });
  }).catch((err) => {
    // si el error es por las validaciones contestamos con un 400 (BAD_REQUEST)
    if (err.name == 'SequelizeValidationError') {
      res.status(400).json({
        ok: false,
        mensaje: 'Error en las validaciones',
        error: err
      });
    } else {
      res.status(500).json({
        ok: false,
        mensaje: 'Internal Server Error',
        error: err
      });
    }
  });
});

// ======================================================
// ACTUALIZAR USUARIO
// Actualizamos nombre, email y rol, no se toca el password
// ======================================================
app.put('/', autenticacion.verificaToken, (req, res) => {
  // recuperamos los parametros del RequestBody usando BoddyParser
  const usuario = req.body;

  // lo primero es validar si existe el usuario que se desea actualizar
  Usuario.findByPk(usuario.id).then((usuarioEncontrado) => {
    if (usuarioEncontrado) {
      usuarioEncontrado.nombre = usuario.nombre;
      usuarioEncontrado.email = usuario.email;
      usuarioEncontrado.role = usuario.role;

      Usuario.update(usuarioEncontrado.dataValues, {
        where: {
          id: usuarioEncontrado.id
        }
      }).then(() => {
        usuarioEncontrado.password = '';
        res.status(201).json({
          ok: true,
          mensaje: 'Usuario actualizado correctamente!',
          usuario: usuarioEncontrado
        });
      }).catch(err => {
        res.status(500).json({
          ok: false,
          mensaje: 'Internal Server Error',
          error: err
        });
      });
    } else {
      res.status(404).json({
        ok: false,
        mensaje: 'El usuario que se desea actualizar no existe!'
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

// ======================================================
// ELIMINAR USUARIO
// ======================================================
app.delete('/:id', autenticacion.verificaToken, (req, res) => {
  const usuarioId = req.params.id;

  Usuario.destroy({
    where: {
      id: usuarioId
    }
  }).then(() => {
    res.status(200).json({
      ok: true,
      mensaje: 'Usuario eliminado correctamente'
    });
  }).catch(err => {
    res.status(500).json({
      ok: false,
      mensaje: 'Internal Server Error',
      data: err
    });
  });
});

module.exports = app;
