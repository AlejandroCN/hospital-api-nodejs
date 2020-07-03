// Dependencias de terceros
const express = require('express');
const Op = require('sequelize').Op;

// Middlewares
const autenticacion = require('../middlewares/autenticacion');

// Modelos
const Medico = require('../models/medico.model');
const Usuario = require('../models/usuario.model');
const Hospital = require('../models/hospital.model');

const app = express();

// ===========================================================================================
//  OBTENER TODOS LOS MEDICOS
// ===========================================================================================
app.post('/findAllPagesFilteredByAny', (req, res) => {
  const pageParams = req.body;

  Medico.findAndCountAll({
    include: [
      {
        model: Usuario,
        attributes: ['id', 'nombre', 'email', 'img']
      },
      Hospital
    ],
    // where medico.nombre like ? or medico.hospital.nombre like ?
    where: {
      [Op.or]: [
        {
          nombre: {
            [Op.like]: `%${pageParams.termino}%`
          }
        },
        {
          '$hospital.nombre$': {
            [Op.like]: `%${pageParams.termino}%`
          }
        }
      ]
    },
    order: [[pageParams.atributo, pageParams.direccion]],
    limit: pageParams.tamPagina,
    offset: pageParams.pagina * pageParams.tamPagina
  }).then(result => {
    const totalRegistros = result.count;
    const medicos = result.rows.map((m) => m.dataValues);

    if (medicos.length == 0) {
      res.status(404).json({
        ok: true,
        mensaje: 'No existe ningún médico en la página solicitada'
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
        mensaje: 'Médicos recuperados correctamente',
        medicos,
        pagina: pageParams.pagina,
        tamPagina: pageParams.tamPagina,
        direccion: pageParams.direccion,
        atributo: pageParams.atributo,
        totalPaginas,
        isFirstPage,
        isLastPage
      });
    }
  }).catch(err => {
    res.status(500).json({
      ok: true,
      mensaje: 'Internal Server Error',
      error: err
    });
  });
});

// ===========================================================================================
//  CREAR MEDICO
// ===========================================================================================
app.post('/', autenticacion.verificaToken, (req, res) => {
  const body = req.body;
  const nuevoMedico = Medico.build({
    usuarioId: req.usuario.id,
    hospitalId: body.hospital.id,
    nombre: body.nombre,
    img: body.img
  });

  Medico.create(nuevoMedico.dataValues).then(medicoCreado => {
    res.status(201).json({
      ok: true,
      mensaje: 'Médico creado satisfactoriamente',
      medico: medicoCreado
    });
  }).catch(err => {
    res.status(500).json({
      ok: false,
      mensaje: 'Internal Server Error',
      error: err
    });
  });
});

// ===========================================================================================
//  ACTUALIZAR MEDICO
// ===========================================================================================
app.put('/', autenticacion.verificaToken, (req, res) => {
  const body = req.body;

  Medico.findByPk(body.id).then(medicoExistente => {
    if (medicoExistente) {
      const medicoActualizado = Medico.build({
        id: body.id,
        usuarioId: req.usuario.id,
        hospitalId: body.hospital.id,
        nombre: body.nombre,
        img: body.img
      });

      Medico.update(medicoActualizado.dataValues, {
        where: {
          id: medicoActualizado.id
        }
      }).then(() => {
        res.status(201).json({
          ok: true,
          mensaje: 'Médico actualizado correctamente',
          medico: medicoActualizado
        });
      }).catch(err => {
        res.status(500).json({
          ok: false,
          mensaje: 'Internal Server Error',
          error: err
        });
      })
    } else {
      res.status(404).json({
        ok: false,
        mensaje: 'El médico que se desea actualizar no existe'
      });
    }
  }).catch(err => {
    res.status(500).json({
      ok: false,
      mensaje: 'Internal Server Error',
      error: err
    });
  })
});

// ===========================================================================================
//  ELIMINAR MEDICO
// ===========================================================================================
app.delete('/:id', autenticacion.verificaToken, (req, res) => {
  const medicoId = req.params.id;

  Medico.destroy({
    where: {
      id: medicoId
    }
  }).then(() => {
    res.status(200).json({
      ok: true,
      mensaje: 'Médico eliminado correctamente'
    });
  }).catch(err => {
    res.status(500).json({
      ok: false,
      mensaje: 'Internal Server Error',
      error: err
    });
  });
});

module.exports = app;
