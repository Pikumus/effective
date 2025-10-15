/**
 * Domain Layer - Entity
 * Описывает бизнес-сущность User
 */
export interface UserEntity {
  id: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserDTO = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  status?: boolean;
};

export type UpdateUserDTO = Partial<Omit<CreateUserDTO, 'password'>>;