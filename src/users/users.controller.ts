import { Controller, Get, Post, Body, Param, Req, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Req() req, @Res() res) {
    const users = await this.usersService.findAll();
    return res.render('users/index', { users, isUsers: true, user: req.session['user'] || null });
  }

  @Get('add')
  addPage(@Req() req, @Res() res) {
    return res.render('users/add', { isUsers: true, user: req.session['user'] || null });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req, @Res() res) {
    const userItem = await this.usersService.findOne(id);
    return res.render('users/show', { user: req.session['user'] || null, userItem, isUsers: true });
  }

  @Get(':id/edit')
  async editPage(@Param('id') id: string, @Req() req, @Res() res) {
    const userItem = await this.usersService.findOne(id);
    return res.render('users/edit', { user: req.session['user'] || null, userItem, isUsers: true });
  }

  @Post()
  async create(@Body() dto: CreateUserDto, @Res() res) {
    await this.usersService.create(dto);
    return res.redirect('/users');
  }

  @Post(':id/edit')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Res() res) {
    await this.usersService.update(id, dto);
    return res.redirect(`/users/${id}`);
  }

  @Post(':id/delete')
  async remove(@Param('id') id: string, @Res() res) {
    await this.usersService.remove(id);
    return res.redirect('/users');
  }
}