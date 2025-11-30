import { 
    ConflictException,
    ForbiddenException, 
    Injectable, 
    NotFoundException
} from '@nestjs/common';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthService } from 'src/auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        private readonly auth: AuthService,
        @InjectRepository(Task)
        private readonly taskRepo: Repository<Task>,
        private readonly dataSource: DataSource,
    ) {}

    async findAll(
        limit: number = 10,
        offset: number = 0,
        completed?: boolean
    ): Promise<Task[]> {
        const query = this.taskRepo.createQueryBuilder('task')
            .orderBy('task.createdAt', 'DESC')
            .take(limit)
            .skip(offset);

        if (completed !== undefined) {
            query.andWhere('task.completed = :completed', { completed });
        }

       return query.getMany();
    }

    async findOne(id: string): Promise<Task> {
        const task = await this.taskRepo.findOne({ where: { id }});

        if (!task) {
            throw new NotFoundException(`Task ${id} - not found`);
        }

        return task;
    }

    async create(dto: CreateTaskDto): Promise<Task> {
        const tasks = await this.findAll();
        const existingTitles = tasks.map((t) => t.title);

        if (existingTitles.includes(dto.title)) {
            throw new ConflictException('Task with this title already exists');
        }

        const task = this.taskRepo.create({
            title: dto.title,
            completed: dto.completed ?? false,
            ownerId: dto.userId,
            priority: dto.priority,
            deadline: dto.deadline,
        });

        return this.taskRepo.save(task);
    }

    private async getOwnedTask(id: string): Promise<Task> {
        const task = await this.findOne(id);

        return task;
    }

    async update(id: string, dto: UpdateTaskDto): Promise<Task> {
        const task = await this.getOwnedTask(id);

        this.taskRepo.merge(task, {
            title: dto.title ?? task.title,
            completed: dto.completed ?? task.completed,
            priority: dto.priority ?? task.priority,
            deadline: dto.deadline ?? task.deadline,
        });

        return this.taskRepo.save(task);
    }

    async remove(id: string): Promise<void> {
        const task = await this.getOwnedTask(id);
        
        await this.taskRepo.softDelete(task.id);
    }

    async restore(id: string): Promise<void> {
        const task = await this.findOne(id);

        await this.taskRepo.restore(task.id);
    }

    async complete(id: string) {
        const task = await this.getOwnedTask(id);
        
        if(!task.completed) {
            task.completed = true;
            await this.taskRepo.save(task);
        }

        return task;
    } 

    async completeMany(ids: string[]) {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        try {
            const tasks = await runner.manager.find(Task, {
                where: { id: In(ids) },
                withDeleted: false,
            });
            if (tasks.length !== ids.length) {
                throw new ForbiddenException('Some tasks are not found');
            }

            await runner.manager
                .createQueryBuilder()
                .update(Task)
                .set({ completed: true })
                .whereInIds(ids)
                .execute();

            await runner.commitTransaction();
        } catch (e) {
            await runner.rollbackTransaction();
            throw e;
        } finally {
            await runner.release();
        }
    }

    toHateoas(task: Task) {
        return {
            ...task,
            _links: {
                self: { href: `/tasks/${task.id}` },
                update: { href: `/tasks/${task.id}`, method: 'PATCH'},
                delete: { href: `/tasks/${task.id}`, method: 'DELETE'},
                complete: { href: `/tasks/${task.id}/complete`, method: 'PATCH'},
            },
        };
    }
}
