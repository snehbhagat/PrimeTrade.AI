const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

require('./config/redis');

const authRoutes = require('./routes/v1/authRoutes');
const taskRoutes = require('./routes/v1/taskRoutes');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDoc = YAML.load('./swagger.yaml');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'TaskManager API is running' });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Only listen when running locally, not on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;