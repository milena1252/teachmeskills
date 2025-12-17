import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_OPTIONS, type AuthModuleOptions} from './auth.constans';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(AUTH_OPTIONS) private readonly opts: AuthModuleOptions,
    ) {}

    issueToken(userId: string): string {
        return this.jwtService.sign({
            sub: userId,
        });
    }

    verifyToken(token: string): { userId: string } {
       try {
        const payload = this.jwtService.verify(token);
        return { userId: payload.sub };
       } catch {
        throw new UnauthorizedException('Invalid token');
       }
    }
}
