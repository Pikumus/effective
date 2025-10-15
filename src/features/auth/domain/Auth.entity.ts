/**
 * Domain Layer - Auth Entity
 * Описывает бизнес-сущности для аутентификации
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: boolean;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export type RegisterDTO = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: AuthUser;
  tokens: AuthTokens;
};