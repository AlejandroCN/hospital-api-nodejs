const { Model, Sequelize, DataTypes } = require('sequelize');

const { database, user, password, host, dialect } = require('../config/config');
const Usuario = require('./usuario.model');

const conexion = new Sequelize(database, user, password, {
  host,
  dialect
});

class Hospital extends Model {}

Hospital.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  usuarioId: {
    type: DataTypes.BIGINT,
    field: 'usuario_id'
  },
  nombre: {
    type: DataTypes.STRING
  },
  img: {
    type: DataTypes.STRING
  }
}, {
  sequelize: conexion,
  modelName: 'hospital',
  tableName: 'hospitales',
  timestamps: false
});
// belongsTo, por defecto, va a establecer como nombre de la llave foranea el nombre del modelo objetivo más el
// nombre de su clave primaria usando camelCase, para este caso seria: usuarioId, dicho atributo está definido
// arriba en los atributos de hospital y mapeado a la columna usuario_id de la tabla de la base de datos
Hospital.belongsTo(Usuario);

module.exports = Hospital;
