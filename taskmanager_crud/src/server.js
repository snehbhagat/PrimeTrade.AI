const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/v1/authRoutes');
const taskRoutes = require('./routes/v1/taskRoutes');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

require('dotenv').config();
require('./config/redis');

const app = express();
const swaggerDoc = YAML.load('./swagger.yaml');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Health check
app.get('/', (req, res) => {
  res.json({ message: '🚀 TaskManager API is running' });
});

// Routes (we'll add these soon)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/tasks', taskRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});