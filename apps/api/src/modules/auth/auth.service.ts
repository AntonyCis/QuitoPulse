import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users, profiles, refreshTokens } from '../../lib/drizzle/schema';
import * as schema from '../../lib/drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../audit/audit.service';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async register(
    email: string,
    password: string,
    displayName?: string,
    ipAddress?: string,
  ): Promise<TokenPair & { user: { id: string; email: string; role: string } }> {
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [createdUser] = await this.db
      .insert(users)
      .values({
        email,
        passwordHash,
        role: 'USER',
      })
      .returning({ id: users.id, email: users.email, role: users.role });

    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    await this.db.insert(profiles).values({
      userId: createdUser.id,
      displayName: displayName || null,
    });

    const tokens = await this.generateTokens(createdUser.id, createdUser.email, createdUser.role);
    await this.storeRefreshToken(createdUser.id, tokens.refreshToken);

    await this.auditService.log({
      userId: createdUser.id,
      action: 'user.register',
      entityType: 'user',
      entityId: createdUser.id,
      ipAddress,
    });

    return {
      ...tokens,
      user: { id: createdUser.id, email: createdUser.email, role: createdUser.role },
    };
  }

  async login(
    email: string,
    password: string,
    ipAddress?: string,
  ): Promise<TokenPair & { user: { id: string; email: string; role: string } }> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    await this.auditService.log({
      userId: user.id,
      action: 'user.login',
      entityType: 'user',
      entityId: user.id,
      ipAddress,
    });

    return {
      ...tokens,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const storedTokens = await this.db
      .select()
      .from(refreshTokens)
      .where(and(gt(refreshTokens.expiresAt, new Date())))
      .limit(50);

    let matchedToken: typeof storedTokens[number] | null = null;
    for (const token of storedTokens) {
      const matches = await bcrypt.compare(refreshToken, token.tokenHash);
      if (matches) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, matchedToken.userId))
      .limit(1);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    await this.db
      .delete(refreshTokens)
      .where(eq(refreshTokens.id, matchedToken.id));

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const storedTokens = await this.db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.userId, userId));

      for (const token of storedTokens) {
        const matches = await bcrypt.compare(refreshToken, token.tokenHash);
        if (matches) {
          await this.db
            .delete(refreshTokens)
            .where(eq(refreshTokens.id, token.id));
          break;
        }
      }
    } else {
      await this.db
        .delete(refreshTokens)
        .where(eq(refreshTokens.userId, userId));
    }

    await this.auditService.log({
      userId,
      action: 'user.logout',
      entityType: 'user',
      entityId: userId,
    });
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<TokenPair> {
    const payload: TokenPayload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = await bcrypt.hash(refreshToken, 12);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.db.insert(refreshTokens).values({
      userId,
      tokenHash,
      expiresAt,
    });
  }
}
