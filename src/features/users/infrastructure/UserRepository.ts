import { IUserRepository } from '../domain/IUserRepository';
import { UserEntity, CreateUserDTO, UpdateUserDTO } from '../domain/User.entity';
import { prisma } from '../../../shared/database/prisma.client';

/**
 * Infrastructure Layer - Repository Implementation
 * Реализация репозитория с использованием Prisma
 */
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({
      where: {id},
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({
      where: {email},
    });
  }

  async findAll(): Promise<UserEntity[]> {
    return prisma.user.findMany({
      orderBy: {createdAt: 'desc'},
    });
  }

  async create(data: CreateUserDTO): Promise<UserEntity> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserEntity> {
    return prisma.user.update({
      where: {id},
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}