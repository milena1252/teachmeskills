import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) {}

        @Get()
        getAll() {
            return this.users.getAll();
        }

        @Get(':id')
        getOne(@Param('id', new ParseUUIDPipe()) id: string) {
            return this.users.getOne(id);
        }

        @Post()
        create(@Body() dto: CreateUserDto) {
            return this.users.create(dto);
        }
    
}
