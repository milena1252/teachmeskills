import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class UsersService {
    private users: User[] = [];

    onModuleInit() {
        console.log("UsersService initialized");
    }

    getAll(): User[] {
        return this.users;
    }

    getOne(id: string): User {
        const user = this.users.find(t => t.id === id);

        if (!user) {
            throw new NotFoundException(`User ${id} - not found`);
        }

        return user;
    }

    create(dto: CreateUserDto): User {
        const user: User = {
            id: randomUUID(),
            username: dto.username,
            email: dto.email,
        };
        this.users.push(user);

        return user;
    }
}
