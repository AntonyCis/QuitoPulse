import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { pushSubscriptions, notifications } from '../../lib/drizzle/schema';
import * as schema from '../../lib/drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  onModuleInit() {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');

    if (publicKey && privateKey) {
      webpush.setVapidDetails(
        'mailto:admin@radarquito.com',
        publicKey,
        privateKey,
      );
      this.logger.log('Web Push VAPID configured');
    } else {
      this.logger.warn('VAPID keys not configured - push notifications disabled');
    }
  }

  async subscribe(userId: string, subscription: { endpoint: string; p256dh: string; auth: string }) {
    // Upsert: delete existing for this endpoint, then insert
    await this.db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint));

    const [created] = await this.db
      .insert(pushSubscriptions)
      .values({
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      })
      .returning();

    return created;
  }

  async unsubscribe(endpoint: string) {
    await this.db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
  }

  async sendToUser(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    const subs = await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    const payload = JSON.stringify({ title, body, data });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
      } catch (error) {
        // If subscription is invalid, remove it
        if ((error as { statusCode?: number }).statusCode === 404 || (error as { statusCode?: number }).statusCode === 410) {
          await this.db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
          this.logger.log(`Removed invalid subscription ${sub.id}`);
        } else {
          this.logger.error(`Failed to send push to ${sub.id}: ${error}`);
        }
      }
    }
  }

  async sendToAll(title: string, body: string, data?: Record<string, unknown>) {
    const subs = await this.db.select().from(pushSubscriptions);
    const payload = JSON.stringify({ title, body, data });

    let sent = 0;
    let failed = 0;

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        );
        sent++;
      } catch (error) {
        failed++;
        if ((error as { statusCode?: number }).statusCode === 404 || (error as { statusCode?: number }).statusCode === 410) {
          await this.db
            .delete(pushSubscriptions)
            .where(eq(pushSubscriptions.id, sub.id));
        }
      }
    }

    return { sent, failed, total: subs.length };
  }

  async saveInAppNotification(userId: string, type: string, title: string, message: string, entityType?: string, entityId?: string) {
    const [created] = await this.db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        entityType,
        entityId,
      })
      .returning();

    return created;
  }

  getVapidPublicKey() {
    return this.config.get<string>('VAPID_PUBLIC_KEY') || null;
  }
}
