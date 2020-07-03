// Dependencias de terceros
const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path'); // ayuda a resolver paths del file system

// modelos
const Usuario = require('../models/usuario.model');
const Medico = require('../models/medico.model');
const Hospital = require('../models/hospital.model');

const app = express();

// middleware necesario para el manejo de archivos recibidos
app.use(fileUpload());

// ============================================================================
// SUBIR UNA imagen
// Se debe indicar un tipo: ['usuarios', 'medicos', 'hospitales'] que va a
// coincidir con el nombre del directorio donde se va a almacenar dicha imagen,
// ademas se indica el id del registro (medico, usuario u hospital) para generar
// un nombre unico para el archivo y almacenarlo sin conflictos.
// ============================================================================
app.put('/:tipo/:id', (req, res) => {
  const tiposPermitidos = ['hospitales', 'medicos', 'usuarios'];
  const id = req.params.id;
  const tipo = req.params.tipo;

  // validar que el tipo recibido sea valido
  if (tiposPermitidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'El tipo indicado por la url no es válido!'
    });
  }

  // si no se recibe ningun archivo que se llame imagen, se regresa un error
  if (!req.files.imagen) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No se recibió ningún archivo!'
    });
  }
  // ontener el archivo (se debe enviar con el nombre: 'imagen')
  const archivo = req.files.imagen;
  const nombrePorPartes = archivo.name.split('.');
  const extension = nombrePorPartes[nombrePorPartes.length - 1];

  // arreglo con los tipos de imagenes permitidas
  const extensionesValidas = ['jpg', 'jpeg', 'png', 'gif'];
  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'La extensión del archivo no es válida'
    });
  }

  // asignar un nombre al archivo ('id-{0-9}{3}.extension')
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
  const path = `./uploads/${tipo}/${nombreArchivo}`;
  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Internal Server Error',
        error: err
      });
    }

    asignarImagenSegunTipo(tipo, id, nombreArchivo, res);
  });
});

// esta es una forma horrorosa de hacerlo, cambiar por arquitectura centrada en
// el dominio para un proyecto serio.
function asignarImagenSegunTipo(tipo, id, nombreArchivo, res) {
  if (tipo == 'usuarios') {
    Usuario.findByPk(id).then((usuarioExistente) => {
      if (usuarioExistente) {
        // si el usuario ya tiene una imagen cargada, se elimina antes
        const pathImagenAnterior = `./uploads/usuarios/${usuarioExistente.img}`;
        if (fs.existsSync(pathImagenAnterior)) {
          fs.unlink(pathImagenAnterior, err => {
            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: 'Internal Server Error',
                error: err
              });
            }
          });
        }
        actualizarUsuario(usuarioExistente.dataValues, nombreArchivo, res);
      } else {
        res.status(404).json({
          ok: false,
          mensaje: 'No existe el usuario al que se intenta cargar la imagen'
        });
      }
    }).catch(err => {
      res.status(500).json({
        ok: false,
        mensaje: 'Internal Server Error',
        error: err
      });
    });
  } else if (tipo == 'medicos') {
    Medico.findByPk(id).then(medicoExistente => {
      if (medicoExistente) {
        const pathImagenAnterior = `./uploads/medicos/${medicoExistente.img}`;
        if (fs.existsSync(pathImagenAnterior)) {
          fs.unlink(pathImagenAnterior, err => {
            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: 'Internal Server Error',
                error: err
              });
            }
          });
        }
        actualizarMedico(medicoExistente.dataValues, nombreArchivo, res);
      } else {
        res.status(404).json({
          ok: false,
          mensaje: 'No existe el médico al que se intenta cargar la imagen'
        });
      }
    }).catch(err => {
      res.status(500).json({
        ok: false,
        mensaje: 'Internal Server Error',
        error: err
      });
    });
  } else if (tipo = 'hospitales') {
    Hospital.findByPk(id).then(hospitalExistente => {
      if (hospitalExistente) {
        const pathImagenAnterior = `./uploads/hospitales/${hospitalExistente.img}`;
        if (fs.existsSync(pathImagenAnterior)) {
          fs.unlink(pathImagenAnterior, err => {
            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: 'Internal Server Error',
                error: err
              });
            }
          });
        }
        actualizarHospital(hospitalExistente.dataValues, nombreArchivo, res);
      } else {
        res.status(404).json({
          ok: false,
          mensaje: 'No existe el hospital al que se intenta cargar la imagen'
        });
      }
    }).catch(err => {
      res.status(500).json({
        ok: false,
        mensaje: 'Internal Server Error',
        error: err
      });
    });
  }
}

function actualizarUsuario(usuario, nombreArchivo, res) {
  usuario.img = nombreArchivo;

  Usuario.update(usuario, {
    where: {
      id: usuario.id
    }
  }).then(() => {
    usuario.password = '';
    res.status(201).json({
      ok: true,
      mensaje: 'La imagen se ha cargado y asociado al usuario de forma correcta',
      usuario
    });
  }).catch(err => {
    res.status(500).json({
      ok: false,
      mensaje: 'Imagen cargada, sin embargo, no fue posible asociarla al usuario',
      error: err
    });
  });
}

function actualizarMedico(medico, nombreArchivo, res) {
  medico.img = nombreArchivo;

  Medico.update(medico, {
    where: {
      id: medico.id
    }
  }).then(() => {
    res.status(201).json({
      ok: true,
      mensaje: 'La imagen se ha cargado y asociado al médico de forma correcta',
      medico
    });
  }).catch(err => {
    res.status(500).json({
      ok: false,
      mensaje: 'Imagen cargada, sin embargo, no fue posible asociarla al médico',
      error: err
    });
  });
}

function actualizarHospital(hospital, nombreArchivo, res) {
  hospital.img = nombreArchivo;

  Hospital.update(hospital, {
    where: {
      id: hospital.id
    }
  }).then(() => {
    res.status(201).json({
      ok: true,
      mensaje: 'La imagen se ha cargado y asociado al hospital de forma correcta',
      hospital
    });
  }).catch(err => {
    res.status(500).json({
      ok: false,
      mensaje: 'Internal Server Error',
      error: err
    });
  });
}

// ============================================================================
// OBTENER UNA IMAGEN
// ============================================================================
app.get('/:tipo/:img', (req, res) => {
  const tipo = req.params.tipo;
  const img = req.params.img;

  // resolve nos da la ruta absoluta del archivo actual (uploads.routes.js),
  // independientemente del filesystem, por eso indicamos despues de __dirname
  // la ruta relativa al directorio actual de la imagen que se desea obtener
  const pathImg = path.resolve(__dirname, `../uploads/${tipo}/${img}`);
  if (fs.existsSync(pathImg)) {
    res.sendFile(pathImg);
  } else {
    // si no existe la imagen se envia na por defecto...
    const pathImg = path.resolve(__dirname, `../assets/images/no-img.jpg`);
    res.sendFile(pathImg);
  }
});


module.exports = app;
