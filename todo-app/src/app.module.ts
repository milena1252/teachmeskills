import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dbConfig from './config/db.config';
import { UsersModule } from './users/users.module';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { FileStorageModule } from './file-storage/file-storage.module';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get('db');

        return {
          ...db,
          autoLoadEntities: true,
        };
      },
    }),

    AuthModule.forRoot({
      secret: 'super-secret-key',
      expiresIn: '1h',
     }),

    BullModule.forRoot({
      redis: { 
        host: process.env.REDIS_HOST ?? 'localhost',
        port: +(process.env.REDIS_PORT ?? 6379),
      },
    }),

    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        stores: [new KeyvRedis('redis://localhost:6379')],
        ttl: 60_000,
      }),
    }),

    TasksModule,
    
    UsersModule,
    
    FileStorageModule,
    
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
