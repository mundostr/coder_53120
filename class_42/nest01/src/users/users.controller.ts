import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // create(@Request() req: Request) {
  create(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('limit') limit: string) {
    const data = this.usersService.findAll();
    return { status: 'OK', payload: data };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (isNaN(+id)) throw new HttpException('Parámetro no válido', HttpStatus.BAD_REQUEST);
    const data = this.usersService.findOne(id);
    return { status: 'OK', payload: data };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
