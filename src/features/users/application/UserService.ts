import { IUserRepository } from '../domain/IUserRepository';
import { UserEntity, CreateUserDTO, UpdateUserDTO } from '../domain/User.entity';
import bcrypt from 'bcrypt';

/**
 * Application Layer - Use Cases / Business Logic
 * Содержит бизнес-логику работы с пользователями
 */
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getUserById(id: string): Promise<UserEntity | null> {
    return await this.userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getAllUsers(): Promise<UserEntity[]> {
    return await this.userRepository.findAll();
  }

  async createUser(data: CreateUserDTO): Promise<UserEntity> {
    // Проверка на существование пользователя
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Блокировка/разблокировка пользователя
   * @param id - ID пользователя
   * @param status - true = активен, false = заблокирован
   */
  async toggleUserStatus(id: string, status: boolean): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return await this.userRepository.update(id, { status });
  }
}