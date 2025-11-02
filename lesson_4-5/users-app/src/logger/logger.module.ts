import { DynamicModule, Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LOGGER_OPTIONS, LogLevel } from './logger.constants';
import { ConfigModule } from 'src/config/config.module';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(options: { level: LogLevel }): DynamicModule {
    return {
      module: LoggerModule,
      imports: [ConfigModule.forRoot({ debug: true })],
      providers: [
        { provide: LOGGER_OPTIONS, useValue: options, },
        LoggerService,
      ],
      exports: [LoggerService],
    };
  }
}
