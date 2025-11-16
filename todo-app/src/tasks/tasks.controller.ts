import { 
    Body, 
    Controller, 
    DefaultValuePipe, 
    Delete, 
    Get, 
    HttpCode, 
    Param, 
    ParseIntPipe, 
    ParseUUIDPipe, 
    Patch, 
    Post, 
    Query, 
    UseInterceptors
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CompleteManyDto } from './dto/complete-many.dto';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasks: TasksService) {}

        @Get()
        @UseInterceptors(CacheInterceptor)
        async findAll(
            @Query('limit', new DefaultValuePipe(10), new ParseIntPipe({ optional: true })) limit: number,
            @Query('offset', new DefaultValuePipe(0), new ParseIntPipe({ optional: true })) offset: number,
            @Query('completed') completed?: string,
        ) {
            const tasks = await this.tasks.findAll(
                limit,
                offset,
                completed ? completed === 'true': undefined
            );

            return tasks;
        }

        @Get(':id')
        @UseInterceptors(CacheInterceptor)
        async findOne(
            @Param('id', new ParseUUIDPipe()) id: string
        ) {
            const task = await this.tasks.findOne(id);

            return task;
        }

        @Post()
        @HttpCode(201)
        create(@Body() dto: CreateTaskDto) {
            return this.tasks.create(dto);
        }

        @Delete(':id')
        @HttpCode(204)
        remove(
            @Param('id', new ParseUUIDPipe()) id: string
        ) {
            this.tasks.remove(id);
        }

        @Patch(':id/complete')
        complete(
            @Param('id', new ParseUUIDPipe()) id: string
        ) {
            return this.tasks.complete(id);
        }

        @Patch('complete')
        completeMany(
            @Body() dto: CompleteManyDto,
        ) {
            return this.tasks.completeMany(dto.ids);
        }
 
        @Patch(':id')
        update(
            @Param('id', new ParseUUIDPipe()) id: string,
            @Body() dto: UpdateTaskDto,
        ) {
           return this.tasks.update(id, dto);
        }

        @Patch(':id/restore')
        @HttpCode(200)
        restore(
            @Param('id', new ParseUUIDPipe()) id: string
        ) {
            return this.tasks.restore(id);
        }
}

