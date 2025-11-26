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
    Req, 
    UseGuards, 
    UseInterceptors,
    UsePipes
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CompleteManyDto } from './dto/complete-many.dto';
import { CurrentUser } from 'src/common/current-user.decorator';
import { ApiKeyGuard } from 'src/common/guards/api-key.guards';
import { TaskOwnerOrAdminGuard } from 'src/common/guards/task-owner-or-admin.guards';
import { TaskJwtGuard } from 'src/common/guards/task-jwt.guards';
import { NormalizeTaskPipe } from 'src/common/pipes/normalize-task.pipe';
import { TaskStatusValidationPipe } from 'src/common/pipes/task-status-validation.pipe';
import { TaskStatus } from 'src/common/task-status.enum';
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';

@Controller('tasks')
@UseInterceptors(LoggerInterceptor, ResponseTransformInterceptor)
export class TasksController {
    constructor(private readonly tasks: TasksService) {}

        @Get('whoami')
        async getUser(@CurrentUser() user) {
            return user ?? { message: 'no user' };
        }

        @Get()
        @UseInterceptors(CacheInterceptor)
        async findAll(
            @Query('limit', new DefaultValuePipe(10), new ParseIntPipe({ optional: true })) limit: number,
            @Query('offset', new DefaultValuePipe(0), new ParseIntPipe({ optional: true })) offset: number,
            @Query('completed') completed?: string,
            @Query('status', TaskStatusValidationPipe) status?: TaskStatus,
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
        @UsePipes(NormalizeTaskPipe)        
        @HttpCode(201)
        create(@Body() dto: CreateTaskDto) {
            return this.tasks.create(dto);
        }

        @Delete(':id')
        @UseGuards(ApiKeyGuard)
        @HttpCode(204)
        remove(
            @Param('id', new ParseUUIDPipe()) id: string
        ) {
            this.tasks.remove(id);
        }

        @Patch(':id/complete')
        @UseGuards(TaskJwtGuard, TaskOwnerOrAdminGuard)
        complete(
            @Param('id', new ParseUUIDPipe()) id: string
        ) {
            return this.tasks.complete(id);
        }

        @Patch('complete')
        @UseGuards(TaskJwtGuard)
        completeMany(
            @Body() dto: CompleteManyDto,
        ) {
            return this.tasks.completeMany(dto.ids);
        }
 
        @Patch(':id')
        @UseGuards(TaskJwtGuard, TaskOwnerOrAdminGuard)
        update(
            @Param('id', new ParseUUIDPipe()) id: string,
            @Body() dto: UpdateTaskDto,
        ) {
           return this.tasks.update(id, dto);
        }

        @Patch(':id/restore')
        @UseGuards(TaskJwtGuard, TaskOwnerOrAdminGuard)
        @HttpCode(200)
        restore(
            @Param('id', new ParseUUIDPipe()) id: string
        ) {
            return this.tasks.restore(id);
        }
}

