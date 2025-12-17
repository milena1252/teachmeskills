export const AUTH_OPTIONS = 'AUTH_OPTIONS';
import { StringValue } from 'ms';

export interface AuthModuleOptions {
    secret: string;
    expiresIn?:  StringValue | number;
}