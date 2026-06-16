const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Intentar obtener el token de las cookies
  let token = req.cookies ? req.cookies.admin_token : null;

  // 2. Fallback: Intentar obtener el token de la cabecera Authorization (Bearer Token)
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  // 3. Si no hay token, denegar acceso
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. No se encontró ninguna sesión activa.'
    });
  }

  try {
    // 4. Verificar el token usando la clave secreta
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);

    // 5. Inyectar datos del administrador autenticado en la petición
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Error al verificar token JWT:', error.message);

    // Limpiar cookie de sesión inválida
    res.clearCookie('admin_token');

    return res.status(401).json({
      success: false,
      message: 'Sesión inválida o expirada. Por favor, inicie sesión de nuevo.'
    });
  }
};

module.exports = authMiddleware;
