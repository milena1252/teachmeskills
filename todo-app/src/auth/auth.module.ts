import { DynamicModule, Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AUTH_OPTIONS, AuthModuleOptions} from './auth.constans';
import { JwtModule } from '@nestjs/jwt';


@Global()
@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        JwtModule.register({
          secret: options.secret,
          signOptions: {
            expiresIn: options.expiresIn ?? '15m',
          },
        }),
      ],
      providers: [
        {
          provide: AUTH_OPTIONS,
          useValue: options,
      },
      AuthService,
    ],
      exports: [AuthService, JwtModule],
    };
  }
}
