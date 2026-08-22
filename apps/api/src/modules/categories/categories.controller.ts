import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Roles('ADMIN')
  @Get('admin')
  findAllAdmin() {
    return this.categoriesService.findAllAdmin();
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
