# Система авторизации

## Обзор

Проект использует JWT (JSON Web Tokens) для аутентификации и авторизации пользователей.

## Структура фичи `auth`

```
src/features/auth/
├── domain/                    # 🔵 Domain Layer
│   ├── Auth.entity.ts        # Сущности (AuthTokens, AuthUser, JwtPayload, DTOs)
│   └── IAuthService.ts       # Интерфейс сервиса
├── application/               # 🟢 Application Layer
│   └── AuthService.ts        # Бизнес-логика (register, login, verifyToken)
└── presentation/              # 🔴 Presentation Layer
    ├── AuthController.ts     # HTTP контроллер
    └── auth.routes.ts        # Express роуты
```

## Middleware

```
src/shared/middleware/
├── auth.middleware.ts        # JWT проверка
│   ├── authMiddleware        # Проверяет токен
│   └── roleMiddleware        # Проверяет роль пользователя
```

## API Endpoints

### 1. Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Ответ:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Вход
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ:** такой же как при регистрации

### 3. Получить текущего пользователя (требует токен)
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

**Ответ:**
```json
{
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### 4. Проверить токен
```http
POST /api/auth/verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ответ:**
```json
{
  "valid": true,
  "payload": {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "user",
    "iat": 1234567890,
    "exp": 1234654290
  }
}
```

## Использование в коде

### Защита роутов с помощью middleware

```typescript
import { authMiddleware, roleMiddleware } from '../../shared/middleware/auth.middleware';

// Защищенный роут (требует любой авторизованный пользователь)
router.get('/protected', authMiddleware, (req, res) => {
  const user = req.user; // Данные пользователя из JWT
  res.json({ message: 'Protected route', user });
});

// Роут только для админов
router.delete('/admin-only',
  authMiddleware,
  roleMiddleware(['admin']),
  (req, res) => {
    res.json({ message: 'Admin only route' });
  }
);

// Роут для админов и модераторов
router.put('/moderator',
  authMiddleware,
  roleMiddleware(['admin', 'moderator']),
  (req, res) => {
    res.json({ message: 'Moderator route' });
  }
);
```

### Пример защищенных роутов для users

```typescript
// src/features/users/presentation/user.routes.ts
import { authMiddleware } from '../../../shared/middleware/auth.middleware';

// Все роуты требуют авторизацию
router.use(authMiddleware);

router.get('/', (req, res) => userController.getUsers(req, res));
router.get('/:id', (req, res) => userController.getUserById(req, res));
router.delete('/:id', (req, res) => userController.deleteUser(req, res));
```

### Доступ к данным пользователя в контроллере

```typescript
// В любом контроллере после authMiddleware
async someMethod(req: Request, res: Response): Promise<void> {
  const currentUser = req.user; // JwtPayload

  console.log(currentUser.userId);  // UUID пользователя
  console.log(currentUser.email);   // Email
  console.log(currentUser.role);    // Роль (опционально)
}
```

## Конфигурация

### Переменные окружения (.env)

```env
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"
```

**Важно:**
- Используйте надежный секретный ключ в production
- Рекомендуемая длина: минимум 32 символа
- Можно сгенерировать: `openssl rand -base64 32`

### Настройка времени жизни токена

```env
JWT_EXPIRES_IN="24h"    # 24 часа
JWT_EXPIRES_IN="7d"     # 7 дней
JWT_EXPIRES_IN="60m"    # 60 минут
JWT_EXPIRES_IN="30s"    # 30 секунд
```

## Примеры использования с curl

### 1. Регистрация
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Вход
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Сохраните `accessToken` из ответа.

### 3. Использование токена
```bash
TOKEN="your-access-token-here"

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Защищенный запрос к users
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

## Безопасность

### Лучшие практики

1. **Никогда не храните JWT_SECRET в коде** - используйте .env
2. **Используйте HTTPS в production** - токены передаются в заголовках
3. **Установите короткое время жизни токена** - снижает риск кражи
4. **Валидируйте все входные данные** - проверяйте email, пароль
5. **Хешируйте пароли** - используется bcrypt с salt rounds = 10
6. **Добавьте rate limiting** - защита от brute force атак

### Требования к паролю

- Минимум 6 символов (настраивается в AuthService.ts:31)
- Рекомендуется добавить дополнительные проверки:
  - Цифры
  - Заглавные буквы
  - Специальные символы

## Обработка ошибок

Все ошибки возвращаются в формате:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Коды ошибок

- `400` - Неверные данные запроса
- `401` - Не авторизован (нет токена, токен невалидный, токен истек)
- `403` - Доступ запрещен (недостаточно прав)
- `500` - Внутренняя ошибка сервера

## Типы данных (TypeScript)

### JwtPayload
```typescript
interface JwtPayload {
  userId: string;
  email: string;
  role?: string;
  iat?: number;    // Issued at
  exp?: number;    // Expiration time
}
```

### AuthResponse
```typescript
interface AuthResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
  };
}
```

### Расширение Express Request
```typescript
// Доступно после authMiddleware
req.user: JwtPayload
```

## Тестирование

### Постман / Insomnia

1. Создайте переменную окружения `TOKEN`
2. После login/register сохраните токен:
   ```javascript
   // В Postman: Tests tab
   pm.environment.set("TOKEN", pm.response.json().tokens.accessToken);
   ```
3. Используйте в заголовках: `Bearer {{TOKEN}}`

### Unit тесты (пример)

```typescript
import { AuthService } from './AuthService';

describe('AuthService', () => {
  it('should register a new user', async () => {
    const result = await authService.register({
      email: 'test@test.com',
      password: 'password123'
    });

    expect(result.user.email).toBe('test@test.com');
    expect(result.tokens.accessToken).toBeDefined();
  });
});
```