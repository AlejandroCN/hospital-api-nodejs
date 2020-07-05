// Dependencias de terceros
const express = require('express');
const bcrypt = require('bcryptjs');
const Op = require('sequelize').Op;

// Middlewares
const autenticacion = require('../middlewares/autenticacion');

// Modelos
const Usuario = require('../models/usuario.model');

const app = express();

// ======================================================
// OBTENER TODOS LOS USUARIOS
// ======================================================
app.post('/findAllPagesFilteredByAny', (req, res, next) => {
  const pageParams = req.body;

  Usuario.findAndCountAll({
    attributes: ['id', 'nombre', 'email', 'img', 'role'],
    where: {
      [Op.or]: [
        {
          nombre: { [Op.like]: `%${pageParams.termino}%` }
        },
        {
          email: { [Op.like]: `%${pageParams.termino}%` }
        }
      ]
    },
    order: [[pageParams.atributo, pageParams.direccion]],
    limit: pageParams.tamPagina,
    offset: pageParams.pagina * pageParams.tamPagina
  }).then(resp => {
    const totalRegistros = resp.count;
    const usuarios = resp.rows.map((u) => u.dataValues);

    if (usuarios.length == 0) {
      res.status(404).json({
        ok: false,
        mensaje: 'No existe ningún usuario registrado en la página solicitada'
      });
    } else {
      let totalPaginas = totalRegistros / pageParams.tamPagina;
      if (totalPaginas % 1 != 0) {
        totalPaginas = Math.floor(totalPaginas) + 1;
      }

      let isFirstPage = false;
      if (pageParams.pagina == 0) {
        isFirstPage = true;
      }

      let isLastPage = false;
      if ((totalPaginas - 1) == pageParams.pagina) {
        isLastPage = true;
      }

      res.status(200).json({
        ok: true,
        mensaje: 'Usuarios recuperados correctamente',
        usuarios,
        pagina: pageParams.pagina,
        tamPagina: pageParams.tamPagina,
        direccion: pageParams.direccion,
        atributo: pageParams.atributo,
        totalPaginas,
        isFirstPage,
        isLastPage
      });
    }
  }).catch((err) => {
    res.status(500).json({
      ok: false,
      mensaje: 'Internal Server Error',
      error: err
    });
  });
});

// ======================================================
// CREAR NUEVO USUARIO (autenticacion.verificaToken es el middleware)
// ======================================================
app.post('/', (req, res) => {
  // obtenemos el RequestBody con ayuda del middleware BoddyParser
  const body = req.body;
  const usuario = Usuario.build({
    nombre: body.nombre,
    email: body.email,
    password: body.password,
    img: body.img,
    role: body.role
  });

  usuario.validate().then(() => {
    usuario.password = bcrypt.hashSync(usuario.password, 10);
    Usuario.create(usuario.dataValues).then((usuarioCreado) => {
      usuarioCreado.password = '';
      res.status(201).json({
        ok: true,
        mensaje: 'Usuario Creado satisfactoriamente',
        usuario: usuarioCreado
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
  }).catch(err => {
    return res.status(400).json({
      ok: false,
      mensaje: 'Error en validaciones!',
      error: err
    });
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
