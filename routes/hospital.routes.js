const express = require('express');
const Op = require('sequelize').Op;

const Hospital = require('../models/hospital.model');
const Usuario = require('../models/usuario.model');
const autenticacion = require('../middlewares/autenticacion');

const app = express();

// ===========================================================================================
//  OBTENER TODOS LOS HOSPITALES PAGINADOS
// ===========================================================================================
app.post('/findAllPagesFilteredByAny', (req, res) => {
  const pageParams = req.body;

  Hospital.findAndCountAll({
    where: {
      nombre: { [Op.like]: `%${pageParams.termino}%` }
    },
    order: [[pageParams.atributo, pageParams.direccion]],
    limit: pageParams.tamPagina,
    offset: pageParams.pagina * pageParams.tamPagina,
    include: [{
      model: Usuario,
      attributes: ['id', 'nombre', 'email', 'img']
    }]
  })
  .then(result => {
    const totalRegistros = result.count;
    const hospitales = result.rows.map((h) => h.dataValues);

    if (hospitales.length == 0) {
      res.status(404).json({
        ok: false,
        mensaje: 'No existe ningún hospital en la página solicitada'
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
        mensaje: 'Hospitales recuperados correctamente',
        hospitales,
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
      ok: false,
      mensaje: 'Internal Server Error',
      error: err
    });
  });
});

// ===========================================================================================
//  CREAR HOSPITAL
// ===========================================================================================
app.post('/', autenticacion.verificaToken, (req, res) => {
  const body = req.body;
  const nuevoHospital = Hospital.build({
    usuarioId: req.usuario.id,
    nombre: body.nombre,
    img: body.img
  });

  Hospital.create(nuevoHospital.dataValues).then(hospitalCreado => {
    res.status(201).json({
      ok: true,
      mensaje: 'Hospital creado satisfactoriamente',
      hospital: hospitalCreado
    });
  }).catch(err => {
    res.status(500).json({
      ok: false,
      mensaje: 'Internal Server Error',
      error: err
    })
  });
});

// ===========================================================================================
//  ACTUALIZAR HOSPITAL
// ===========================================================================================
app.put('', autenticacion.verificaToken, (req, res) => {
  const body = req.body;

  Hospital.findByPk(body.id).then((hospitalExistente) => {
    if (hospitalExistente) {
      const hospitalActualizado = Hospital.build({
        id: body.id,
        usuarioId: req.usuario.id,
        nombre: body.nombre,
        img: body.img
      });

      Hospital.update(hospitalActualizado.dataValues, {
        where: {
          id: hospitalActualizado.id
        }
      }).then(() => {
        res.status(201).json({
          ok: true,
          mensaje: 'Hospital actualizado correctamente',
          hospital: hospitalActualizado
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
        mensaje: 'No existe el hospital indicado para ser actualizado'
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

// ===========================================================================================
//  ELIMINAR HOSPITAL
// ===========================================================================================
app.delete('/:id', autenticacion.verificaToken, (req, res) => {
  const hospitalId = req.params.id;

  Hospital.destroy({
    where: {
      id: hospitalId
    }
  }).then(() => {
    res.status(200).json({
      ok: true,
      mensaje: 'Hospital eliminado correctamente'
    });
  }).catch(err => {
    res.status(500).json({
      ok: true,
      mensaje: 'Internal Server Error',
      error: err
    });
  });
});

module.exports = app;
