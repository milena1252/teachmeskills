import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { randomUUID } from 'node:crypto';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class UsersService {
    private users: User[] = [];

    constructor(private readonly logger: LoggerService) {}

    getAll(): User[] {
        this.logger.debug(`Получить всех пользователей: ${this.users.length}`);
        return this.users;
    }

    getOne(id: string): User {
        this.logger.debug(`Получить пользователя с id: ${id}`);

        const user = this.users.find(t => t.id === id);

        if (!user) {
            throw new NotFoundException(`User ${id} - not found`);
        }

        this.logger.info(`Пользователь с id: ${id} найден: ${user.username}`);
        return user;
    }

    create(dto: CreateUserDto): User {
        const user: User = {
            id: randomUUID(),
            username: dto.username,
            email: dto.email,
        };
        this.users.push(user);
        this.logger.debug(`Пользователь создан: ${user.username}`);

        return user;
    }

    onModuleInit() {
        this.logger.debug("UsersService initialized");
    }
}
