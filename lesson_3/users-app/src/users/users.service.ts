import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    private users: User[] = [];

    onModuleInit() {
        console.log("UsersService initialized");
    }

    getAll(): User[] {
        return this.users;
    }

    create(dto: CreateUserDto): User {
        const user: User = {
            username: dto.username,
            email: dto.email,
        };
        this.users.push(user);

        return user;
    }
}
