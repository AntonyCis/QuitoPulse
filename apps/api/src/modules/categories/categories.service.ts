import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { categories } from '../../lib/drizzle/schema';
import * as schema from '../../lib/drizzle/schema';
import { eq, asc } from 'drizzle-orm';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findAll() {
    return this.db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder));
  }

  async findAllAdmin() {
    return this.db.select().from(categories).orderBy(asc(categories.sortOrder));
  }

  async findById(id: string) {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return category || null;
  }

  async findByName(name: string) {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);
    return category || null;
  }

  async create(data: { name: string; label: string; color: string; icon?: string; sortOrder?: number }) {
    const [created] = await this.db
      .insert(categories)
      .values(data)
      .returning();
    return created;
  }

  async update(id: string, data: Partial<{ label: string; color: string; icon: string; isActive: boolean; sortOrder: number }>) {
    const [updated] = await this.db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async delete(id: string) {
    await this.db.delete(categories).where(eq(categories.id, id));
  }
}
