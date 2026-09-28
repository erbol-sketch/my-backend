require('dotenv').config();

const dns = require('dns');
// Локально используем публичные DNS, чтобы mongodb+srv:// нормально резолвился
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Главная и health-check (Render использует для проверки)
app.get('/', (req, res) => {
  res.json({ message: 'API работает', docs: '/api-docs' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Роуты
app.use('/api/auth', authRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Общий обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });