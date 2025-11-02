import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_OPTIONS, LogLevel } from './logger.constants';
import { APP_CONFIG } from 'src/config/config.module';

@Injectable()
export class LoggerService {
   constructor(
        @Inject(LOGGER_OPTIONS) private readonly options: { level: LogLevel },
        @Inject(APP_CONFIG) private readonly appConfig: { debug: boolean},
    ) {}

    private prefix(level: string): string {
        return `[${level.toUpperCase()}]`;
    }

    private canLog(level: LogLevel): boolean {
        if(!this.appConfig.debug && level !== 'warn') {
            return false;
        }

        if(this.options.level === 'info' && level === 'debug') {
            return false;
        }

        return true;
    }

    debug(message: string) {
        if (this.canLog('debug')) {
            console.log(`${this.prefix('debug')} ${message}`);
        }
    }

    info(message: string) {
        if (this.canLog('info')) {
            console.log(`${this.prefix('info')} ${message}`);
        }
    }

    warn(message: string) {
        if (this.canLog('warn')) {
            console.log(`${this.prefix('warn')} ${message}`);
        }
    }

    error(message: string, trace?: string) {
        console.error(`[ERROR] ${message}`, trace ?? '');
    }
}
