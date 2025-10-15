# Быстрый старт

## 1. Настройка базы данных

### Создайте PostgreSQL базу данных:
```bash
# Используя psql
createdb effective_db

# Или через Docker
docker run --name postgres-effective \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=effective_db \
  -p 5432:5432 \
  -d postgres:16
```

### Обновите `.env` файл:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/effective_db?schema=public"
```

## 2. Запуск миграций Prisma

```bash
# Создать и применить миграцию
npx prisma migrate dev --name init

# Или синхронизировать схему (для разработки)
npx prisma db push
```

## 3. Сгенерировать Prisma Client

```bash
npx prisma generate
```

## 4. Запустить сервер

```bash
# Development mode с hot reload
npm run dev

# Production build
npm run build
npm start
```

## 5. Тестирование API

### Создать пользователя:
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Получить всех пользователей:
```bash
curl http://localhost:3000/api/users
```

### Получить пользователя по ID:
```bash
curl http://localhost:3000/api/users/{id}
```

### Обновить пользователя:
```bash
curl -X PUT http://localhost:3000/api/users/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### Удалить пользователя:
```bash
curl -X DELETE http://localhost:3000/api/users/{id}
```

## 6. Prisma Studio (GUI для БД)

```bash
npx prisma studio
```

Откроется браузер с GUI на `http://localhost:5555`

## Структура проекта

```
src/
├── features/
│   └── users/                    # Фича пользователей
│       ├── domain/               # Бизнес-логика
│       │   ├── User.entity.ts
│       │   └── IUserRepository.ts
│       ├── application/          # Use Cases
│       │   └── UserService.ts
│       ├── infrastructure/       # БД доступ
│       │   └── UserRepository.ts
│       └── presentation/         # HTTP слой
│           ├── UserController.ts
│           └── user.routes.ts
├── shared/
│   └── database/
│       └── prisma.client.ts      # Prisma клиент
└── infrastructure/
    └── server.ts                 # Express сервер
```

## Полезные команды

```bash
# Создать новую миграцию
npx prisma migrate dev --name <name>

# Применить миграции в production
npx prisma migrate deploy

# Сбросить БД (ВНИМАНИЕ: удалит все данные!)
npx prisma migrate reset

# Проверить статус миграций
npx prisma migrate status

# Форматировать schema.prisma
npx prisma format
```

## Следующие шаги

1. Добавьте JWT аутентификацию в `features/auth/`
2. Создайте middleware для проверки токенов
3. Добавьте валидацию с `express-validator`
4. Настройте логирование
5. Добавьте unit и integration тесты

Подробнее об архитектуре читайте в [ARCHITECTURE.md](./ARCHITECTURE.md)