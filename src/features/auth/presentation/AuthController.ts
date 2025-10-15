import { Request, Response } from 'express';
import { AuthService } from '../application/AuthService';

/**
 * Presentation Layer - Auth Controller
 * Обрабатывает HTTP запросы для аутентификации
 */
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Регистрация нового пользователя
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Валидация
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await this.authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        error: 'Registration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/auth/login
   * Вход пользователя
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await this.authService.login({ email, password });

      res.status(200).json(result);
    } catch (error) {
      res.status(401).json({
        error: 'Login failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Получить информацию о текущем пользователе
   * Требует JWT токен в заголовке Authorization
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // Данные пользователя добавляются middleware
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to get user info',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/auth/verify
   * Проверить валидность JWT токена
   */
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      const payload = await this.authService.verifyToken(token);

      res.status(200).json({
        valid: true,
        payload,
      });
    } catch (error) {
      res.status(401).json({
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid token',
      });
    }
  }
}