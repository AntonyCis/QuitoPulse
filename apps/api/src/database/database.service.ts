import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from './database.module';
import * as schema from '../lib/drizzle/schema';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  get connection(): NodePgDatabase<typeof schema> {
    return this.db;
  }

  async onModuleDestroy() {
    // Pool cleanup is handled by the Pool itself
  }
}
