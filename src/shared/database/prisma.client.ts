import { PrismaClient } from '../../generated/prisma';

/**
 * Singleton pattern для Prisma Client
 * Предотвращает создание множества подключений к БД
 */
class DatabaseClient {
  private static instance: PrismaClient | null = null;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
      });
    }
    return DatabaseClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseClient.instance) {
      await DatabaseClient.instance.$disconnect();
      DatabaseClient.instance = null;
    }
  }
}

export const prisma = DatabaseClient.getInstance();

process.on('beforeExit', async () => {
  await DatabaseClient.disconnect();
});