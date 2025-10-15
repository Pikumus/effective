import { IAuthService } from '../domain/IAuthService';
import { RegisterDTO, LoginDTO, AuthResponse, JwtPayload, AuthUser } from '../domain/Auth.entity';
import { IUserRepository } from '../../users/domain/IUserRepository';
import bcrypt from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';

/**
 * Application Layer - Auth Service
 * Бизнес-логика аутентификации и авторизации
 */
export class AuthService implements IAuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor(private userRepository: IUserRepository) {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

    if (!process.env.JWT_SECRET) {
      console.warn('⚠️  JWT_SECRET not set in environment variables. Using default (insecure).');
    }
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    };

    return {
      user: authUser,
      tokens,
    };
  }


  async login(data: LoginDTO): Promise<AuthResponse> {

    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    };

    return {
      user: authUser,
      tokens,
    };
  }

  async generateTokens(userId: string, email: string, role: string): Promise<{ accessToken: string }> {
    const secret = new TextEncoder().encode(this.JWT_SECRET);

    const payload: Record<string, unknown> = { userId, email, role };

    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(this.JWT_EXPIRES_IN)
      .sign(secret);

    return { accessToken };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const secret = new TextEncoder().encode(this.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string | undefined,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new Error('Token expired');
        }
      }
      throw new Error('Invalid token');
    }
  }
}