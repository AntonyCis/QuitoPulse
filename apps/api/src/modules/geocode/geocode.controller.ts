import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GeocodeService } from './geocode.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('geocode')
export class GeocodeController {
  constructor(private readonly geocodeService: GeocodeService) {}

  @Public()
  @Get('reverse')
  async reverse(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    const latitude = Number(lat);
    const longitude = Number(lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new BadRequestException('Coordenadas inválidas');
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new BadRequestException('Coordenadas fuera de rango');
    }

    return this.geocodeService.reverse(latitude, longitude);
  }
}