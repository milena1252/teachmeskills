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
import { TasksResolver } from './tasks.resolver';
import { TaskByIdLoader } from './tasks-by-id.loader';
import { UsersModule } from 'src/users/users.module';
import { PubSub } from 'graphql-subscriptions';
import { TasksSubscriptionResolver } from './tasks.subscription.resolver';

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
    UsersModule,
  ],
  controllers: [TasksController],
  providers: [
    TasksService, 
    TasksResolver,
    TasksSubscriptionResolver,
    TaskByIdLoader,
    TaskCacheProcessor,
    TaskEmailProcessor,
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}

