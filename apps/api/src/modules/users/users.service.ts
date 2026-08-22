import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users, profiles } from '../../lib/drizzle/schema';
import * as schema from '../../lib/drizzle/schema';
import { eq } from 'drizzle-orm';

interface UpdateProfileDto {
  displayName?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findById(id: string) {
    const [result] = await this.db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        bio: profiles.bio,
        phone: profiles.phone,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(users.id, id))
      .limit(1);

    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return result;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const [existingProfile] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!existingProfile) {
      throw new NotFoundException('Perfil no encontrado');
    }

    const [updated] = await this.db
      .update(profiles)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, userId))
      .returning();

    return updated;
  }
}
