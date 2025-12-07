import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
import { RpcTraceInterceptor } from './interceptors/rps-trace.interceptor';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.REDIS,
    options: { url: 'redis://localhost:6379' },
  });

  app.useGlobalInterceptors(new RpcTraceInterceptor());

  await app.listen();
}
bootstrap();
