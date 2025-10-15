import { JwtPayload } from '../../features/auth/domain/Auth.entity';

/**
 * Расширение типов Express Request
 * Добавляет поле user с данными из JWT токена
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};