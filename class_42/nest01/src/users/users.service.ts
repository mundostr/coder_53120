import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UsersDocument } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UsersDocument>) {
  }

  async create(createUserDto: CreateUserDto): Promise<Object> {
    return { status: 'OK', data: await this.model.create(createUserDto) };
  }

  async findAll(): Promise<Object> {
    return { status: 'OK', data: await this.model.find() };
  }

  async findOne(id: string): Promise<Object> {
    return { status: 'OK', data: await this.model.findById(id) };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Object> {
    return { status: 'OK', data: await this.model.findByIdAndUpdate(id, updateUserDto) };
  }

  async remove(id: string): Promise<Object> {
    return { status: 'OK', data: await this.model.findByIdAndDelete(id) };
  }
}
