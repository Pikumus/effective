/// <reference path="../shared/types/express.d.ts" />
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from '../features/users/presentation/user.routes';
import authRoutes from '../features/auth/presentation/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Effective API - Feature-based Architecture with Prisma',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
});

export default app;