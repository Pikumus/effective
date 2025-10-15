import { UserEntity, CreateUserDTO, UpdateUserDTO } from './User.entity';

/**
 * Domain Layer - Repository Interface
 * Определяет контракт для работы с пользователями
 */
export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  create(data: CreateUserDTO): Promise<UserEntity>;
  update(id: string, data: UpdateUserDTO): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}