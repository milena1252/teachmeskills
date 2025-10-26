import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) {}

        @Get()
        getAll() {
            return this.users.getAll();
        }

        @Post()
        create(@Body() dto: CreateUserDto) {
            return this.users.create(dto);
        }
    
}
