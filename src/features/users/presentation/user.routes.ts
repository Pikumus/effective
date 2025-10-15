import { Router } from 'express';
import { UserController } from './UserController';
import { UserService } from '../application/UserService';
import { UserRepository } from '../infrastructure/UserRepository';
import { authMiddleware, roleMiddleware, isAdminOrOwner } from '../../../shared/middleware/auth.middleware';

/**
 * Presentation Layer - Routes
 * Определяет маршруты для фичи users с проверкой прав доступа
 */

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();

/**
 * GET /api/users - Получение списка пользователей
 * Доступ: только admin
 */
router.get('/',
  authMiddleware,
  roleMiddleware(['admin']),
  (req, res) => userController.getUsers(req, res)
);

/**
 * GET /api/users/:id - Получение пользователя по ID
 * Доступ: admin или сам пользователь
 */
router.get('/:id',
  authMiddleware,
  isAdminOrOwner,
  (req, res) => userController.getUserById(req, res)
);

/**
 * PATCH /api/users/:id/status - Блокировка/разблокировка пользователя
 * Доступ: admin или сам пользователь
 * Body: { "status": true/false } (true = активен, false = заблокирован)
 */
router.patch('/:id/status',
  authMiddleware,
  isAdminOrOwner,
  (req, res) => userController.toggleUserStatus(req, res)
);

/**
 * DELETE /api/users/:id - Удаление пользователя
 * Доступ: admin или сам пользователь
 */
router.delete('/:id',
  authMiddleware,
  isAdminOrOwner,
  (req, res) => userController.deleteUser(req, res)
);

export default router;