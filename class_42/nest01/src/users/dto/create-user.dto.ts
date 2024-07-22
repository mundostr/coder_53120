import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '../entities/user.entity.js';

export class CreateUserDto {
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    firstName: string;
    
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.toUpperCase())
    lastName: string;

    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsEnum(Role)
    @Transform(({ value }) => value.toUpperCase())
    role: Role = Role.user;

    @IsOptional()
    optional: string;
}
