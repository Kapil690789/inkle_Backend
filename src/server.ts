import express from 'express';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import feedRoutes from './routes/feed.routes';
import userRoutes from './routes/user.routes';

const app = express();
app.use(express.json());

// 1. Rate Limiter (Security Bonus)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use(limiter);

// 2. Routes
app.use('/api/auth', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/users', userRoutes);

// 3. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});