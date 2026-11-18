import { Controller, Get, Post, Body, Param, Req, Res } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Req() req, @Res() res) {
    const categories = await this.categoriesService.findAll();
    return res.render('categories/index', { categories, isCategories: true, user: req.session['user'] || null });
  }

  @Get('add')
  addPage(@Req() req, @Res() res) {
    return res.render('categories/add', { isCategories: true, user: req.session['user'] || null });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req, @Res() res) {
    const category = await this.categoriesService.findOne(id);
    return res.render('categories/show', { category, isCategories: true, user: req.session['user'] || null });
  }

  @Get(':id/edit')
  async editPage(@Param('id') id: string, @Req() req, @Res() res) {
    const category = await this.categoriesService.findOne(id);
    return res.render('categories/edit', { category, isCategories: true, user: req.session['user'] || null });
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto, @Res() res) {
    await this.categoriesService.create(dto);
    return res.redirect('/categories');
  }

  @Post(':id/edit')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Res() res) {
    await this.categoriesService.update(id, dto);
    return res.redirect(`/categories/${id}`);
  }

  @Post(':id/delete')
  async remove(@Param('id') id: string, @Res() res) {
    await this.categoriesService.remove(id);
    return res.redirect('/categories');
  }
}