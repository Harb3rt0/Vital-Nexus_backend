const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rutas
app.use('/api/pacientes', require('./routes/pacienteRoutes'));
app.use('/api/expedientes', require('./routes/expedienteRoutes'));
app.use('/api/administradores', require('./routes/administradorRoutes'));
app.use('/api/establecimientos', require('./routes/establecimientoRoutes'));
app.use('/api/inventarios', require('./routes/inventarioRoutes'));
app.use('/api/medicamentos', require('./routes/medicamentoRoutes'));
app.use('/api/medicos', require('./routes/medicoRoutes'));
app.use('/api/nodos', require('./routes/nodoRoutes'));
app.use('/api/recetas', require('./routes/recetaRoutes'));

// Ruta base
app.get('/', (req, res) => {
  res.send('API de Vital Nexus funcionando correctamente.');
});

// Manejo de errores básico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal en el servidor!');
});

app.listen(port, () => {
  console.log(`Servidor de Vital Nexus corriendo en el puerto ${port}`);
});