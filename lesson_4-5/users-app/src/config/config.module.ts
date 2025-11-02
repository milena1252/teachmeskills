import { DynamicModule, Module } from '@nestjs/common';

interface AppConfig {
    debug: boolean;
}

export const APP_CONFIG = 'APP_CONFIG';

@Module({})
export class ConfigModule {
    static forRoot(config: AppConfig): DynamicModule {
        return {
            module: ConfigModule,
            providers: [{ provide: APP_CONFIG, useValue: config, }],
            exports: [APP_CONFIG],
        };
    }
}
