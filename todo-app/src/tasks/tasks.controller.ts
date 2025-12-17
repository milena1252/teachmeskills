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
import { LoggerInterceptor } from 'src/common/interceptors/logger.interceptor';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';
import { TaskPriorityPipe } from 'src/common/pipes/task-priority.pipe';
import { TaskChangeLogInterceptor } from 'src/common/interceptors/task-change-log.interceptor';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('tasks')
@UseInterceptors(LoggerInterceptor, ResponseTransformInterceptor, TaskChangeLogInterceptor)
export class TasksController {
    constructor(private readonly tasks: TasksService) {}

        @Get('whoami')
        async getUser(@CurrentUser() user) {
            return user ?? { message: 'no user' };
        }

        @Get()
        //@UseInterceptors(CacheInterceptor)
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
        // @UseInterceptors(CacheInterceptor)
        async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
            const task = await this.tasks.findOne(id);

            return task;
        }

        @Post()
        @UsePipes(TaskPriorityPipe)
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
        complete(
            @Param('id', new ParseUUIDPipe()) id: string
        ) {
            return this.tasks.complete(id);
        }

        @Patch('complete')
        //@UseGuards(TaskJwtGuard)
        completeMany(
            @Body() dto: CompleteManyDto,
        ) {
            return this.tasks.completeMany(dto.ids);
        }
 
        @Patch(':id')
        //@UsePipes(TaskPriorityPipe)
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

//52a58507-8fe5-48e8-96a3-fe8dc7860c23
//2c177609-45a1-40a5-baf9-8a922294dcc2
