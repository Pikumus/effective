import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { JwtPayload } from '../../features/auth/domain/Auth.entity';

/**
 * Middleware для проверки JWT токена
 * Извлекает токен из заголовка Authorization: Bearer <token>
 * Проверяет валидность токена и добавляет данные пользователя в req.user
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
      return;
    }

    const token = parts[1];

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    req.user = {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string | undefined,
      iat: payload.iat,
      exp: payload.exp,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.message.includes('expired')) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware для проверки роли пользователя
 * Используется после authMiddleware
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!user.role || !allowedRoles.includes(user.role)) {
        res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        return;
      }

      next();
    } catch (error) {
      res.status(403).json({ error: 'Authorization failed' });
    }
  };
};

/**
 * Middleware для проверки: "админ или владелец ресурса"
 * Проверяет, что пользователь либо admin, либо ID из параметра совпадает с его userId
 * Используется после authMiddleware
 *
 * @example
 * router.get('/:id', authMiddleware, isAdminOrOwner, controller.getById);
 */
export const isAdminOrOwner = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const resourceUserId = req.params.id;

    // Проверяем: либо админ, либо запрашивает свой ресурс
    if (user.role === 'admin' || user.userId === resourceUserId) {
      next();
      return;
    }

    res.status(403).json({
      error: 'Forbidden: You can only access your own resources or be an admin'
    });
  } catch (error) {
    res.status(403).json({ error: 'Authorization failed' });
  }
};