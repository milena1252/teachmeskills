import { Body, Controller, Get, Inject, Param, Post, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, lastValueFrom, retry, throwError } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Controller()
export class AppController {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  @Get(':id')
  getUser(@Param('id') id: number) {
    return lastValueFrom( this.client.send('get-user', { id }));
  }

  @Post()
  createUser(@Req() req, @Body() body: { name: string, email: string }) {
    const requestId = uuid();
    const traceId = req.traceId;

    const result = this.client.send('create-user', { 
        traceId,
        requestId,
        name: body.name,
        email: body.email,
       })
      .pipe(
        retry(3),
        catchError((err) => {
          console.error('[gateway] create-user failed after retries', {
            traceId,
            error: err?.message ?? err,
            requestId,
          });
          return throwError(() => new Error('user-service unavailable, try later'));
        }),
      );

      return lastValueFrom(result);
  }
}


