# Архитектура проекта

## Слоёная архитектура по фичам (Feature-Based Layered Architecture)

Проект использует вертикальную (по фичам) слоёную архитектуру. Каждая фича содержит все свои слои:

```
src/
├── features/              # Фичи приложения
│   ├── users/            # Пример фичи
│   │   ├── domain/       # 🔵 Domain Layer (Бизнес-логика)
│   │   ├── application/  # 🟢 Application Layer (Use Cases)
│   │   ├── infrastructure/ # 🟡 Infrastructure Layer (БД, внешние сервисы)
│   │   └── presentation/ # 🔴 Presentation Layer (HTTP, контроллеры)
│   └── auth/
│       └── ...
├── shared/               # Общий код
│   ├── database/         # Prisma клиент
│   ├── middleware/       # Express middleware
│   ├── types/           # Общие типы
│   └── utils/           # Утилиты
└── infrastructure/       # Инфраструктура приложения
    └── server.ts        # Express сервер
```

## Слои архитектуры

### 🔵 Domain Layer (Доменный слой)
**Назначение:** Бизнес-сущности и их интерфейсы

**Содержит:**
- Entities (сущности) - `User.entity.ts`
- Repository interfaces - `IUserRepository.ts`
- DTOs (Data Transfer Objects)

**Правила:**
- НЕ зависит от других слоёв
- НЕ содержит никакой инфраструктуры (БД, HTTP, и т.д.)
- Чистая бизнес-логика

**Пример:**
```typescript
// User.entity.ts
export interface UserEntity {
  id: string;
  email: string;
  password: string;
}
```

### 🟢 Application Layer (Слой приложения)
**Назначение:** Use Cases и бизнес-логика

**Содержит:**
- Services - `UserService.ts`
- Use Cases
- Бизнес-правила

**Правила:**
- Зависит от Domain Layer
- НЕ зависит от Infrastructure и Presentation
- Работает через интерфейсы (IUserRepository)

**Пример:**
```typescript
// UserService.ts
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(data: CreateUserDTO): Promise<UserEntity> {
    // Бизнес-логика
  }
}
```

### 🟡 Infrastructure Layer (Инфраструктурный слой)
**Назначение:** Реализация технических деталей

**Содержит:**
- Repository implementations - `UserRepository.ts`
- Prisma queries
- Внешние сервисы
- База данных

**Правила:**
- Реализует интерфейсы из Domain Layer
- Содержит код работы с Prisma

**Пример:**
```typescript
// UserRepository.ts
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    return await prisma.user.findUnique({ where: { id } });
  }
}
```

### 🔴 Presentation Layer (Слой представления)
**Назначение:** HTTP endpoints, контроллеры, роуты

**Содержит:**
- Controllers - `UserController.ts`
- Routes - `user.routes.ts`
- Валидация запросов

**Правила:**
- Зависит от Application Layer
- Обрабатывает HTTP запросы/ответы
- Валидирует входные данные

**Пример:**
```typescript
// UserController.ts
export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(req: Request, res: Response): Promise<void> {
    const users = await this.userService.getAllUsers();
    res.json(users);
  }
}
```

## Подключение Prisma

### 1. Schema определение
```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())

  @@map("users")
}
```

### 2. Singleton клиент
```typescript
// src/shared/database/prisma.client.ts
import { PrismaClient } from '../../generated/prisma';

export const prisma = DatabaseClient.getInstance();
```

### 3. Использование в репозитории
```typescript
// infrastructure/UserRepository.ts
import { prisma } from '../../../shared/database/prisma.client';

export class UserRepository implements IUserRepository {
  async findById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }
}
```

## Dependency Injection

В роутах создаём зависимости:
```typescript
// presentation/user.routes.ts
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);
```

## Преимущества такой архитектуры

1. **Изоляция:** Каждая фича независима
2. **Тестируемость:** Легко мокать зависимости через интерфейсы
3. **Масштабируемость:** Легко добавлять новые фичи
4. **Maintainability:** Код логически организован
5. **Dependency Inversion:** Application зависит от абстракций (IUserRepository), а не от конкретных реализаций

## Команды Prisma

```bash
# Создать миграцию
npx prisma migrate dev --name init

# Сгенерировать клиент
npx prisma generate

# Открыть Prisma Studio (GUI для БД)
npx prisma studio

# Синхронизировать схему с БД (для разработки)
npx prisma db push
```

## Пример добавления новой фичи

1. Создать структуру папок:
```bash
mkdir -p src/features/tasks/{domain,application,infrastructure,presentation}
```

2. Создать domain:
   - `Task.entity.ts` - сущность
   - `ITaskRepository.ts` - интерфейс репозитория

3. Создать application:
   - `TaskService.ts` - бизнес-логика

4. Создать infrastructure:
   - `TaskRepository.ts` - реализация с Prisma

5. Создать presentation:
   - `TaskController.ts` - контроллер
   - `task.routes.ts` - роуты

6. Подключить роуты в `server.ts`:
```typescript
import taskRoutes from './features/tasks/presentation/task.routes';
app.use('/api/tasks', taskRoutes);
```