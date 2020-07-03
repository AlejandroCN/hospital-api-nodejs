// importaciones
const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const { database, user, password, host, dialect } = require('./config/config');

// Importaciones de archivos de rutas
const loginRoutes = require('./routes/login.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const hospitalRoutes = require('./routes/hospital.routes');
const medicoRoutes = require('./routes/medico.routes');
const uploadRoutes = require('./routes/uploads.routes');

// inicializaciones
const app = express();

// Configuracion del Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexion Base de Datos
const conexion = new Sequelize(database, user, password, {
  host: host,
  dialect: dialect
});
conexion.authenticate().then(msg => {
  console.log('Conexión exitosa a base de datos mysql');
}).catch(err => {
  console.log(err);
});

// Rutas
app.use('/login', loginRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/hospitales', hospitalRoutes);
app.use('/medicos', medicoRoutes);
app.use('/uploads', uploadRoutes);

// escuchar peticiones
app.listen(3000, () => {
  console.log('Servidor NodeJS levantado en el puerto 3000');
});
