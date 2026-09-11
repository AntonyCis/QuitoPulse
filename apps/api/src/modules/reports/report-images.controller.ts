import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { ReportImagesService } from './report-images.service';
import { ConfirmImageDto } from './dto/report-images.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('reports')
export class ReportImagesController {
  constructor(private readonly reportImagesService: ReportImagesService) {}

  @Post(':id/images')
  confirmImage(
    @Param('id') id: string,
    @Body() dto: ConfirmImageDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.reportImagesService.confirmImage(id, dto, user.id);
  }

  @Delete(':id/images/:imageId')
  deleteImage(
    @Param('imageId') imageId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.reportImagesService.deleteImage(imageId, user.id);
  }
}