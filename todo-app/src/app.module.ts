import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dbConfig from './config/db.config';
import { UsersModule } from './users/users.module';

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

    TasksModule,
    AuthModule.forRoot({
      secret: 'super-secret-key',
      tokenPrefix: 'Bearer',
     }),
    UsersModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
