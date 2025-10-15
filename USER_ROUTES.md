# User Routes - Документация

## Правила доступа

Все роуты `/api/users/*` требуют JWT авторизацию.

### Роли и права доступа:

| Роут | Метод | Доступ |
|------|-------|---------|
| `/api/users` | GET | Только **admin** |
| `/api/users/:id` | GET | **admin** или **сам пользователь** |
| `/api/users` | POST | Любой авторизованный |
| `/api/users/:id/status` | PATCH | **admin** или **сам пользователь** |
| `/api/users/:id` | DELETE | **admin** или **сам пользователь** |

## API Endpoints

### 1. Получить список всех пользователей

```http
GET /api/users
Authorization: Bearer <token>
```

**Доступ:** Только admin

**Ответ:**
```json
[
  {
    "id": "uuid",
    "email": "user1@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "status": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Ошибки:**
- `401` - Нет токена или токен невалидный
- `403` - Недостаточно прав (не admin)

---

### 2. Получить пользователя по ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Доступ:** Admin или сам пользователь

**Пример:**
```bash
# Админ может получить любого пользователя
curl http://localhost:3000/api/users/any-user-id \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Пользователь может получить только себя
curl http://localhost:3000/api/users/his-own-id \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Ответ:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "status": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Ошибки:**
- `401` - Нет токена
- `403` - Попытка получить чужого пользователя (не admin)
- `404` - Пользователь не найден

---

### 3. Создать пользователя

```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Доступ:** Любой авторизованный пользователь

**Пример:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

**Ответ:**
```json
{
  "id": "new-uuid",
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": null,
  "status": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Ошибки:**
- `400` - Неверные данные (нет email или password)
- `401` - Нет токена
- `500` - Email уже существует

---

### 4. Блокировка/разблокировка пользователя

```http
PATCH /api/users/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": false
}
```

**Доступ:** Admin или сам пользователь

**Параметры:**
- `status` (boolean):
  - `true` - активировать пользователя
  - `false` - заблокировать пользователя

**Пример блокировки:**
```bash
# Админ блокирует пользователя
curl -X PATCH http://localhost:3000/api/users/user-id/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": false}'

# Пользователь блокирует сам себя
curl -X PATCH http://localhost:3000/api/users/his-own-id/status \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": false}'
```

**Ответ:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "status": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "message": "User blocked"
}
```

**Ошибки:**
- `400` - status не boolean
- `401` - Нет токена
- `403` - Попытка заблокировать чужого пользователя (не admin)
- `404` - Пользователь не найден

---

### 5. Удалить пользователя

```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

**Доступ:** Admin или сам пользователь

**Пример:**
```bash
# Админ удаляет пользователя
curl -X DELETE http://localhost:3000/api/users/user-id \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Пользователь удаляет сам себя
curl -X DELETE http://localhost:3000/api/users/his-own-id \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Ответ:**
```
204 No Content
```

**Ошибки:**
- `401` - Нет токена
- `403` - Попытка удалить чужого пользователя (не admin)
- `404` - Пользователь не найден

---

## Примеры использования

### Сценарий 1: Админ получает список пользователей

```bash
# 1. Логин как админ
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.tokens.accessToken')

# 2. Получить список всех пользователей
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Сценарий 2: Пользователь получает свой профиль

```bash
# 1. Логин как обычный пользователь
USER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "user123"
  }')

USER_TOKEN=$(echo $USER_RESPONSE | jq -r '.tokens.accessToken')
USER_ID=$(echo $USER_RESPONSE | jq -r '.user.id')

# 2. Получить свой профиль
curl http://localhost:3000/api/users/$USER_ID \
  -H "Authorization: Bearer $USER_TOKEN"
```

### Сценарий 3: Пользователь пытается получить чужой профиль (ОШИБКА)

```bash
# Попытка получить чужой профиль
curl http://localhost:3000/api/users/other-user-id \
  -H "Authorization: Bearer $USER_TOKEN"

# Ответ: 403 Forbidden
# {
#   "error": "Forbidden: You can only access your own resources or be an admin"
# }
```

### Сценарий 4: Админ блокирует пользователя

```bash
# Заблокировать пользователя
curl -X PATCH http://localhost:3000/api/users/user-id/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": false}'

# Разблокировать пользователя
curl -X PATCH http://localhost:3000/api/users/user-id/status \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": true}'
```

---

## Как назначить роль admin

Роль admin нужно установить напрямую в базе данных или через миграцию:

```sql
-- Через PostgreSQL
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Или через Prisma Studio:
```bash
npx prisma studio
```

---

## Middleware

### authMiddleware
Проверяет наличие и валидность JWT токена.

```typescript
router.get('/', authMiddleware, handler);
```

### roleMiddleware(['admin'])
Проверяет, что роль пользователя в списке разрешенных.

```typescript
router.get('/', authMiddleware, roleMiddleware(['admin']), handler);
```

### isAdminOrOwner
Проверяет, что пользователь либо admin, либо ID из параметра совпадает с userId из токена.

```typescript
router.get('/:id', authMiddleware, isAdminOrOwner, handler);
```

---

## Типичные ошибки

### 401 Unauthorized
```json
{ "error": "No authorization header" }
{ "error": "Invalid token" }
{ "error": "Token expired" }
```

**Решение:** Проверьте заголовок `Authorization: Bearer <token>`

### 403 Forbidden
```json
{ "error": "Forbidden: Insufficient permissions" }
{ "error": "Forbidden: You can only access your own resources or be an admin" }
```

**Решение:** Проверьте права доступа (роль admin или владение ресурсом)

### 404 Not Found
```json
{ "error": "User not found" }
```

**Решение:** Проверьте правильность ID пользователя

---

## Безопасность

1. **Пароли не возвращаются** - все методы автоматически удаляют поле `password` из ответа
2. **JWT токены** - используется для всех запросов
3. **Проверка владения** - `isAdminOrOwner` проверяет userId из токена
4. **Валидация ролей** - `roleMiddleware` проверяет роль пользователя

---

## Тестирование в Postman/Insomnia

1. Создайте environment с переменными:
   - `BASE_URL` = `http://localhost:3000`
   - `ADMIN_TOKEN` = токен админа
   - `USER_TOKEN` = токен пользователя
   - `USER_ID` = ID пользователя

2. После login автоматически сохраняйте токен:
```javascript
// Postman Tests tab
const response = pm.response.json();
pm.environment.set("USER_TOKEN", response.tokens.accessToken);
pm.environment.set("USER_ID", response.user.id);
```

3. Используйте в запросах:
```
Authorization: Bearer {{USER_TOKEN}}
```