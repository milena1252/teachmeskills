import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { TaskCacheProcessor } from './tasks-cache.processor';
import { TaskEmailProcessor } from './task-email.processor';
import { FileStorageModule } from 'src/file-storage/file-storage.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    TypeOrmModule.forFeature([Task]),
    BullModule.registerQueue(
      { name: 'tasks' },
      { name: 'email' },
    ),
    FileStorageModule,
  ],
  controllers: [TasksController],
  providers: [
    TasksService, 
    TaskCacheProcessor,
    TaskEmailProcessor,
  ],
  exports: [TasksService],
})
export class TasksModule {}

