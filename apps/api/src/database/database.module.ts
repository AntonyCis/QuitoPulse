import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../lib/drizzle/schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<NodePgDatabase<typeof schema>> => {
        const connectionString = configService.getOrThrow<string>('DATABASE_URL');

        const pool = new Pool({
          connectionString,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });

        const db = drizzle(pool, { schema });

        // Test connection
        try {
          await pool.query('SELECT 1');
          console.log('✅ Database connected successfully');
        } catch (error) {
          console.error('❌ Database connection failed:', error);
          throw error;
        }

        return db;
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
