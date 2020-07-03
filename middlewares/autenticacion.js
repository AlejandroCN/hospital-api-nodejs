const jwt = require('jsonwebtoken');
const secretKey = require('../config/config').secret_key;

// ======================================================
// VERIFICAR TOKEN
// se exporta esta funcion para que sea usada en otros lugares, lo que hace es validar un jwt
// ======================================================
exports.verificaToken = function(req, res, next) {
  let token = req.headers.authorization;
  if (!token) {
    res.status(403).json({
      ok: false,
      mensaje: 'Debe incluir el token de autorización'
    });
    return;
  }

  // le quitamos el 'Bearer ' al token
  token = token.split(" ")[1];
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(401).json({
        ok: false,
        mensaje: 'Token inválido',
        error: err
      });
      return;
    }
    // como este middleware se ejecuta antes que cualquier peticion que lo implemente, podemos agregar datos al
    // request, por ejemplo el usuario que viene en el payload del token, esto es util en los sistemas donde
    // cada usuario tiene roles y ademas pertenece a alguna institucion, por ejemplo para saber a qué hospital
    // pertenece el usuario, ya no es necesario enviar esos datos porque estan en el token.
    req.usuario = decoded.usuario;
    // con esto indicamos que puede continuar con las peticiones
    next();
  });
}
