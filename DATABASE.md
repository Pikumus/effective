# База данных - Инструкции

## ✅ PostgreSQL подключена через Docker

### Детали подключения:

```
Host: localhost
Port: 5432
Database: effective_db
User: postgres
Password: postgres
```

### Строка подключения (.env):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/effective_db?schema=public"
```

---

## Управление Docker контейнером

### Запуск контейнера:
```bash
docker start postgres-effective
```

### Остановка контейнера:
```bash
docker stop postgres-effective
```

### Проверка статуса:
```bash
docker ps --filter name=postgres-effective
```

### Удаление контейнера (БД будет удалена!):
```bash
docker stop postgres-effective
docker rm postgres-effective
```

### Пересоздание с нуля:
```bash
docker stop postgres-effective
docker rm postgres-effective
docker run -d \
  --name postgres-effective \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=effective_db \
  -p 5432:5432 \
  postgres:16-alpine
```

---

## Prisma команды

### Применить миграции:
```bash
npx prisma migrate dev --name <migration-name>
```

### Открыть Prisma Studio (GUI для БД):
```bash
npx prisma studio
```
Откроется на http://localhost:5555

### Синхронизировать схему с БД (для разработки):
```bash
npx prisma db push
```

### Сгенерировать Prisma Client:
```bash
npx prisma generate
```

### Просмотреть статус миграций:
```bash
npx prisma migrate status
```

### Сбросить БД (удалит все данные!):
```bash
npx prisma migrate reset
```

---

## Прямой доступ к PostgreSQL

### Подключиться к psql внутри контейнера:
```bash
docker exec -it postgres-effective psql -U postgres -d effective_db
```

### Полезные psql команды:

```sql
-- Список таблиц
\dt

-- Структура таблицы
\d users

-- Просмотр данных
SELECT * FROM users;

-- Создать админа
INSERT INTO users (id, email, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  '$2b$10$hash_here',
  'admin',
  NOW(),
  NOW()
);

-- Обновить роль пользователя
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Выход из psql
\q
```

---

## Структура таблиц

### users
```sql
Column      | Type                           | Nullable
------------|--------------------------------|---------
id          | text                           | NOT NULL (PK)
email       | text                           | NOT NULL (UNIQUE)
password    | text                           | NOT NULL
firstName   | text                           | NULL
lastName    | text                           | NULL
role        | text                           | NULL
status      | boolean                        | NULL
createdAt   | timestamp(3)                   | NOT NULL
updatedAt   | timestamp(3)                   | NOT NULL
```

**Индексы:**
- PRIMARY KEY на `id`
- UNIQUE на `email`

---

## Резервное копирование

### Создать бэкап:
```bash
docker exec postgres-effective pg_dump -U postgres effective_db > backup.sql
```

### Восстановить из бэкапа:
```bash
docker exec -i postgres-effective psql -U postgres effective_db < backup.sql
```

---

## Подключение с внешних инструментов

### DBeaver / TablePlus / pgAdmin:

```
Host: localhost
Port: 5432
Database: effective_db
User: postgres
Password: postgres
```

---

## Решение проблем

### "Cannot connect to Docker daemon"
```bash
# Запустите Docker Desktop приложение
open -a Docker
```

### "Connection refused" при подключении к БД
```bash
# Проверьте, что контейнер запущен
docker ps --filter name=postgres-effective

# Если нет, запустите
docker start postgres-effective
```

### "Port 5432 already in use"
```bash
# Проверьте, что запущено на порту 5432
lsof -i :5432

# Остановите процесс или измените порт в docker run:
docker run -d --name postgres-effective -p 5433:5432 ...
# И обновите .env: DATABASE_URL="...localhost:5433/..."
```

### Очистить все данные и начать заново
```bash
npx prisma migrate reset
# Это удалит все данные и применит миграции заново
```

---

## Производственная БД

Для production рекомендуется использовать:
- [Supabase](https://supabase.com) (бесплатный PostgreSQL)
- [Railway](https://railway.app)
- [Render](https://render.com)
- [Neon](https://neon.tech)

Просто замените `DATABASE_URL` в `.env` на строку подключения от провайдера.

---

## Мониторинг

### Просмотр логов контейнера:
```bash
docker logs postgres-effective

# Следить за логами в реальном времени
docker logs -f postgres-effective
```

### Статистика использования:
```bash
docker stats postgres-effective
```

---

## Автоматический запуск

Чтобы PostgreSQL запускался автоматически с Docker Desktop:

```bash
docker update --restart unless-stopped postgres-effective
```

Теперь контейнер будет автоматически запускаться при старте Docker.