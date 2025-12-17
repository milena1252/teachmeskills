import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { TaskCacheProcessor } from './tasks-cache.processor';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    TypeOrmModule.forFeature([Task]),
    BullModule.registerQueue({ name: 'tasks' }),
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskCacheProcessor],
  exports: [TasksService],
})
export class TasksModule {}

