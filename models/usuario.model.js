const { Model, DataTypes, Sequelize } = require('sequelize');

const conexion = new Sequelize('hospital', 'root', 'Pkmn05Blue', {
  host: 'localhost',
  dialect: 'mysql'
});

class Usuario extends Model {}

Usuario.init({
  // Atributos del modelo
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Debe indicar su nombre'
      },
      len: {
        args: [3, 120],
        msg: 'El nombre debe contener al menos 3 letras, máximo 120'
      },
      is: {
        args: /[ A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/,
        msg: 'El nombre es inválido, use sólo letras'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Debe indicar su email'
      },
      isEmail: {
        args: true,
        msg: 'Ingrese una dirección de correo válida'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Debe indicar su contraseña'
      }
    }
  },
  img: {
    type: DataTypes.STRING
  },
  role: {
    type: DataTypes.STRING,
    validate: {
      notEmpty: {
        args: true,
        msg: 'Debe indicar el rol del usuario'
      },
      isIn: {
        args: [['USER_ROLE', 'ADMIN_ROLE']],
        msg: 'El rol indicado no es un rol permitido'
      }
    }
  }
}, {
  sequelize: conexion,
  modelName: 'User',
  tableName: 'usuarios',
  timestamps: false
});

module.exports = Usuario;
