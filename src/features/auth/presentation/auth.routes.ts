import { Router } from 'express';
import { AuthController } from './AuthController';
import { AuthService } from '../application/AuthService';
import { UserRepository } from '../../users/infrastructure/UserRepository';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';

/**
 * Presentation Layer - Auth Routes
 * Определяет маршруты для аутентификации
 */

// Dependency Injection
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const router = Router();

// Публичные роуты (не требуют авторизации)
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/verify', (req, res) => authController.verifyToken(req, res));

// Защищенные роуты (требуют JWT токен)
router.get('/me', authMiddleware, (req, res) => authController.getCurrentUser(req, res));

export default router;