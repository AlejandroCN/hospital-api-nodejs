const { Sequelize, Model, DataTypes } = require('sequelize');

const { database, user, password, host, dialect } = require('../config/config');
const Usuario = require('./usuario.model');
const Hospital = require('./hospital.model');

const conexion = new Sequelize(database, user, password, {
  host,
  dialect
});

class Medico extends Model {}

Medico.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  usuarioId: {
    type: DataTypes.BIGINT,
    field: 'usuario_id'
  },
  hospitalId: {
    type: DataTypes.BIGINT,
    field: 'hospital_id'
  },
  nombre: {
    type: DataTypes.STRING,
    validate: {
      is: {
        args: /[ A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/,
        msg: 'Ingrese un nombre válido, use solo letras'
      },
      len: {
        args: [[3, 120]],
        msg: 'El nombre debe contener al menos 3 letras, máximo 120'
      },
      notEmpty: {
        args: true,
        msg: 'Debe indicar el nombre del médico'
      }
    }
  },
  img: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Debe indicar el nombre de la imagen'
      }
    }
  }
}, {
  sequelize: conexion,
  modelName: 'medico',
  tableName: 'medicos',
  timestamps: false
});

Medico.belongsTo(Usuario);
Medico.belongsTo(Hospital);

module.exports = Medico;
