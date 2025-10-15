# Clean Architecture Node.js Example

Пример реализации Clean Architecture (Чистой Архитектуры) на Node.js с TypeScript.

## Структура проекта

```
src/
├── domain/                 # Внутренний слой - Бизнес-логика
│   ├── entities/          # Сущности с бизнес-правилами
│   ├── repositories/      # Интерфейсы репозиториев
│   └── exceptions/        # Доменные исключения
│
├── usecases/              # Слой бизнес-правил приложения
│   ├── CreateUser/        # Use case создания пользователя
│   ├── GetUser/           # Use case получения пользователя
│   └── GetAllUsers/       # Use case получения всех пользователей
│
├── adapters/              # Адаптеры интерфейсов
│   ├── controllers/       # HTTP контроллеры
│   └── presenters/        # Презентеры для форматирования ответов
│
└── infrastructure/        # Внешний слой - Frameworks & Drivers
    ├── repositories/      # Реализации репозиториев
    ├── web/              # Express приложение и роуты
    ├── di/               # Dependency Injection контейнер
    └── server.ts         # Точка входа

```

## Принципы Clean Architecture

### 1. Независимость от фреймворков
Бизнес-логика не зависит от Express или других библиотек.

### 2. Тестируемость
Бизнес-правила можно тестировать без UI, БД, веб-сервера.

### 3. Независимость от UI
UI можно легко изменить без изменения бизнес-правил.

### 4. Независимость от БД
БД можно поменять с InMemory на MongoDB/PostgreSQL без изменения бизнес-логики.

### 5. Правило зависимостей
**Зависимости направлены внутрь**: внешние слои зависят от внутренних, но не наоборот.

```
Infrastructure → Adapters → Use Cases → Domain
```

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка проекта
npm run build

# Запуск production версии
npm run start
```

## API Endpoints

### Создать пользователя
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"John Doe","password":"secret123"}'
```

### Получить всех пользователей
```bash
curl http://localhost:3000/api/users
```

### Получить пользователя по ID
```bash
curl http://localhost:3000/api/users/{userId}
```

### Health check
```bash
curl http://localhost:3000/health
```

## Слои архитектуры

### Domain Layer (Домен)
- **entities/User.ts**: Сущность пользователя с валидацией
- **repositories/IUserRepository.ts**: Интерфейс репозитория (инверсия зависимостей)
- **exceptions/**: Доменные исключения

### Use Cases Layer (Бизнес-правила)
- **CreateUserUseCase**: Создание пользователя с проверкой на дубликаты
- **GetUserUseCase**: Получение пользователя по ID
- **GetAllUsersUseCase**: Получение списка пользователей

### Adapters Layer (Адаптеры)
- **UserController**: Обрабатывает HTTP запросы и вызывает use cases
- **UserPresenter**: Форматирует данные для ответа

### Infrastructure Layer (Инфраструктура)
- **InMemoryUserRepository**: Реализация репозитория в памяти
- **Express app**: Веб-сервер
- **DIContainer**: Контейнер зависимостей

## Как добавить новую функциональность

1. **Добавить в Domain**: создать entity/interface репозитория
2. **Создать Use Case**: реализовать бизнес-логику
3. **Добавить Controller**: обработать HTTP запрос
4. **Реализовать Infrastructure**: добавить в репозиторий/БД
5. **Связать в DI Container**: добавить зависимости

## Преимущества такой архитектуры

- Легко тестировать бизнес-логику изолированно
- Можно менять БД без изменения бизнес-правил
- Можно менять веб-фреймворк без изменения use cases
- Код организован по фичам, а не по техническим слоям
- Четкое разделение ответственности

## Возможные улучшения

- Добавить реальную БД (PostgreSQL/MongoDB) вместо InMemory
- Добавить валидацию запросов (Joi/Zod)
- Добавить логирование (Winston/Pino)
- Добавить тесты (Jest)
- Добавить авторизацию (JWT)
- Добавить Swagger документацию