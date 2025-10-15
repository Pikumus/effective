import { RegisterDTO, LoginDTO, AuthResponse, JwtPayload } from './Auth.entity';

/**
 * Domain Layer - Auth Service Interface
 * Определяет контракт для сервиса аутентификации
 */
export interface IAuthService {
  register(data: RegisterDTO): Promise<AuthResponse>;
  login(data: LoginDTO): Promise<AuthResponse>;
  verifyToken(token: string): Promise<JwtPayload>;
  generateTokens(userId: string, email: string, role: string): Promise<{ accessToken: string }>;
}