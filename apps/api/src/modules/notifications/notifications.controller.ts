import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return { publicKey: this.notificationsService.getVapidPublicKey() };
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  subscribe(
    @Request() req: { user: { id: string } },
    @Body() body: { endpoint: string; p256dh: string; auth: string },
  ) {
    return this.notificationsService.subscribe(req.user.id, body);
  }

  @Post('unsubscribe')
  @UseGuards(JwtAuthGuard)
  unsubscribe(@Body() body: { endpoint: string }) {
    return this.notificationsService.unsubscribe(body.endpoint);
  }
}
