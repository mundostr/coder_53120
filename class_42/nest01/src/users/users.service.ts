import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const users = [];

@Injectable()
export class UsersService {
  create(createUserDto: CreateUserDto) {
    users.push(createUserDto);
    return createUserDto;
  }

  findAll(limit: number) {
    return users.slice(0, limit);
  }

  findOne(id: number) {
    return users.find(user => user.id === id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) {
      return 'Not found: cannot update';
    } else {
      users[index] = { ...users[index], ...updateUserDto };
      return users[index];
    }
  }

  remove(id: number) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) {
      return 'Not found: cannot delete';
    } else {
      users.splice(index, 1);
      return 'User deleted';
    }
  }
}
