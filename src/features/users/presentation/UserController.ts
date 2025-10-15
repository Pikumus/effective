import { Request, Response } from 'express';
import { UserService } from '../application/UserService';

/**
 * Presentation Layer - Controller
 * Обрабатывает HTTP запросы и возвращает ответы
 */
export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();

      // Убираем пароли из ответа
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);

      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch user',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await this.userService.createUser({
        email,
        password,
        firstName,
        lastName,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }


  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * PATCH /users/:id/status
   * Блокировка/разблокировка пользователя
   */
  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (typeof status !== 'boolean') {
        res.status(400).json({ error: 'Status must be a boolean (true = active, false = blocked)' });
        return;
      }

      const user = await this.userService.toggleUserStatus(id, status);

      const { password, ...userWithoutPassword } = user;
      res.json({
        ...userWithoutPassword,
        message: status ? 'User activated' : 'User blocked'
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update user status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}