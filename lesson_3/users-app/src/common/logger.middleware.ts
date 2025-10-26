import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();

        res.on('finish', () => {
            const ms = Date.now() - start;
            const now = new Date().toISOString();
            console.log(
            `[${now}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`
            );
        });
        
        next();
    }
}